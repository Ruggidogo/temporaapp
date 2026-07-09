import Foundation
import StoreKit

@MainActor
final class StoreKitService: ObservableObject {
    @Published var products: [Product] = []
    @Published var purchasedProductIDs: Set<String> = []

    static let monthlyID = "com.tempora.app.pro.monthly"
    static let yearlyID = "com.tempora.app.pro.yearly"

    init() {
        Task { await load() }
        listenForTransactions()
    }

    func load() async {
        do {
            products = try await Product.products(for: [Self.monthlyID, Self.yearlyID])
                .sorted { $0.price < $1.price }
        } catch {
            print("StoreKit load error: \(error)")
        }
    }

    func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            guard case .verified(let transaction) = verification else { return false }
            purchasedProductIDs.insert(transaction.productID)
            await transaction.finish()
            return true
        case .userCancelled, .pending:
            return false
        @unknown default:
            return false
        }
    }

    func restorePurchases() async throws {
        try await AppStore.sync()
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                purchasedProductIDs.insert(transaction.productID)
            }
        }
    }

    var isPro: Bool {
        purchasedProductIDs.contains(Self.monthlyID) ||
        purchasedProductIDs.contains(Self.yearlyID)
    }

    private func listenForTransactions() {
        Task {
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    purchasedProductIDs.insert(transaction.productID)
                    await transaction.finish()
                }
            }
        }
    }
}
