import Foundation

// Manages background timer state, including app backgrounding persistence.

@MainActor
final class TimerService: ObservableObject {
    @Published var isRunning = false
    @Published var elapsedSeconds: Int = 0

    private var startDate: Date?
    private var timerTask: Task<Void, Never>?

    private let startKey = "timer_start_date"

    init() {
        restoreFromBackground()
    }

    func start() {
        let now = Date()
        startDate = now
        UserDefaults.standard.set(now, forKey: startKey)
        isRunning = true
        scheduleTask()
    }

    func stop() -> (start: Date, end: Date)? {
        guard isRunning, let start = startDate else { return nil }
        timerTask?.cancel()
        timerTask = nil
        isRunning = false
        elapsedSeconds = 0
        startDate = nil
        UserDefaults.standard.removeObject(forKey: startKey)
        return (start, Date())
    }

    private func scheduleTask() {
        timerTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                await MainActor.run { self?.tick() }
            }
        }
    }

    private func tick() {
        guard let start = startDate else { return }
        elapsedSeconds = Int(Date().timeIntervalSince(start))
    }

    private func restoreFromBackground() {
        if let saved = UserDefaults.standard.object(forKey: startKey) as? Date {
            startDate = saved
            isRunning = true
            tick()
            scheduleTask()
        }
    }
}
