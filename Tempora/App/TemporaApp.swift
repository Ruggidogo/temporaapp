import SwiftUI
import SwiftData

@main
struct TemporaApp: App {

    let container: ModelContainer

    init() {
        do {
            let schema = Schema([ClientModel.self, ProjectModel.self, TimeEntryModel.self])
            let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Impossibile creare ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(container)
                .preferredColorScheme(.dark)
                .task {
                    await MainActor.run {
                        SeedService.seedIfNeeded(context: container.mainContext)
                    }
                }
        }
    }
}
