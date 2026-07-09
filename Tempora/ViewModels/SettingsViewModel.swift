import Foundation

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published var clients: [Client] = []
    @Published var user: User?

    @Published var timerSoundEnabled: Bool = true
    @Published var hapticFeedbackEnabled: Bool = true

    func addClient(_ client: Client) {
        clients.append(client)
    }

    func updateClient(_ client: Client) {
        if let idx = clients.firstIndex(where: { $0.id == client.id }) {
            clients[idx] = client
        }
    }

    func archiveClient(id: UUID) {
        if let idx = clients.firstIndex(where: { $0.id == id }) {
            clients[idx].isActive = false
        }
    }

    func deleteClient(id: UUID) {
        clients.removeAll { $0.id == id }
    }
}
