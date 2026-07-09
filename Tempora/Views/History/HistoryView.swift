import SwiftUI

struct HistoryView: View {
    @StateObject private var viewModel = HistoryViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()
                Text("Cronologia")
                    .foregroundStyle(Color.temporaTextSecondary)
            }
            .navigationTitle("Cronologia")
        }
    }
}
