import Foundation
import SwiftData

// MARK: - SwiftData Models

@Model
final class ClientModel {
    @Attribute(.unique) var id: UUID
    var name: String
    var color: String
    var hourlyRateValue: Double?
    var notes: String?
    var isActive: Bool
    var createdAt: Date

    @Relationship(deleteRule: .cascade, inverse: \TimeEntryModel.client)
    var entries: [TimeEntryModel]?

    @Relationship(deleteRule: .cascade, inverse: \ProjectModel.client)
    var projects: [ProjectModel]?

    init(from client: Client) {
        self.id = client.id
        self.name = client.name
        self.color = client.color
        self.hourlyRateValue = client.hourlyRate.map { NSDecimalNumber(decimal: $0).doubleValue }
        self.notes = client.notes
        self.isActive = client.isActive
        self.createdAt = client.createdAt
    }

    init(
        id: UUID = UUID(),
        name: String,
        color: String = "#6366F1",
        hourlyRateValue: Double? = nil,
        notes: String? = nil,
        isActive: Bool = true,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.color = color
        self.hourlyRateValue = hourlyRateValue
        self.notes = notes
        self.isActive = isActive
        self.createdAt = createdAt
    }

    var hourlyRate: Decimal? {
        get { hourlyRateValue.map { Decimal($0) } }
        set { hourlyRateValue = newValue.map { NSDecimalNumber(decimal: $0).doubleValue } }
    }

    func toClient() -> Client {
        Client(
            id: id,
            name: name,
            color: color,
            hourlyRate: hourlyRate,
            notes: notes,
            isActive: isActive,
            createdAt: createdAt
        )
    }
}

@Model
final class TimeEntryModel {
    @Attribute(.unique) var id: UUID
    var client: ClientModel?
    var project: ProjectModel?
    var descriptionText: String
    var date: Date
    var startTime: Date
    var endTime: Date?
    var durationMinutes: Int?
    var entryType: String
    var tags: [String]
    var createdAt: Date

    init(from entry: TimeEntry, client: ClientModel?, project: ProjectModel?) {
        self.id = entry.id
        self.client = client
        self.project = project
        self.descriptionText = entry.description
        self.date = entry.date
        self.startTime = entry.startTime
        self.endTime = entry.endTime
        self.durationMinutes = entry.durationMinutes
        self.entryType = entry.entryType.rawValue
        self.tags = entry.tags
        self.createdAt = entry.createdAt
    }

    init(
        id: UUID = UUID(),
        client: ClientModel? = nil,
        project: ProjectModel? = nil,
        descriptionText: String = "",
        date: Date = Date(),
        startTime: Date = Date(),
        endTime: Date? = nil,
        durationMinutes: Int? = nil,
        entryType: String = EntryType.timer.rawValue,
        tags: [String] = [],
        createdAt: Date = Date()
    ) {
        self.id = id
        self.client = client
        self.project = project
        self.descriptionText = descriptionText
        self.date = date
        self.startTime = startTime
        self.endTime = endTime
        self.durationMinutes = durationMinutes
        self.entryType = entryType
        self.tags = tags
        self.createdAt = createdAt
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

@Model
final class ProjectModel {
    @Attribute(.unique) var id: UUID
    var client: ClientModel?
    var name: String
    var projectDescription: String?
    var status: String
    var createdAt: Date

    init(from project: Project, client: ClientModel?) {
        self.id = project.id
        self.client = client
        self.name = project.name
        self.projectDescription = project.description
        self.status = project.status.rawValue
        self.createdAt = project.createdAt
    }

    init(
        id: UUID = UUID(),
        client: ClientModel? = nil,
        name: String,
        projectDescription: String? = nil,
        status: String = ProjectStatus.active.rawValue,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.client = client
        self.name = name
        self.projectDescription = projectDescription
        self.status = status
        self.createdAt = createdAt
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
