import Foundation

struct TimeEntry: Identifiable, Codable, Hashable {
    let id: UUID
    var clientId: UUID
    var projectId: UUID?
    var description: String
    var date: Date
    var startTime: Date
    var endTime: Date?
    var durationMinutes: Int?  // Used for manual entries
    var entryType: EntryType
    var tags: [String]
    let createdAt: Date

    init(
        id: UUID = UUID(),
        clientId: UUID,
        projectId: UUID? = nil,
        description: String = "",
        date: Date = Date(),
        startTime: Date = Date(),
        endTime: Date? = nil,
        durationMinutes: Int? = nil,
        entryType: EntryType = .timer,
        tags: [String] = [],
        createdAt: Date = Date()
    ) {
        self.id = id
        self.clientId = clientId
        self.projectId = projectId
        self.description = description
        self.date = date
        self.startTime = startTime
        self.endTime = endTime
        self.durationMinutes = durationMinutes
        self.entryType = entryType
        self.tags = tags
        self.createdAt = createdAt
    }

    var isRunning: Bool {
        endTime == nil && entryType == .timer
    }

    var calculatedDurationMinutes: Int {
        if let d = durationMinutes { return d }
        let end = endTime ?? Date()
        return max(0, Int(end.timeIntervalSince(startTime) / 60))
    }

    func value(hourlyRate: Decimal?) -> Decimal? {
        guard let rate = hourlyRate else { return nil }
        let hours = Decimal(calculatedDurationMinutes) / 60
        var result = rate * hours
        var rounded = Decimal()
        NSDecimalRound(&rounded, &result, 2, .plain)
        return rounded
    }
}

enum EntryType: String, Codable, CaseIterable {
    case timer  = "timer"
    case manual = "manual"
}
