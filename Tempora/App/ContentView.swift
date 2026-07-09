import SwiftUI

struct ContentView: View {

    @State private var selectedTab: AppTab = .timer

    var body: some View {
        TabView(selection: $selectedTab) {

            TimerView()
                .tabItem { Label("Timer", systemImage: "house.fill") }
                .tag(AppTab.timer)

            HistoryView()
                .tabItem { Label("Cronologia", systemImage: "clock.arrow.circlepath") }
                .tag(AppTab.history)

            ReportsView()
                .tabItem { Label("Report", systemImage: "chart.bar.fill") }
                .tag(AppTab.reports)

            SettingsView()
                .tabItem { Label("Impostazioni", systemImage: "gearshape.fill") }
                .tag(AppTab.settings)
        }
        .tint(Color.temporaIndigo)
    }
}

enum AppTab: Hashable {
    case timer, history, reports, settings
}
