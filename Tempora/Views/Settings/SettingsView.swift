import SwiftUI

struct SettingsView: View {
    @StateObject private var viewModel = SettingsViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()
                Text("Impostazioni")
                    .foregroundStyle(Color.temporaTextSecondary)
            }
            .navigationTitle("Impostazioni")
        }
    }
}
