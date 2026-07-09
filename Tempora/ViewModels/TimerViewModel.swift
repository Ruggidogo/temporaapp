import Foundation
import Combine

@MainActor
final class TimerViewModel: ObservableObject {
    @Published var isRunning = false
    @Published var elapsedSeconds: Int = 0
    @Published var selectedClient: Client?
    @Published var description: String = ""
    @Published var recentEntries: [TimeEntry] = []
    @Published var clients: [Client] = []

    private var timerTask: Task<Void, Never>?
    private var startDate: Date?

    func startTimer() {
        guard !isRunning else { return }
        isRunning = true
        startDate = Date()
        elapsedSeconds = 0

        let impact = UIImpactFeedbackGenerator(style: .heavy)
        impact.impactOccurred()

        timerTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                await MainActor.run {
                    self?.tick()
                }
            }
        }
    }

    func stopTimer() {
        guard isRunning else { return }
        timerTask?.cancel()
        timerTask = nil
        isRunning = false

        let impact = UIImpactFeedbackGenerator(style: .heavy)
        impact.impactOccurred()

        saveEntry()
        elapsedSeconds = 0
    }

    func replay(entry: TimeEntry) {
        description = entry.description
        selectedClient = clients.first { $0.id == entry.clientId }
        startTimer()
    }

    private func tick() {
        guard let start = startDate else { return }
        elapsedSeconds = Int(Date().timeIntervalSince(start))
    }

    private func saveEntry() {
        guard let client = selectedClient, let start = startDate else { return }
        let entry = TimeEntry(
            clientId: client.id,
            description: description,
            date: Date(),
            startTime: start,
            endTime: Date(),
            entryType: .timer
        )
        recentEntries.insert(entry, at: 0)
        if recentEntries.count > 5 { recentEntries.removeLast() }
        description = ""
    }
}
