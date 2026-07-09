import Foundation
import Combine
import SwiftData

@MainActor
final class SettingsViewModel: ObservableObject {

    @Published var clients: [Client] = []
    @Published var timerSoundEnabled: Bool
    @Published var hapticFeedbackEnabled: Bool

    private var dataService: DataService?

    init() {
        timerSoundEnabled    = UserDefaults.standard.bool(forKey: "pref_timerSound") == false ? true
                               : UserDefaults.standard.bool(forKey: "pref_timerSound")
        hapticFeedbackEnabled = UserDefaults.standard.bool(forKey: "pref_haptics") == false ? true
                                : UserDefaults.standard.bool(forKey: "pref_haptics")
    }

    func configure(context: ModelContext) {
        dataService = DataService(context: context)
        loadClients()
    }

    // MARK: - Clients

    func loadClients() {
        clients = (try? dataService?.fetchClients(activeOnly: false)) ?? []
    }

    func addClient(_ client: Client) {
        try? dataService?.saveClient(client)
        loadClients()
    }

    func updateClient(_ client: Client) {
        try? dataService?.updateClient(client)
        loadClients()
    }

    func archiveClient(id: UUID) {
        try? dataService?.archiveClient(id: id)
        loadClients()
    }

    func deleteClient(id: UUID) {
        try? dataService?.deleteClient(id: id)
        loadClients()
    }

    // MARK: - Preferences

    func savePreferences() {
        UserDefaults.standard.set(timerSoundEnabled,    forKey: "pref_timerSound")
        UserDefaults.standard.set(hapticFeedbackEnabled, forKey: "pref_haptics")
    }
}
