import Foundation

struct Client: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var color: String
    var hourlyRate: Decimal?
    var notes: String?
    var isActive: Bool
    let createdAt: Date

    init(
        id: UUID = UUID(),
        name: String,
        color: String = "#6366F1",
        hourlyRate: Decimal? = nil,
        notes: String? = nil,
        isActive: Bool = true,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.color = color
        self.hourlyRate = hourlyRate
        self.notes = notes
        self.isActive = isActive
        self.createdAt = createdAt
    }
}
