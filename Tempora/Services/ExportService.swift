import Foundation

final class ExportService {
    func exportCSV(entries: [TimeEntry], clients: [Client]) -> String {
        var rows = ["Data,Cliente,Descrizione,Inizio,Fine,Durata (min),Valore (EUR)"]
        let clientMap = Dictionary(uniqueKeysWithValues: clients.map { ($0.id, $0) })

        for entry in entries {
            let client = clientMap[entry.clientId]
            let value = entry.value(for: client).map { Formatters.formatCurrency($0) } ?? ""
            rows.append([
                Formatters.dateShort.string(from: entry.date),
                client?.name ?? "",
                entry.description,
                Formatters.timeShort.string(from: entry.startTime),
                entry.endTime.map { Formatters.timeShort.string(from: $0) } ?? "",
                "\(entry.calculatedDurationMinutes)",
                value
            ].joined(separator: ","))
        }
        return rows.joined(separator: "\n")
    }

    func exportJSON(entries: [TimeEntry], clients: [Client]) throws -> Data {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]

        let payload = ExportPayload(
            exportedAt: Date(),
            clients: clients,
            entries: entries
        )
        return try encoder.encode(payload)
    }
}

private struct ExportPayload: Encodable {
    let exportedAt: Date
    let clients: [Client]
    let entries: [TimeEntry]
}
