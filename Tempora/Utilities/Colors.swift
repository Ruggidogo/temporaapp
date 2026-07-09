import SwiftUI

extension Color {
    // MARK: - Brand palette
    static let temporaBackground       = Color(hex: "#0A0A0B")
    static let temporaSurface          = Color(hex: "#141416")
    static let temporaSurfaceElevated  = Color(hex: "#1C1C1F")
    static let temporaBorder           = Color(hex: "#2A2A2E")
    static let temporaTextPrimary      = Color(hex: "#FFFFFF")
    static let temporaTextSecondary    = Color(hex: "#9CA3AF")
    static let temporaTextMuted        = Color(hex: "#6B7280")
    static let temporaSuccess          = Color(hex: "#10B981")
    static let temporaError            = Color(hex: "#EF4444")
    static let temporaWarning          = Color(hex: "#F59E0B")
    static let temporaIndigo           = Color(hex: "#6366F1")
    static let temporaPurple           = Color(hex: "#A855F7")

    init(hex: String) {
        var str = hex.trimmingCharacters(in: .alphanumerics.inverted)
        if str.count == 6 { str = "FF" + str }
        let value = UInt64((try? /([0-9A-Fa-f]{8})/.wholeMatch(in: str)?.output) != nil
            ? UInt64(str, radix: 16) ?? 0
            : 0) | {
            var v: UInt64 = 0; Scanner(string: str).scanHexInt64(&v); return v
        }()
        self.init(
            .sRGB,
            red:     Double((value >> 16) & 0xFF) / 255,
            green:   Double((value >>  8) & 0xFF) / 255,
            blue:    Double( value        & 0xFF) / 255,
            opacity: Double((value >> 24) & 0xFF) / 255
        )
    }
}

extension LinearGradient {
    static let temporaPrimary = LinearGradient(
        colors: [.temporaIndigo, .temporaPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
}
