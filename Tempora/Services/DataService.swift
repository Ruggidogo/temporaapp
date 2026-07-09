import Foundation
import SwiftData

@MainActor
final class DataService: ObservableObject {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    // MARK: - Clients

    func fetchClients() throws -> [Client] {
        let descriptor = FetchDescriptor<ClientModel>(
            predicate: #Predicate { $0.isActive },
            sortBy: [SortDescriptor(\.name)]
        )
        return try context.fetch(descriptor).map { $0.toClient() }
    }

    func saveClient(_ client: Client) throws {
        let model = ClientModel(from: client)
        context.insert(model)
        try context.save()
    }

    func updateClient(_ client: Client) throws {
        let id = client.id
        let descriptor = FetchDescriptor<ClientModel>(predicate: #Predicate { $0.id == id })
        guard let model = try context.fetch(descriptor).first else { return }
        model.name = client.name
        model.color = client.color
        model.hourlyRate = client.hourlyRate
        model.notes = client.notes
        model.isActive = client.isActive
        try context.save()
    }

    func deleteClient(id: UUID) throws {
        let descriptor = FetchDescriptor<ClientModel>(predicate: #Predicate { $0.id == id })
        if let model = try context.fetch(descriptor).first {
            context.delete(model)
            try context.save()
        }
    }

    // MARK: - Time Entries

    func fetchEntries(for period: DateInterval? = nil) throws -> [TimeEntry] {
        var descriptor = FetchDescriptor<TimeEntryModel>(
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        if let interval = period {
            let start = interval.start
            let end = interval.end
            descriptor.predicate = #Predicate { $0.date >= start && $0.date <= end }
        }
        return try context.fetch(descriptor).map { $0.toTimeEntry() }
    }

    func saveEntry(_ entry: TimeEntry) throws {
        let clientId = entry.clientId
        let clientDescriptor = FetchDescriptor<ClientModel>(predicate: #Predicate { $0.id == clientId })
        let clientModel = try context.fetch(clientDescriptor).first

        let projectModel: ProjectModel? = try {
            guard let pid = entry.projectId else { return nil }
            let desc = FetchDescriptor<ProjectModel>(predicate: #Predicate { $0.id == pid })
            return try context.fetch(desc).first
        }()

        let model = TimeEntryModel(from: entry, client: clientModel, project: projectModel)
        context.insert(model)
        try context.save()
    }

    func deleteEntry(id: UUID) throws {
        let descriptor = FetchDescriptor<TimeEntryModel>(predicate: #Predicate { $0.id == id })
        if let model = try context.fetch(descriptor).first {
            context.delete(model)
            try context.save()
        }
    }

    func activeTimerEntry() throws -> TimeEntry? {
        let descriptor = FetchDescriptor<TimeEntryModel>(
            predicate: #Predicate { $0.endTime == nil && $0.entryType == "timer" }
        )
        return try context.fetch(descriptor).first?.toTimeEntry()
    }
}
