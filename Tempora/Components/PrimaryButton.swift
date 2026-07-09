import SwiftUI

struct PrimaryButton: View {
    let title: String
    var systemImage: String? = nil
    var color: Color = .temporaIndigo
    var isLoading: Bool = false
    let action: () -> Void

    var body: some View {
        Button {
            Haptics.impact(.heavy)
            action()
        } label: {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    if let img = systemImage {
                        Image(systemName: img)
                    }
                    Text(title)
                }
            }
            .font(.title3.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(color)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(SpringButtonStyle())
        .disabled(isLoading)
    }
}

private struct SpringButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}
