import Foundation
import SwiftData

@MainActor
final class TimerViewModel: ObservableObject {

    // MARK: - Published state
    @Published var selectedClient: Client?
    @Published var description: String = ""
    @Published var clients: [Client] = []
    @Published var recentEntries: [(TimeEntry, Client?)] = []
    @Published var inputMode: InputMode = .timer

    // Manual entry fields
    @Published var manualDate: Date = Date()
    @Published var manualStart: Date = Date()
    @Published var manualEnd: Date = Date()

    // MARK: - Services
    let timerService: TimerService
    private var dataService: DataService?

    var isRunning: Bool { timerService.isRunning }
    var elapsedSeconds: Int { timerService.elapsedSeconds }

    enum InputMode { case timer, manual }

    init(timerService: TimerService = TimerService()) {
        self.timerService = timerService
    }

    func configure(context: ModelContext) {
        dataService = DataService(context: context)
        loadClients()
        loadRecentEntries()
    }

    // MARK: - Timer actions

    func startTimer() {
        guard selectedClient != nil else { return }
        timerService.start()
    }

    func stopTimer() {
        guard let (start, end) = timerService.stop(),
              let client = selectedClient else { return }

        let entry = TimeEntry(
            clientId: client.id,
            description: description,
            date: start.startOfDay,
            startTime: start,
            endTime: end,
            entryType: .timer
        )
        save(entry: entry)
        description = ""
        loadRecentEntries()
    }

    // MARK: - Manual entry

    func saveManualEntry() {
        guard let client = selectedClient else { return }
        let entry = TimeEntry(
            clientId: client.id,
            description: description,
            date: manualDate.startOfDay,
            startTime: manualStart,
            endTime: manualEnd,
            entryType: .manual
        )
        save(entry: entry)
        description = ""
        loadRecentEntries()
    }

    // MARK: - Replay

    func replay(entry: TimeEntry) {
        description = entry.description
        selectedClient = clients.first { $0.id == entry.clientId }
        inputMode = .timer
        timerService.start()
    }

    // MARK: - Data

    private func loadClients() {
        clients = (try? dataService?.fetchClients()) ?? []
    }

    private func loadRecentEntries() {
        let entries = (try? dataService?.fetchEntries()) ?? []
        let clientMap = Dictionary(uniqueKeysWithValues: clients.map { ($0.id, $0) })
        recentEntries = Array(
            entries
                .filter { !$0.isRunning }
                .prefix(5)
                .map { ($0, clientMap[$0.clientId]) }
        )
    }

    private func save(entry: TimeEntry) {
        try? dataService?.saveEntry(entry)
    }
}
