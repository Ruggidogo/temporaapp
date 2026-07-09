import Foundation
import SwiftData

@MainActor
final class ReportsViewModel: ObservableObject {

    @Published var entries: [TimeEntry] = []
    @Published var clients: [Client] = []
    @Published var period: Period = .week
    @Published var referenceDate: Date = Date()

    enum Period: String, CaseIterable {
        case day   = "Giorno"
        case week  = "Settimana"
        case month = "Mese"
        case year  = "Anno"
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
        entries = (try? dataService?.fetchEntries(from: rangeStart, to: rangeEnd)) ?? []
    }

    func navigate(by offset: Int) {
        let component: Calendar.Component
        switch period {
        case .day:   component = .day
        case .week:  component = .weekOfYear
        case .month: component = .month
        case .year:  component = .year
        }
        referenceDate = Calendar.current.date(byAdding: component, value: offset, to: referenceDate) ?? referenceDate
        load()
    }

    // MARK: - Computed

    var totalMinutes: Int { entries.reduce(0) { $0 + $1.calculatedDurationMinutes } }

    var totalValue: Decimal {
        entries.reduce(.zero) { sum, e in
            sum + (e.value(hourlyRate: clientMap[e.clientId]?.hourlyRate) ?? 0)
        }
    }

    var minutesByClient: [(client: Client, minutes: Int)] {
        var acc: [UUID: Int] = [:]
        for e in entries { acc[e.clientId, default: 0] += e.calculatedDurationMinutes }
        return acc.compactMap { id, mins in
            clientMap[id].map { (client: $0, minutes: mins) }
        }.sorted { $0.minutes > $1.minutes }
    }

    struct DailyPoint: Identifiable {
        let id: Date
        let date: Date
        let minutes: Int
        let clientId: UUID
    }

    var dailyPoints: [DailyPoint] {
        entries.map { e in
            DailyPoint(id: e.id, date: e.date.startOfDay, minutes: e.calculatedDurationMinutes, clientId: e.clientId)
        }
    }

    var rangeLabel: String {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "it_IT")
        switch period {
        case .day:
            fmt.dateFormat = "d MMMM yyyy"
            return fmt.string(from: referenceDate)
        case .week:
            fmt.dateFormat = "d MMM"
            let end = Calendar.current.date(byAdding: .day, value: 6, to: rangeStart)!
            return "\(fmt.string(from: rangeStart)) – \(fmt.string(from: end))"
        case .month:
            fmt.dateFormat = "MMMM yyyy"
            return fmt.string(from: referenceDate).capitalized
        case .year:
            fmt.dateFormat = "yyyy"
            return fmt.string(from: referenceDate)
        }
    }

    private var rangeStart: Date {
        let cal = Calendar.current
        switch period {
        case .day:
            return referenceDate.startOfDay
        case .week:
            return cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: referenceDate))!
        case .month:
            return cal.date(from: cal.dateComponents([.year, .month], from: referenceDate))!
        case .year:
            return cal.date(from: cal.dateComponents([.year], from: referenceDate))!
        }
    }

    private var rangeEnd: Date {
        let cal = Calendar.current
        switch period {
        case .day:   return referenceDate.endOfDay
        case .week:  return cal.date(byAdding: .weekOfYear, value: 1, to: rangeStart)!.addingTimeInterval(-1)
        case .month: return cal.date(byAdding: .month, value: 1, to: rangeStart)!.addingTimeInterval(-1)
        case .year:  return cal.date(byAdding: .year, value: 1, to: rangeStart)!.addingTimeInterval(-1)
        }
    }
}
