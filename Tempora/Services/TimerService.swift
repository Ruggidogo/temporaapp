import Foundation
import Combine

/// Manages the running timer state across app lifecycle.
/// Persists start time in UserDefaults so it survives backgrounding.
@MainActor
final class TimerService: ObservableObject {

    @Published private(set) var isRunning = false
    @Published private(set) var elapsedSeconds: Int = 0

    private(set) var startDate: Date?
    private var tickTask: Task<Void, Never>?

    private let startKey = "tempora_timer_start"

    init() {
        if let saved = UserDefaults.standard.object(forKey: startKey) as? Date {
            startDate = saved
            isRunning = true
            elapsedSeconds = Int(Date().timeIntervalSince(saved))
            beginTicking()
        }
    }

    func start() {
        guard !isRunning else { return }
        let now = Date()
        startDate = now
        UserDefaults.standard.set(now, forKey: startKey)
        isRunning = true
        elapsedSeconds = 0
        beginTicking()
    }

    /// Returns (start, end) so the caller can persist the entry.
    @discardableResult
    func stop() -> (start: Date, end: Date)? {
        guard isRunning, let start = startDate else { return nil }
        tickTask?.cancel()
        tickTask = nil
        isRunning = false
        elapsedSeconds = 0
        startDate = nil
        UserDefaults.standard.removeObject(forKey: startKey)
        return (start, Date())
    }

    private func beginTicking() {
        tickTask?.cancel()
        tickTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                guard let self, let start = self.startDate else { break }
                self.elapsedSeconds = Int(Date().timeIntervalSince(start))
            }
        }
    }
}
