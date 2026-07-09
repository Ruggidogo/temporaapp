import SwiftUI

// MARK: - View modifiers

extension View {
    func temporaCard(padding: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background(Color.temporaSurfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.temporaBorder, lineWidth: 1))
    }

    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

// MARK: - Date helpers

extension Date {
    var startOfDay: Date { Calendar.current.startOfDay(for: self) }
    var endOfDay: Date { Calendar.current.date(byAdding: .day, value: 1, to: startOfDay)!.addingTimeInterval(-1) }

    var isToday: Bool    { Calendar.current.isDateInToday(self) }
    var isThisWeek: Bool { Calendar.current.isDate(self, equalTo: Date(), toGranularity: .weekOfYear) }
    var isThisMonth: Bool{ Calendar.current.isDate(self, equalTo: Date(), toGranularity: .month) }

    static var startOfWeek: Date {
        Calendar.current.date(from: Calendar.current.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date()))!
    }
    static var startOfMonth: Date {
        Calendar.current.date(from: Calendar.current.dateComponents([.year, .month], from: Date()))!
    }
}

// MARK: - Haptics

enum Haptics {
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }
    static func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        UINotificationFeedbackGenerator().notificationOccurred(type)
    }
}
