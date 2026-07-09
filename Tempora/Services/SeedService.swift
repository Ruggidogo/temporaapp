import Foundation
import SwiftData

/// Popola il database con dati di esempio al primo avvio.
@MainActor
final class SeedService {

    static func seedIfNeeded(context: ModelContext) {
        let key = "db_seeded_v1"
        guard !UserDefaults.standard.bool(forKey: key) else { return }

        let ds = DataService(context: context)

        // Clienti di esempio
        let clients: [Client] = [
            Client(name: "Acme Srl", color: "#6366F1", hourlyRate: 75, notes: "Cliente principale"),
            Client(name: "Studio Rossi", color: "#10B981", hourlyRate: 90),
            Client(name: "Freelance", color: "#F59E0B"),
        ]
        clients.forEach { try? ds.saveClient($0) }

        // Voci di esempio
        let cal = Calendar.current
        let now = Date()

        func makeEntry(daysAgo: Int, hoursAgo: Int, durationMinutes: Int,
                       clientIndex: Int, desc: String) -> TimeEntry {
            let start = cal.date(byAdding: .hour, value: -(hoursAgo), to:
                cal.date(byAdding: .day, value: -daysAgo, to: now)!)!
            let end = cal.date(byAdding: .minute, value: durationMinutes, to: start)!
            return TimeEntry(
                clientId: clients[clientIndex].id,
                description: desc,
                date: start.startOfDay,
                startTime: start,
                endTime: end,
                entryType: .timer
            )
        }

        let entries: [TimeEntry] = [
            makeEntry(daysAgo: 0, hoursAgo: 3, durationMinutes: 90,  clientIndex: 0, desc: "Call di allineamento"),
            makeEntry(daysAgo: 0, hoursAgo: 1, durationMinutes: 45,  clientIndex: 1, desc: "Revisione contratto"),
            makeEntry(daysAgo: 1, hoursAgo: 4, durationMinutes: 120, clientIndex: 0, desc: "Sviluppo dashboard"),
            makeEntry(daysAgo: 1, hoursAgo: 2, durationMinutes: 60,  clientIndex: 2, desc: "Design mockup"),
            makeEntry(daysAgo: 2, hoursAgo: 5, durationMinutes: 180, clientIndex: 0, desc: "API integration"),
            makeEntry(daysAgo: 3, hoursAgo: 3, durationMinutes: 90,  clientIndex: 1, desc: "Consulenza fiscale"),
            makeEntry(daysAgo: 4, hoursAgo: 2, durationMinutes: 150, clientIndex: 2, desc: "Landing page"),
        ]
        entries.forEach { try? ds.saveEntry($0) }

        UserDefaults.standard.set(true, forKey: key)
    }
}
