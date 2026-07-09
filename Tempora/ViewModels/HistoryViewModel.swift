import Foundation

@MainActor
final class HistoryViewModel: ObservableObject {
    @Published var entries: [TimeEntry] = []
    @Published var clients: [Client] = []
    @Published var searchText: String = ""
    @Published var selectedPeriod: HistoryPeriod = .week

    enum HistoryPeriod: String, CaseIterable {
        case today = "Oggi"
        case week = "Settimana"
        case month = "Mese"
        case custom = "Personalizzato"
    }

    var filteredEntries: [TimeEntry] {
        let periodFiltered = entries.filter { inPeriod($0) }
        guard !searchText.isEmpty else { return periodFiltered }
        return periodFiltered.filter {
            $0.description.localizedCaseInsensitiveContains(searchText)
        }
    }

    var groupedEntries: [(Date, [TimeEntry])] {
        let grouped = Dictionary(grouping: filteredEntries) { $0.date.startOfDay }
        return grouped.sorted { $0.key > $1.key }
    }

    private func inPeriod(_ entry: TimeEntry) -> Bool {
        switch selectedPeriod {
        case .today: return entry.date.isToday
        case .week: return entry.date.isThisWeek
        case .month: return entry.date.isThisMonth
        case .custom: return true
        }
    }
}
