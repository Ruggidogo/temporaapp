import Foundation

@MainActor
final class ReportsViewModel: ObservableObject {
    @Published var entries: [TimeEntry] = []
    @Published var clients: [Client] = []
    @Published var selectedPeriod: ReportPeriod = .week

    enum ReportPeriod: String, CaseIterable {
        case day = "Giorno"
        case week = "Settimana"
        case month = "Mese"
        case year = "Anno"
    }

    var totalMinutes: Int {
        entries.reduce(0) { $0 + $1.calculatedDurationMinutes }
    }

    var totalHoursLabel: String {
        Formatters.formatDurationShort(minutes: totalMinutes)
    }

    var totalValue: Decimal {
        entries.reduce(Decimal.zero) { sum, entry in
            let client = clients.first { $0.id == entry.clientId }
            return sum + (entry.value(for: client) ?? 0)
        }
    }

    var minutesByClient: [(Client, Int)] {
        clients.compactMap { client in
            let mins = entries.filter { $0.clientId == client.id }
                              .reduce(0) { $0 + $1.calculatedDurationMinutes }
            return mins > 0 ? (client, mins) : nil
        }.sorted { $0.1 > $1.1 }
    }
}
