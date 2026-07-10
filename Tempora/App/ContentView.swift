import SwiftUI

struct ContentView: View {
    @State private var tab: AppTab = .timer

    var body: some View {
        TabView(selection: $tab) {
            TimerView()
                .tabItem { Label("Timer", systemImage: "timer") }
                .tag(AppTab.timer)

            HistoryView()
                .tabItem { Label("Cronologia", systemImage: "list.bullet.rectangle") }
                .tag(AppTab.history)

            ReportsView()
                .tabItem { Label("Report", systemImage: "chart.bar.fill") }
                .tag(AppTab.reports)

            ClientsView()
                .tabItem { Label("Clienti", systemImage: "person.2.fill") }
                .tag(AppTab.clients)

            SettingsView()
                .tabItem { Label("Impostazioni", systemImage: "gearshape.fill") }
                .tag(AppTab.settings)
        }
        .tint(Color.temporaIndigo)
    }
}

enum AppTab: Hashable {
    case timer, history, reports, clients, settings
}
