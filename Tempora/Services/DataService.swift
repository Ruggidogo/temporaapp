import Foundation
import SwiftData

@MainActor
final class DataService {

    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    // MARK: - Clients

    func fetchClients(activeOnly: Bool = true) throws -> [Client] {
        var descriptor = FetchDescriptor<ClientModel>(
            sortBy: [SortDescriptor(\.name)]
        )
        if activeOnly {
            descriptor.predicate = #Predicate { $0.isActive == true }
        }
        return try context.fetch(descriptor).map { $0.toClient() }
    }

    @discardableResult
    func saveClient(_ client: Client) throws -> ClientModel {
        let model = ClientModel(from: client)
        context.insert(model)
        try context.save()
        return model
    }

    func updateClient(_ client: Client) throws {
        let id = client.id
        let descriptor = FetchDescriptor<ClientModel>(
            predicate: #Predicate { $0.id == id }
        )
        guard let model = try context.fetch(descriptor).first else { return }
        model.name = client.name
        model.color = client.color
        model.hourlyRateDouble = client.hourlyRate.map { NSDecimalNumber(decimal: $0).doubleValue }
        model.notes = client.notes
        model.isActive = client.isActive
        try context.save()
    }

    func archiveClient(id: UUID) throws {
        let descriptor = FetchDescriptor<ClientModel>(
            predicate: #Predicate { $0.id == id }
        )
        guard let model = try context.fetch(descriptor).first else { return }
        model.isActive = false
        try context.save()
    }

    func deleteClient(id: UUID) throws {
        let descriptor = FetchDescriptor<ClientModel>(
            predicate: #Predicate { $0.id == id }
        )
        if let model = try context.fetch(descriptor).first {
            context.delete(model)
            try context.save()
        }
    }

    // MARK: - Time Entries

    func fetchEntries(from start: Date? = nil, to end: Date? = nil) throws -> [TimeEntry] {
        var descriptor = FetchDescriptor<TimeEntryModel>(
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        if let start, let end {
            descriptor.predicate = #Predicate { $0.date >= start && $0.date <= end }
        } else if let start {
            descriptor.predicate = #Predicate { $0.date >= start }
        }
        return try context.fetch(descriptor).map { $0.toTimeEntry() }
    }

    func fetchRunningEntry() throws -> TimeEntry? {
        let timerType = EntryType.timer.rawValue
        let descriptor = FetchDescriptor<TimeEntryModel>(
            predicate: #Predicate { $0.entryType == timerType && $0.endTime == nil }
        )
        return try context.fetch(descriptor).first?.toTimeEntry()
    }

    @discardableResult
    func saveEntry(_ entry: TimeEntry) throws -> TimeEntryModel {
        let clientId = entry.clientId
        let clientDescriptor = FetchDescriptor<ClientModel>(
            predicate: #Predicate { $0.id == clientId }
        )
        let clientModel = try context.fetch(clientDescriptor).first

        var projectModel: ProjectModel?
        if let pid = entry.projectId {
            let projectDescriptor = FetchDescriptor<ProjectModel>(
                predicate: #Predicate { $0.id == pid }
            )
            projectModel = try context.fetch(projectDescriptor).first
        }

        let model = TimeEntryModel(from: entry, client: clientModel, project: projectModel)
        context.insert(model)
        try context.save()
        return model
    }

    func updateEntry(_ entry: TimeEntry) throws {
        let id = entry.id
        let descriptor = FetchDescriptor<TimeEntryModel>(
            predicate: #Predicate { $0.id == id }
        )
        guard let model = try context.fetch(descriptor).first else { return }
        model.descriptionText = entry.description
        model.date = entry.date
        model.startTime = entry.startTime
        model.endTime = entry.endTime
        model.durationMinutes = entry.durationMinutes
        model.entryType = entry.entryType.rawValue
        model.tags = entry.tags

        if let clientId = Optional(entry.clientId) {
            let clientDescriptor = FetchDescriptor<ClientModel>(
                predicate: #Predicate { $0.id == clientId }
            )
            model.client = try context.fetch(clientDescriptor).first
        }
        try context.save()
    }

    func deleteEntry(id: UUID) throws {
        let descriptor = FetchDescriptor<TimeEntryModel>(
            predicate: #Predicate { $0.id == id }
        )
        if let model = try context.fetch(descriptor).first {
            context.delete(model)
            try context.save()
        }
    }

    func stopRunningEntry(endTime: Date) throws {
        let timerType = EntryType.timer.rawValue
        let descriptor = FetchDescriptor<TimeEntryModel>(
            predicate: #Predicate { $0.entryType == timerType && $0.endTime == nil }
        )
        for model in try context.fetch(descriptor) {
            model.endTime = endTime
        }
        try context.save()
    }
}
