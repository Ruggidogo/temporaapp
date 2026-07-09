import Foundation

struct User: Identifiable, Codable {
    let id: UUID
    var email: String
    var name: String?
    var subscriptionStatus: SubscriptionStatus
    var trialEndsAt: Date?
    let createdAt: Date

    init(
        id: UUID = UUID(),
        email: String,
        name: String? = nil,
        subscriptionStatus: SubscriptionStatus = .trial,
        trialEndsAt: Date? = Calendar.current.date(byAdding: .day, value: 7, to: Date()),
        createdAt: Date = Date()
    ) {
        self.id = id
        self.email = email
        self.name = name
        self.subscriptionStatus = subscriptionStatus
        self.trialEndsAt = trialEndsAt
        self.createdAt = createdAt
    }

    var isTrialActive: Bool {
        guard subscriptionStatus == .trial, let ends = trialEndsAt else { return false }
        return ends > Date()
    }

    var trialDaysRemaining: Int {
        guard let ends = trialEndsAt else { return 0 }
        return max(0, Calendar.current.dateComponents([.day], from: Date(), to: ends).day ?? 0)
    }

    var canEdit: Bool {
        subscriptionStatus == .active || isTrialActive
    }
}

enum SubscriptionStatus: String, Codable {
    case trial
    case active
    case expired
    case cancelled

    var label: String {
        switch self {
        case .trial: return "Prova gratuita"
        case .active: return "Pro attivo"
        case .expired: return "Scaduto"
        case .cancelled: return "Cancellato"
        }
    }
}
