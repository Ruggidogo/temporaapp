import Foundation
import Combine
import SwiftData

@MainActor
final class HistoryViewModel: ObservableObject {

    @Published var allEntries: [TimeEntry] = []
    @Published var clients: [Client] = []
    @Published var searchText: String = ""
    @Published var selectedPeriod: Period = .week
    @Published var selectedClientFilter: Set<UUID> = []

    enum Period: String, CaseIterable {
        case today  = "Oggi"
        case week   = "Settimana"
        case month  = "Mese"
        case custom = "Personalizzato"
    }

    private var dataService: DataService?
    private var clientMap: [UUID: Client] = [:]

    func configure(context: ModelContext) {
        dataService = DataService(context: context)
        load()
    }

    func load() {
        clients = (try? dataService?.fetchClients(activeOnly: false)) ?? []
        clientMap = Dictionary(uniqueKeysWithValues: clients.map { ($0.id, $0) })
        allEntries = (try? dataService?.fetchEntries()) ?? []
    }

    func client(for entry: TimeEntry) -> Client? { clientMap[entry.clientId] }

    var filtered: [TimeEntry] {
        allEntries
            .filter { periodMatches($0) }
            .filter { selectedClientFilter.isEmpty || selectedClientFilter.contains($0.clientId) }
            .filter {
                searchText.isEmpty ||
                $0.description.localizedCaseInsensitiveContains(searchText) ||
                (clientMap[$0.clientId]?.name.localizedCaseInsensitiveContains(searchText) ?? false)
            }
    }

    var grouped: [(key: Date, entries: [TimeEntry])] {
        let g = Dictionary(grouping: filtered) { $0.date.startOfDay }
        return g.sorted { $0.key > $1.key }.map { (key: $0.key, entries: $0.value) }
    }

    func totalMinutes(for entries: [TimeEntry]) -> Int {
        entries.reduce(0) { $0 + $1.calculatedDurationMinutes }
    }

    func delete(entry: TimeEntry) {
        try? dataService?.deleteEntry(id: entry.id)
        allEntries.removeAll { $0.id == entry.id }
    }

    private func periodMatches(_ entry: TimeEntry) -> Bool {
        switch selectedPeriod {
        case .today:  return entry.date.isToday
        case .week:   return entry.date >= Date.startOfWeek
        case .month:  return entry.date >= Date.startOfMonth
        case .custom: return true
        }
    }
}
