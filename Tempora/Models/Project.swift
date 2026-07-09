import Foundation

struct Project: Identifiable, Codable, Hashable {
    let id: UUID
    var clientId: UUID
    var name: String
    var description: String?
    var status: ProjectStatus
    let createdAt: Date

    init(
        id: UUID = UUID(),
        clientId: UUID,
        name: String,
        description: String? = nil,
        status: ProjectStatus = .active,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.clientId = clientId
        self.name = name
        self.description = description
        self.status = status
        self.createdAt = createdAt
    }
}

enum ProjectStatus: String, Codable, CaseIterable {
    case active
    case completed
    case paused

    var label: String {
        switch self {
        case .active: return "Attivo"
        case .completed: return "Completato"
        case .paused: return "In pausa"
        }
    }
}
