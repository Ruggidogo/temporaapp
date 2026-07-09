import SwiftUI

struct ClientPill: View {
    let client: Client
    var isSelected: Bool = false

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(Color(hex: client.color))
                .frame(width: 8, height: 8)
            Text(client.name)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(isSelected ? .white : Color.temporaTextSecondary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(
            isSelected
                ? Color(hex: client.color).opacity(0.2)
                : Color.temporaSurface
        )
        .clipShape(Capsule())
        .overlay(
            Capsule()
                .stroke(
                    isSelected ? Color(hex: client.color) : Color.temporaBorder,
                    lineWidth: 1
                )
        )
        .animation(.spring(response: 0.25), value: isSelected)
    }
}
