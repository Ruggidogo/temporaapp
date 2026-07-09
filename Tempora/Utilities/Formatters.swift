import Foundation

enum Formatters {

    // MARK: - Timer

    static func elapsed(_ seconds: Int) -> String {
        let h = seconds / 3600
        let m = (seconds % 3600) / 60
        let s = seconds % 60
        return String(format: "%02d:%02d:%02d", h, m, s)
    }

    static func duration(minutes: Int) -> String {
        String(format: "%02d:%02d", minutes / 60, minutes % 60)
    }

    // MARK: - Currency

    static func currency(_ value: Decimal) -> String {
        let fmt = NumberFormatter()
        fmt.numberStyle = .currency
        fmt.currencyCode = "EUR"
        fmt.locale = Locale(identifier: "it_IT")
        fmt.maximumFractionDigits = 2
        return fmt.string(from: value as NSDecimalNumber) ?? "€0,00"
    }

    // MARK: - Dates

    static func date(_ d: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateStyle = .medium
        fmt.timeStyle = .none
        fmt.locale = Locale(identifier: "it_IT")
        return fmt.string(from: d)
    }

    static func time(_ d: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateStyle = .none
        fmt.timeStyle = .short
        fmt.locale = Locale(identifier: "it_IT")
        return fmt.string(from: d)
    }

    static func weekdayAndDate(_ d: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "EEEE d MMMM"
        fmt.locale = Locale(identifier: "it_IT")
        return fmt.string(from: d).capitalized
    }
}
