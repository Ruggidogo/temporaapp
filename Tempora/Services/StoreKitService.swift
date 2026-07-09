import Foundation
import StoreKit

@MainActor
final class StoreKitService: ObservableObject {

    static let monthlyID = "com.tempora.app.pro.monthly"
    static let yearlyID  = "com.tempora.app.pro.yearly"

    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedIDs: Set<String> = []
    @Published private(set) var isLoading = false

    var isPro: Bool {
        purchasedIDs.contains(Self.monthlyID) || purchasedIDs.contains(Self.yearlyID)
    }

    init() {
        Task { await loadProducts() }
        Task { await refreshEntitlements() }
        listenForTransactions()
    }

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            products = try await Product.products(for: [Self.monthlyID, Self.yearlyID])
                .sorted { $0.price < $1.price }
        } catch {
            print("[StoreKit] loadProducts error: \(error)")
        }
    }

    func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            guard case .verified(let tx) = verification else { return false }
            purchasedIDs.insert(tx.productID)
            await tx.finish()
            return true
        case .userCancelled, .pending:
            return false
        @unknown default:
            return false
        }
    }

    func restore() async throws {
        try await AppStore.sync()
        await refreshEntitlements()
    }

    private func refreshEntitlements() async {
        var ids = Set<String>()
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result {
                ids.insert(tx.productID)
            }
        }
        purchasedIDs = ids
    }

    private func listenForTransactions() {
        Task {
            for await result in Transaction.updates {
                if case .verified(let tx) = result {
                    purchasedIDs.insert(tx.productID)
                    await tx.finish()
                }
            }
        }
    }
}
