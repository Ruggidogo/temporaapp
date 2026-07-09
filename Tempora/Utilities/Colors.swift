import SwiftUI

extension Color {
    // MARK: - Brand Colors
    static let temporaBackground    = Color(hex: "#0A0A0B")
    static let temporaSurface       = Color(hex: "#141416")
    static let temporaSurfaceElevated = Color(hex: "#1C1C1F")
    static let temporaBorder        = Color(hex: "#2A2A2E")
    static let temporaTextPrimary   = Color(hex: "#FFFFFF")
    static let temporaTextSecondary = Color(hex: "#9CA3AF")
    static let temporaTextMuted     = Color(hex: "#6B7280")
    static let temporaSuccess       = Color(hex: "#10B981")
    static let temporaError         = Color(hex: "#EF4444")
    static let temporaWarning       = Color(hex: "#F59E0B")
    static let temporaIndigo        = Color(hex: "#6366F1")
    static let temporaPurple        = Color(hex: "#A855F7")

    // MARK: - Gradient
    static let primaryGradient = LinearGradient(
        colors: [.temporaIndigo, .temporaPurple],
        startPoint: .leading,
        endPoint: .trailing
    )

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b, a: UInt64
        switch hex.count {
        case 6:
            (r, g, b, a) = (int >> 16, int >> 8 & 0xFF, int & 0xFF, 255)
        case 8:
            (r, g, b, a) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (r, g, b, a) = (0, 0, 0, 255)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
