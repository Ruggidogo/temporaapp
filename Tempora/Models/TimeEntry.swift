import Foundation

struct TimeEntry: Identifiable, Codable, Hashable {
    let id: UUID
    var clientId: UUID
    var projectId: UUID?
    var description: String
    var date: Date
    var startTime: Date
    var endTime: Date?
    var durationMinutes: Int?
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
        if let duration = durationMinutes {
            return duration
        }
        guard let end = endTime else {
            return Int(Date().timeIntervalSince(startTime) / 60)
        }
        return Int(end.timeIntervalSince(startTime) / 60)
    }

    func value(for client: Client?) -> Decimal? {
        guard let rate = client?.hourlyRate else { return nil }
        let hours = Decimal(calculatedDurationMinutes) / 60
        return (rate * hours).rounded(scale: 2)
    }
}

enum EntryType: String, Codable {
    case timer
    case manual
}

private extension Decimal {
    func rounded(scale: Int) -> Decimal {
        var result = Decimal()
        var source = self
        NSDecimalRound(&result, &source, scale, .plain)
        return result
    }
}
