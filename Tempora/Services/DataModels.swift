import Foundation
import SwiftData

// MARK: - ClientModel

@Model
final class ClientModel {
    @Attribute(.unique) var id: UUID
    var name: String
    var color: String
    var hourlyRateDouble: Double? // Decimal stored as Double (SwiftData limitation)
    var notes: String?
    var isActive: Bool
    var createdAt: Date

    @Relationship(deleteRule: .cascade, inverse: \TimeEntryModel.client)
    var entries: [TimeEntryModel] = []

    @Relationship(deleteRule: .cascade, inverse: \ProjectModel.client)
    var projects: [ProjectModel] = []

    init(
        id: UUID = UUID(),
        name: String,
        color: String = "#6366F1",
        hourlyRateDouble: Double? = nil,
        notes: String? = nil,
        isActive: Bool = true,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.color = color
        self.hourlyRateDouble = hourlyRateDouble
        self.notes = notes
        self.isActive = isActive
        self.createdAt = createdAt
    }

    convenience init(from client: Client) {
        self.init(
            id: client.id,
            name: client.name,
            color: client.color,
            hourlyRateDouble: client.hourlyRate.map { NSDecimalNumber(decimal: $0).doubleValue },
            notes: client.notes,
            isActive: client.isActive,
            createdAt: client.createdAt
        )
    }

    func toClient() -> Client {
        Client(
            id: id,
            name: name,
            color: color,
            hourlyRate: hourlyRateDouble.map { Decimal($0) },
            notes: notes,
            isActive: isActive,
            createdAt: createdAt
        )
    }
}

// MARK: - ProjectModel

@Model
final class ProjectModel {
    @Attribute(.unique) var id: UUID
    var name: String
    var projectDescription: String?
    var status: String
    var createdAt: Date
    var client: ClientModel?

    @Relationship(deleteRule: .nullify, inverse: \TimeEntryModel.project)
    var entries: [TimeEntryModel] = []

    init(
        id: UUID = UUID(),
        name: String,
        projectDescription: String? = nil,
        status: String = ProjectStatus.active.rawValue,
        createdAt: Date = Date(),
        client: ClientModel? = nil
    ) {
        self.id = id
        self.name = name
        self.projectDescription = projectDescription
        self.status = status
        self.createdAt = createdAt
        self.client = client
    }

    convenience init(from project: Project, client: ClientModel?) {
        self.init(
            id: project.id,
            name: project.name,
            projectDescription: project.description,
            status: project.status.rawValue,
            createdAt: project.createdAt,
            client: client
        )
    }

    func toProject() -> Project {
        Project(
            id: id,
            clientId: client?.id ?? UUID(),
            name: name,
            description: projectDescription,
            status: ProjectStatus(rawValue: status) ?? .active,
            createdAt: createdAt
        )
    }
}

// MARK: - TimeEntryModel

@Model
final class TimeEntryModel {
    @Attribute(.unique) var id: UUID
    var descriptionText: String
    var date: Date
    var startTime: Date
    var endTime: Date?
    var durationMinutes: Int?
    var entryType: String
    var tags: [String]
    var createdAt: Date
    var client: ClientModel?
    var project: ProjectModel?

    init(
        id: UUID = UUID(),
        descriptionText: String = "",
        date: Date = Date(),
        startTime: Date = Date(),
        endTime: Date? = nil,
        durationMinutes: Int? = nil,
        entryType: String = EntryType.timer.rawValue,
        tags: [String] = [],
        createdAt: Date = Date(),
        client: ClientModel? = nil,
        project: ProjectModel? = nil
    ) {
        self.id = id
        self.descriptionText = descriptionText
        self.date = date
        self.startTime = startTime
        self.endTime = endTime
        self.durationMinutes = durationMinutes
        self.entryType = entryType
        self.tags = tags
        self.createdAt = createdAt
        self.client = client
        self.project = project
    }

    convenience init(from entry: TimeEntry, client: ClientModel?, project: ProjectModel?) {
        self.init(
            id: entry.id,
            descriptionText: entry.description,
            date: entry.date,
            startTime: entry.startTime,
            endTime: entry.endTime,
            durationMinutes: entry.durationMinutes,
            entryType: entry.entryType.rawValue,
            tags: entry.tags,
            createdAt: entry.createdAt,
            client: client,
            project: project
        )
    }

    func toTimeEntry() -> TimeEntry {
        TimeEntry(
            id: id,
            clientId: client?.id ?? UUID(),
            projectId: project?.id,
            description: descriptionText,
            date: date,
            startTime: startTime,
            endTime: endTime,
            durationMinutes: durationMinutes,
            entryType: EntryType(rawValue: entryType) ?? .timer,
            tags: tags,
            createdAt: createdAt
        )
    }
}
