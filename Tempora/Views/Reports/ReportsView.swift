import SwiftUI

struct ReportsView: View {
    @StateObject private var viewModel = ReportsViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()
                Text("Report")
                    .foregroundStyle(Color.temporaTextSecondary)
            }
            .navigationTitle("Report")
        }
    }
}
