import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .timer

    var body: some View {
        TabView(selection: $selectedTab) {
            TimerView()
                .tabItem {
                    Label("Timer", systemImage: "house.fill")
                }
                .tag(Tab.timer)

            HistoryView()
                .tabItem {
                    Label("Cronologia", systemImage: "clock.arrow.circlepath")
                }
                .tag(Tab.history)

            ReportsView()
                .tabItem {
                    Label("Report", systemImage: "chart.bar.fill")
                }
                .tag(Tab.reports)

            SettingsView()
                .tabItem {
                    Label("Impostazioni", systemImage: "gearshape.fill")
                }
                .tag(Tab.settings)
        }
        .tint(Color.indigo)
    }
}

enum Tab: Hashable {
    case timer, history, reports, settings
}
