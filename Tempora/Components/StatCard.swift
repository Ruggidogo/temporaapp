import SwiftUI

struct StatCard: View {
    let title: String
    let value: String
    var delta: String? = nil
    var deltaPositive: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(Color.temporaTextMuted)
                .textCase(.uppercase)

            Text(value)
                .font(.system(size: 34, weight: .semibold, design: .rounded))
                .foregroundStyle(.white)

            if let delta {
                HStack(spacing: 4) {
                    Image(systemName: deltaPositive ? "arrow.up.right" : "arrow.down.right")
                        .font(.caption2)
                    Text(delta)
                        .font(.caption)
                }
                .foregroundStyle(deltaPositive ? Color.temporaSuccess : Color.temporaError)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .temporaCard()
    }
}
