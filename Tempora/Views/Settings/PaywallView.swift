import SwiftUI
import StoreKit

struct PaywallView: View {

    @Environment(\.dismiss) private var dismiss
    @StateObject private var store = StoreKitService()
    @State private var selectedProduct: Product?
    @State private var isPurchasing = false
    @State private var errorMessage: String?

    private let features = [
        ("timer.circle.fill",  "Timer e voci illimitate"),
        ("chart.bar.fill",     "Report avanzati"),
        ("square.and.arrow.up","Export CSV e PDF"),
        ("person.2.fill",      "Fino a 50 clienti"),
        ("icloud.fill",        "Sync su tutti i dispositivi (presto)"),
    ]

    var body: some View {
        ZStack {
            Color.temporaBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    header
                    featuresList
                    productCards
                    ctaButton
                    footer
                }
                .padding(.bottom, 40)
            }
        }
        .overlay(alignment: .topTrailing) {
            Button { dismiss() } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.title2)
                    .foregroundStyle(Color.temporaTextMuted)
            }
            .padding()
        }
    }

    // MARK: - Subviews

    private var header: some View {
        VStack(spacing: 12) {
            Text("⏱")
                .font(.system(size: 64))
                .padding(.top, 40)

            Text("Tempora Pro")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.white)

            Text("Il tuo tempo, valorizzato")
                .font(.subheadline)
                .foregroundStyle(LinearGradient.temporaPrimary)
        }
        .padding(.bottom, 32)
    }

    private var featuresList: some View {
        VStack(alignment: .leading, spacing: 14) {
            ForEach(features, id: \.0) { icon, text in
                HStack(spacing: 14) {
                    Image(systemName: icon)
                        .font(.body)
                        .foregroundStyle(LinearGradient.temporaPrimary)
                        .frame(width: 24)
                    Text(text)
                        .font(.subheadline)
                        .foregroundStyle(.white)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .temporaCard()
        .padding(.horizontal)
        .padding(.bottom, 24)
    }

    private var productCards: some View {
        VStack(spacing: 12) {
            ForEach(store.products) { product in
                let isYearly = product.id == StoreKitService.yearlyID
                Button {
                    selectedProduct = product
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 8) {
                                Text(isYearly ? "Annuale" : "Mensile")
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(.white)
                                if isYearly {
                                    Text("RISPARMIA 17%")
                                        .font(.caption2.weight(.bold))
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.temporaSuccess)
                                        .clipShape(Capsule())
                                }
                            }
                            Text(isYearly
                                 ? "\(product.displayPrice)/anno"
                                 : "\(product.displayPrice)/mese")
                                .font(.caption)
                                .foregroundStyle(Color.temporaTextSecondary)
                        }
                        Spacer()
                        Image(systemName: selectedProduct?.id == product.id
                              ? "checkmark.circle.fill"
                              : "circle")
                            .foregroundStyle(selectedProduct?.id == product.id
                                             ? Color.temporaIndigo : Color.temporaBorder)
                            .font(.title3)
                    }
                    .padding(16)
                    .background(
                        selectedProduct?.id == product.id
                        ? Color.temporaIndigo.opacity(0.15)
                        : Color.temporaSurfaceElevated
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(
                                selectedProduct?.id == product.id
                                ? Color.temporaIndigo : Color.temporaBorder,
                                lineWidth: 1
                            )
                    )
                }
            }
        }
        .padding(.horizontal)
        .onAppear {
            selectedProduct = store.products.last // default yearly
        }
    }

    private var ctaButton: some View {
        VStack(spacing: 12) {
            PrimaryButton(
                title: "Abbonati ora",
                color: .temporaIndigo,
                isLoading: isPurchasing
            ) {
                guard let product = selectedProduct else { return }
                isPurchasing = true
                Task {
                    do {
                        _ = try await store.purchase(product)
                    } catch {
                        errorMessage = error.localizedDescription
                    }
                    isPurchasing = false
                }
            }
            .disabled(selectedProduct == nil)
            .padding(.horizontal)
            .padding(.top, 24)

            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Color.temporaError)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 8) {
            Button("Ripristina acquisti") {
                Task { try? await store.restore() }
            }
            .font(.footnote)
            .foregroundStyle(Color.temporaTextMuted)

            Text("L'abbonamento si rinnova automaticamente. Puoi annullare in qualsiasi momento.")
                .font(.caption2)
                .foregroundStyle(Color.temporaTextMuted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .padding(.top, 16)
    }
}
