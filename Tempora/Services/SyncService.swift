import Foundation

/// Prepared for future Supabase integration. Currently a local no-op.
protocol SyncServiceProtocol: Sendable {
    func pushClients(_ clients: [Client]) async throws
    func pushEntries(_ entries: [TimeEntry]) async throws
    func pullClients(since: Date?) async throws -> [Client]
    func pullEntries(since: Date?) async throws -> [TimeEntry]
}

final class LocalSyncService: SyncServiceProtocol {
    func pushClients(_ clients: [Client]) async throws {}
    func pushEntries(_ entries: [TimeEntry]) async throws {}
    func pullClients(since: Date?) async throws -> [Client] { [] }
    func pullEntries(since: Date?) async throws -> [TimeEntry] { [] }
}
