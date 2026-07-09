import SwiftUI
import SwiftData

@main
struct TemporaApp: App {
    let container: ModelContainer

    init() {
        do {
            container = try ModelContainer(for: ClientModel.self, TimeEntryModel.self, ProjectModel.self)
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(container)
                .preferredColorScheme(.dark)
        }
    }
}
