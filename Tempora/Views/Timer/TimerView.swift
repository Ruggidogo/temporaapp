import SwiftUI

struct TimerView: View {
    @StateObject private var viewModel = TimerViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                VStack(spacing: 40) {
                    Spacer()

                    TimerDisplay(seconds: viewModel.elapsedSeconds)

                    ClientSelector(
                        clients: viewModel.clients,
                        selected: $viewModel.selectedClient
                    )

                    TextField("Descrizione attività...", text: $viewModel.description)
                        .padding()
                        .background(Color.temporaSurfaceElevated)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.temporaBorder))
                        .foregroundStyle(.white)
                        .padding(.horizontal)

                    PrimaryButton(
                        title: viewModel.isRunning ? "STOP" : "START",
                        color: viewModel.isRunning ? .temporaError : .temporaSuccess
                    ) {
                        viewModel.isRunning ? viewModel.stopTimer() : viewModel.startTimer()
                    }
                    .padding(.horizontal)

                    Spacer()

                    RecentEntriesView(entries: viewModel.recentEntries, clients: viewModel.clients) { entry in
                        viewModel.replay(entry: entry)
                    }
                }
            }
            .navigationTitle("Tempora")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
