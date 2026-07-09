import SwiftUI
import SwiftData

struct SettingsView: View {

    @Environment(\.modelContext) private var context
    @StateObject private var vm = SettingsViewModel()
    @State private var showAddClient = false
    @State private var clientToEdit: Client?
    @State private var showPaywall = false
    @State private var showDeleteConfirm = false
    @State private var clientToDelete: Client?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                List {
                    accountSection
                    clientsSection
                    preferencesSection
                    dataSection
                    aboutSection
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Impostazioni")
            .sheet(isPresented: $showAddClient, onDismiss: { vm.loadClients() }) {
                ClientEditView(client: nil) { vm.addClient($0) }
            }
            .sheet(item: $clientToEdit, onDismiss: { vm.loadClients() }) { client in
                ClientEditView(client: client) { vm.updateClient($0) }
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
            .alert("Elimina cliente", isPresented: $showDeleteConfirm, presenting: clientToDelete) { client in
                Button("Elimina", role: .destructive) { vm.deleteClient(id: client.id) }
                Button("Annulla", role: .cancel) {}
            } message: { client in
                Text("Eliminare \"\(client.name)\"? Tutte le voci associate verranno eliminate.")
            }
        }
        .onAppear { vm.configure(context: context) }
    }

    // MARK: - Account

    private var accountSection: some View {
        Section("Account") {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(LinearGradient.temporaPrimary)
                        .frame(width: 44, height: 44)
                    Text("T")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Prova gratuita")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                    Text("7 giorni rimanenti")
                        .font(.caption)
                        .foregroundStyle(Color.temporaWarning)
                }

                Spacer()

                Button("Pro") { showPaywall = true }
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 7)
                    .background(LinearGradient.temporaPrimary)
                    .clipShape(Capsule())
            }
            .listRowBackground(Color.temporaSurfaceElevated)
        }
    }

    // MARK: - Clients

    private var clientsSection: some View {
        Section {
            ForEach(vm.clients) { client in
                HStack(spacing: 12) {
                    Circle()
                        .fill(Color(hex: client.color))
                        .frame(width: 12, height: 12)

                    VStack(alignment: .leading, spacing: 1) {
                        Text(client.name)
                            .foregroundStyle(client.isActive ? .white : Color.temporaTextMuted)
                        if let rate = client.hourlyRate {
                            Text("\(Formatters.currency(rate))/h")
                                .font(.caption)
                                .foregroundStyle(Color.temporaTextMuted)
                        }
                    }

                    Spacer()

                    if !client.isActive {
                        Text("Archiviato")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(Color.temporaTextMuted)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.temporaBorder)
                            .clipShape(Capsule())
                    }

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(Color.temporaTextMuted)
                }
                .listRowBackground(Color.temporaSurfaceElevated)
                .contentShape(Rectangle())
                .onTapGesture { clientToEdit = client }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        clientToDelete = client
                        showDeleteConfirm = true
                    } label: {
                        Label("Elimina", systemImage: "trash")
                    }

                    Button {
                        vm.archiveClient(id: client.id)
                    } label: {
                        Label(client.isActive ? "Archivia" : "Riattiva",
                              systemImage: client.isActive ? "archivebox" : "arrow.uturn.left")
                    }
                    .tint(Color.temporaWarning)
                }
            }

            Button {
                showAddClient = true
            } label: {
                Label("Aggiungi cliente", systemImage: "plus.circle.fill")
                    .foregroundStyle(Color.temporaIndigo)
                    .font(.subheadline.weight(.medium))
            }
            .listRowBackground(Color.temporaSurfaceElevated)

        } header: {
            HStack {
                Text("Clienti")
                Spacer()
                Text("\(vm.clients.filter(\.isActive).count) attivi")
                    .font(.caption)
                    .foregroundStyle(Color.temporaTextMuted)
            }
        }
    }

    // MARK: - Preferences

    private var preferencesSection: some View {
        Section("Preferenze") {
            Toggle("Suono timer", isOn: $vm.timerSoundEnabled)
                .tint(Color.temporaIndigo)
                .listRowBackground(Color.temporaSurfaceElevated)
                .foregroundStyle(.white)
                .onChange(of: vm.timerSoundEnabled) { _, _ in vm.savePreferences() }

            Toggle("Feedback tattile", isOn: $vm.hapticFeedbackEnabled)
                .tint(Color.temporaIndigo)
                .listRowBackground(Color.temporaSurfaceElevated)
                .foregroundStyle(.white)
                .onChange(of: vm.hapticFeedbackEnabled) { _, _ in vm.savePreferences() }
        }
    }

    // MARK: - Data

    private var dataSection: some View {
        Section("Dati") {
            Button {
                exportJSON()
            } label: {
                Label("Esporta dati (JSON)", systemImage: "square.and.arrow.up")
                    .foregroundStyle(Color.temporaIndigo)
            }
            .listRowBackground(Color.temporaSurfaceElevated)
        }
    }

    // MARK: - About

    private var aboutSection: some View {
        Section("Info") {
            LabeledContent("Versione", value: appVersion)
                .listRowBackground(Color.temporaSurfaceElevated)
                .foregroundStyle(Color.temporaTextSecondary)

            Link(destination: URL(string: "https://tempora.app/privacy")!) {
                Label("Privacy Policy", systemImage: "hand.raised")
                    .foregroundStyle(Color.temporaTextSecondary)
            }
            .listRowBackground(Color.temporaSurfaceElevated)

            Link(destination: URL(string: "https://tempora.app/terms")!) {
                Label("Termini di servizio", systemImage: "doc.text")
                    .foregroundStyle(Color.temporaTextSecondary)
            }
            .listRowBackground(Color.temporaSurfaceElevated)

            Link(destination: URL(string: "mailto:support@tempora.app")!) {
                Label("Contatta il supporto", systemImage: "envelope")
                    .foregroundStyle(Color.temporaIndigo)
            }
            .listRowBackground(Color.temporaSurfaceElevated)
        }
    }

    // MARK: - Helpers

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    private func exportJSON() {
        let ds = DataService(context: context)
        let clients = (try? ds.fetchClients(activeOnly: false)) ?? []
        let entries = (try? ds.fetchEntries()) ?? []
        let service = ExportService()
        guard let data = try? service.jsonData(entries: entries, clients: clients),
              let str = String(data: data, encoding: .utf8) else { return }

        let av = UIActivityViewController(activityItems: [str], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let vc = scene.windows.first?.rootViewController {
            vc.present(av, animated: true)
        }
    }
}
