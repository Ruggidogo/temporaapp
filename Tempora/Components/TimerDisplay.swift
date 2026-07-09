import SwiftUI

struct TimerDisplay: View {
    let seconds: Int
    var isRunning: Bool = false

    @State private var pulsing = false

    var body: some View {
        Text(Formatters.formatDuration(seconds: seconds))
            .font(.system(size: 72, weight: .light, design: .monospaced))
            .foregroundStyle(.white)
            .scaleEffect(pulsing ? 1.02 : 1.0)
            .animation(
                isRunning
                    ? .easeInOut(duration: 1.2).repeatForever(autoreverses: true)
                    : .default,
                value: pulsing
            )
            .onChange(of: isRunning) { _, running in
                pulsing = running
            }
    }
}
