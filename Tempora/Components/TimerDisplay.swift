import SwiftUI

struct TimerDisplay: View {
    let seconds: Int
    var isRunning: Bool = false

    @State private var scale: CGFloat = 1.0

    var body: some View {
        Text(Formatters.elapsed(seconds))
            .font(.system(size: 72, weight: .thin, design: .monospaced))
            .foregroundStyle(.white)
            .scaleEffect(scale)
            .onChange(of: isRunning) { _, running in
                if running {
                    withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                        scale = 1.025
                    }
                } else {
                    withAnimation(.spring(response: 0.3)) {
                        scale = 1.0
                    }
                }
            }
    }
}
