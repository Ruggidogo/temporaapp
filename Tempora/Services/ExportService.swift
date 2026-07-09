import Foundation

final class ExportService {

    func csvString(entries: [TimeEntry], clients: [Client]) -> String {
        let clientMap = Dictionary(uniqueKeysWithValues: clients.map { ($0.id, $0) })
        var rows = ["Data,Cliente,Descrizione,Inizio,Fine,Durata (min),Valore (EUR)"]

        for entry in entries {
            let client = clientMap[entry.clientId]
            let rate = client?.hourlyRate
            let valueStr = entry.value(hourlyRate: rate)
                .map { Formatters.currency($0) } ?? ""

            let row = [
                Formatters.date(entry.date),
                csvEscape(client?.name ?? ""),
                csvEscape(entry.description),
                Formatters.time(entry.startTime),
                entry.endTime.map { Formatters.time($0) } ?? "",
                "\(entry.calculatedDurationMinutes)",
                valueStr
            ].joined(separator: ",")
            rows.append(row)
        }
        return rows.joined(separator: "\n")
    }

    func jsonData(entries: [TimeEntry], clients: [Client]) throws -> Data {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try encoder.encode(ExportPayload(exportedAt: Date(), clients: clients, entries: entries))
    }

    private func csvEscape(_ value: String) -> String {
        if value.contains(",") || value.contains("\"") || value.contains("\n") {
            return "\"" + value.replacingOccurrences(of: "\"", with: "\"\"") + "\""
        }
        return value
    }
}

private struct ExportPayload: Encodable {
    let exportedAt: Date
    let clients: [Client]
    let entries: [TimeEntry]
}
