import Foundation
import Combine
import SwiftData
import UIKit

@MainActor
final class TimerViewModel: ObservableObject {

    // MARK: - Published state
    @Published var selectedClient: Client?
    @Published var description: String = ""
    @Published var clients: [Client] = []
    @Published var recentEntries: [(TimeEntry, Client?)] = []
    @Published var inputMode: InputMode = .timer
    @Published var errorMessage: String?

    // Manual entry fields
    @Published var manualDate: Date = Date()
    @Published var manualStart: Date = Calendar.current.date(byAdding: .hour, value: -1, to: Date()) ?? Date()
    @Published var manualEnd: Date = Date()

    // MARK: - Services
    let timerService: TimerService
    private var dataService: DataService?
    private var runningEntryId: UUID?
    private var cancellables = Set<AnyCancellable>()

    var isRunning: Bool { timerService.isRunning }
    var elapsedSeconds: Int { timerService.elapsedSeconds }

    enum InputMode: String { case timer, manual }

    init() {
        self.timerService = TimerService()
        // Propaga i cambiamenti di TimerService alla view
        timerService.objectWillChange
            .sink { [weak self] in self?.objectWillChange.send() }
            .store(in: &cancellables)
    }

    func configure(context: ModelContext) {
        dataService = DataService(context: context)
        loadClients()
        loadRecentEntries()
        restoreRunningEntry()
    }

    // MARK: - Timer

    func startTimer() {
        guard let client = selectedClient else {
            errorMessage = "Seleziona un cliente per iniziare"
            return
        }
        errorMessage = nil
        timerService.start()

        // Persist a running entry immediately so it survives app kills
        let entry = TimeEntry(
            clientId: client.id,
            description: description,
            date: Date().startOfDay,
            startTime: timerService.startDate ?? Date(),
            endTime: nil,
            entryType: .timer
        )
        if let saved = try? dataService?.saveEntry(entry) {
            runningEntryId = entry.id
            UserDefaults.standard.set(entry.id.uuidString, forKey: "running_entry_id")
        }

        Haptics.impact(.heavy)
    }

    func stopTimer() {
        guard let (start, end) = timerService.stop() else { return }

        // Complete the persisted running entry
        if let idStr = UserDefaults.standard.string(forKey: "running_entry_id"),
           let id = UUID(uuidString: idStr) {
            var entry = TimeEntry(
                id: id,
                clientId: selectedClient?.id ?? UUID(),
                description: description,
                date: start.startOfDay,
                startTime: start,
                endTime: end,
                entryType: .timer
            )
            try? dataService?.updateEntry(entry)
            UserDefaults.standard.removeObject(forKey: "running_entry_id")
            runningEntryId = nil
        }

        description = ""
        loadRecentEntries()
        Haptics.impact(.heavy)
    }

    // MARK: - Manual entry

    func saveManualEntry() {
        guard let client = selectedClient else {
            errorMessage = "Seleziona un cliente"
            return
        }
        guard manualEnd > manualStart else {
            errorMessage = "L'orario di fine deve essere dopo l'inizio"
            return
        }
        errorMessage = nil

        let entry = TimeEntry(
            clientId: client.id,
            description: description,
            date: manualDate.startOfDay,
            startTime: manualStart,
            endTime: manualEnd,
            entryType: .manual
        )
        try? dataService?.saveEntry(entry)
        description = ""
        manualStart = Calendar.current.date(byAdding: .hour, value: -1, to: Date()) ?? Date()
        manualEnd = Date()
        loadRecentEntries()
        Haptics.notification(.success)
    }

    // MARK: - Replay

    func replay(entry: TimeEntry) {
        description = entry.description
        selectedClient = clients.first { $0.id == entry.clientId }
        inputMode = .timer
        if !isRunning { startTimer() }
    }

    // MARK: - Data loading

    func loadClients() {
        clients = (try? dataService?.fetchClients()) ?? []
        if selectedClient == nil { selectedClient = clients.first }
    }

    func loadRecentEntries() {
        let all = (try? dataService?.fetchEntries()) ?? []
        let clientMap = Dictionary(uniqueKeysWithValues: clients.map { ($0.id, $0) })
        recentEntries = Array(
            all.filter { !$0.isRunning }
               .prefix(5)
               .map { ($0, clientMap[$0.clientId]) }
        )
    }

    // MARK: - Restore running entry after app restart

    private func restoreRunningEntry() {
        guard let entry = try? dataService?.fetchRunningEntry() else { return }
        selectedClient = clients.first { $0.id == entry.clientId }
        description = entry.description
        runningEntryId = entry.id
        UserDefaults.standard.set(entry.id.uuidString, forKey: "running_entry_id")
        // TimerService already restored elapsedSeconds from UserDefaults
    }
}
