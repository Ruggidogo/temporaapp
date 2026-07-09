import Foundation

struct Client: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var color: String        // Hex, e.g. "#10B981"
    var hourlyRate: Decimal? // EUR
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

extension Client {
    static let palette: [String] = [
        "#6366F1", "#A855F7", "#10B981", "#F59E0B",
        "#EF4444", "#3B82F6", "#EC4899", "#14B8A6"
    ]
}
