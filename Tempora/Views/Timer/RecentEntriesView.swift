import SwiftUI

struct RecentEntriesView: View {
    let entries: [TimeEntry]
    let clients: [Client]
    let onReplay: (TimeEntry) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Recenti")
                .font(.headline)
                .foregroundStyle(Color.temporaTextSecondary)
                .padding(.horizontal)
                .padding(.bottom, 8)

            ForEach(entries) { entry in
                let client = clients.first { $0.id == entry.clientId }
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color(hex: client?.color ?? "#6366F1"))
                        .frame(width: 4, height: 40)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.description.isEmpty ? "Nessuna descrizione" : entry.description)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.white)
                        Text(client?.name ?? "")
                            .font(.caption)
                            .foregroundStyle(Color.temporaTextMuted)
                    }

                    Spacer()

                    Text(Formatters.formatDurationShort(minutes: entry.calculatedDurationMinutes))
                        .font(.subheadline.monospacedDigit())
                        .foregroundStyle(Color.temporaTextSecondary)

                    Button {
                        onReplay(entry)
                    } label: {
                        Image(systemName: "play.fill")
                            .font(.caption)
                            .foregroundStyle(Color.temporaIndigo)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 10)

                if entry.id != entries.last?.id {
                    Divider().background(Color.temporaBorder).padding(.leading)
                }
            }
        }
        .padding(.vertical, 12)
        .temporaCard()
        .padding(.horizontal)
        .padding(.bottom)
    }
}
