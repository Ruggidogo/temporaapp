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
        let cleaned = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)

        let r, g, b: UInt64
        switch cleaned.count {
        case 6:
            r = (value >> 16) & 0xFF
            g = (value >>  8) & 0xFF
            b =  value        & 0xFF
        default:
            r = 0; g = 0; b = 0
        }

        self.init(
            .sRGB,
            red:     Double(r) / 255,
            green:   Double(g) / 255,
            blue:    Double(b) / 255,
            opacity: 1
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
