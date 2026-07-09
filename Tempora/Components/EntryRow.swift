import SwiftUI

struct EntryRow: View {
    let entry: TimeEntry
    let client: Client?

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 2)
                .fill(Color(hex: client?.color ?? "#6366F1"))
                .frame(width: 4)
                .frame(maxHeight: .infinity)

            VStack(alignment: .leading, spacing: 3) {
                Text(entry.description.isEmpty ? "Nessuna descrizione" : entry.description)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(client?.name ?? "—")
                        .font(.caption)
                        .foregroundStyle(Color.temporaTextMuted)
                    Text("·")
                        .foregroundStyle(Color.temporaBorder)
                    Text(Formatters.time(entry.startTime))
                        .font(.caption)
                        .foregroundStyle(Color.temporaTextMuted)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                Text(Formatters.duration(minutes: entry.calculatedDurationMinutes))
                    .font(.subheadline.weight(.semibold).monospacedDigit())
                    .foregroundStyle(.white)

                if let rate = client?.hourlyRate,
                   let value = entry.value(hourlyRate: rate) {
                    Text(Formatters.currency(value))
                        .font(.caption)
                        .foregroundStyle(Color.temporaSuccess)
                }
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 4)
    }
}
