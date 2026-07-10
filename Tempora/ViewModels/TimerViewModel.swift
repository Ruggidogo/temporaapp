import Foundation
import Combine
import SwiftData

@MainActor
final class TimerViewModel: ObservableObject {

    // MARK: - Timer state (tutto @Published → SwiftUI re-render garantito)
    @Published var elapsedSeconds: Int = 0
    @Published var isRunning = false
    @Published var selectedClient: Client?
    @Published var entryDescription = ""
    @Published var clients: [Client] = []
    @Published var recentEntries: [(entry: TimeEntry, client: Client?)] = []

    private var startDate: Date?
    private var tickTask: Task<Void, Never>?
    private var dataService: DataService?

    // MARK: - Setup

    func setup(context: ModelContext) {
        dataService = DataService(context: context)
        reloadClients()
        reloadRecent()
        restoreRunning()
    }

    // MARK: - Timer controls

    func toggleTimer() {
        isRunning ? stop() : start()
    }

    private func start() {
        guard selectedClient != nil else { return }
        let now = Date()
        startDate = now
        isRunning = true
        elapsedSeconds = 0

        // Salva entry running in SwiftData (persiste anche se l'app viene killata)
        if let client = selectedClient {
            let entry = TimeEntry(
                clientId: client.id,
                description: entryDescription,
                date: now.startOfDay,
                startTime: now,
                entryType: .timer
            )
            try? dataService?.saveEntry(entry)
            UserDefaults.standard.set(entry.id.uuidString, forKey: "tempora_running_id")
            UserDefaults.standard.set(now, forKey: "tempora_running_start")
        }

        Haptics.impact(.heavy)
        scheduleTick()
    }

    private func stop() {
        tickTask?.cancel()
        tickTask = nil
        isRunning = false

        let end = Date()

        // Completa entry in SwiftData
        if let idStr = UserDefaults.standard.string(forKey: "tempora_running_id"),
           let id = UUID(uuidString: idStr),
           let start = UserDefaults.standard.object(forKey: "tempora_running_start") as? Date {
            var entry = TimeEntry(
                id: id,
                clientId: selectedClient?.id ?? UUID(),
                description: entryDescription,
                date: start.startOfDay,
                startTime: start,
                endTime: end,
                entryType: .timer
            )
            try? dataService?.updateEntry(entry)
        }

        UserDefaults.standard.removeObject(forKey: "tempora_running_id")
        UserDefaults.standard.removeObject(forKey: "tempora_running_start")

        elapsedSeconds = 0
        startDate = nil
        entryDescription = ""
        reloadRecent()
        Haptics.impact(.heavy)
    }

    // MARK: - Manual save

    func saveManual(start: Date, end: Date, date: Date) {
        guard let client = selectedClient, end > start else { return }
        let entry = TimeEntry(
            clientId: client.id,
            description: entryDescription,
            date: date.startOfDay,
            startTime: start,
            endTime: end,
            entryType: .manual
        )
        try? dataService?.saveEntry(entry)
        entryDescription = ""
        reloadRecent()
        Haptics.notification(.success)
    }

    // MARK: - Replay

    func replay(_ entry: TimeEntry) {
        entryDescription = entry.description
        selectedClient = clients.first { $0.id == entry.clientId } ?? selectedClient
        if !isRunning { start() }
    }

    // MARK: - Private helpers

    private func scheduleTick() {
        tickTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                guard let self, let start = self.startDate else { break }
                self.elapsedSeconds = Int(Date().timeIntervalSince(start))
            }
        }
    }

    private func restoreRunning() {
        guard let start = UserDefaults.standard.object(forKey: "tempora_running_start") as? Date,
              let _ = UserDefaults.standard.string(forKey: "tempora_running_id") else { return }
        startDate = start
        isRunning = true
        elapsedSeconds = Int(Date().timeIntervalSince(start))
        scheduleTick()
    }

    func reloadClients() {
        clients = (try? dataService?.fetchClients()) ?? []
        if selectedClient == nil { selectedClient = clients.first }
    }

    func reloadRecent() {
        let all = (try? dataService?.fetchEntries()) ?? []
        let map = Dictionary(uniqueKeysWithValues: clients.map { ($0.id, $0) })
        recentEntries = Array(all.filter { !$0.isRunning }.prefix(5).map { (entry: $0, client: map[$0.clientId]) })
    }
}
