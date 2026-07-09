import Foundation

// Protocol prepared for future Supabase sync integration.
// Currently implemented as a local no-op.

protocol SyncServiceProtocol {
    func syncClients(_ clients: [Client]) async throws
    func syncEntries(_ entries: [TimeEntry]) async throws
    func fetchRemoteClients() async throws -> [Client]
    func fetchRemoteEntries(since: Date?) async throws -> [TimeEntry]
}

final class LocalSyncService: SyncServiceProtocol {
    func syncClients(_ clients: [Client]) async throws {}
    func syncEntries(_ entries: [TimeEntry]) async throws {}
    func fetchRemoteClients() async throws -> [Client] { [] }
    func fetchRemoteEntries(since: Date?) async throws -> [TimeEntry] { [] }
}
