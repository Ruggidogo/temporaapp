import SwiftUI

struct StatCard: View {
    let title: String
    let value: String
    var delta: String? = nil
    var deltaPositive: Bool = true
    var gradient: LinearGradient? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
                .tracking(0.8)

            if let gradient {
                Text(value)
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(gradient)
            } else {
                Text(value)
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }

            if let delta {
                Label(delta, systemImage: deltaPositive ? "arrow.up.right" : "arrow.down.right")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(deltaPositive ? Color.temporaSuccess : Color.temporaError)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .temporaCard()
    }
}
