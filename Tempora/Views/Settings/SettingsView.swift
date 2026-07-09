import SwiftUI
import SwiftData

struct SettingsView: View {

    @Environment(\.modelContext) private var context
    @StateObject private var vm = SettingsViewModel()
    @State private var showAddClient = false
    @State private var clientToEdit: Client?
    @State private var showPaywall = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                List {
                    accountSection
                    clientsSection
                    preferencesSection
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
        }
        .onAppear { vm.configure(context: context) }
    }

    // MARK: - Sections

    private var accountSection: some View {
        Section("Account") {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Prova gratuita")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                    Text("7 giorni rimanenti")
                        .font(.caption)
                        .foregroundStyle(Color.temporaWarning)
                }
                Spacer()
                Button("Passa a Pro") { showPaywall = true }
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(LinearGradient.temporaPrimary)
                    .clipShape(Capsule())
            }
            .listRowBackground(Color.temporaSurfaceElevated)
        }
    }

    private var clientsSection: some View {
        Section {
            ForEach(vm.clients) { client in
                HStack(spacing: 12) {
                    Circle()
                        .fill(Color(hex: client.color))
                        .frame(width: 12, height: 12)
                    Text(client.name)
                        .foregroundStyle(.white)
                    Spacer()
                    if !client.isActive {
                        Text("Archiviato")
                            .font(.caption)
                            .foregroundStyle(Color.temporaTextMuted)
                    }
                    if let rate = client.hourlyRate {
                        Text("\(Formatters.currency(rate))/h")
                            .font(.caption)
                            .foregroundStyle(Color.temporaTextSecondary)
                    }
                }
                .listRowBackground(Color.temporaSurfaceElevated)
                .contentShape(Rectangle())
                .onTapGesture { clientToEdit = client }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        vm.deleteClient(id: client.id)
                    } label: {
                        Label("Elimina", systemImage: "trash")
                    }
                    Button {
                        vm.archiveClient(id: client.id)
                    } label: {
                        Label("Archivia", systemImage: "archivebox")
                    }
                    .tint(Color.temporaWarning)
                }
            }

            Button {
                showAddClient = true
            } label: {
                Label("Aggiungi cliente", systemImage: "plus.circle.fill")
                    .foregroundStyle(Color.temporaIndigo)
            }
            .listRowBackground(Color.temporaSurfaceElevated)

        } header: {
            Text("Clienti")
        }
    }

    private var preferencesSection: some View {
        Section("Preferenze") {
            Toggle("Suono timer", isOn: $vm.timerSoundEnabled)
                .tint(Color.temporaIndigo)
                .listRowBackground(Color.temporaSurfaceElevated)
                .onChange(of: vm.timerSoundEnabled) { _, _ in vm.savePreferences() }

            Toggle("Feedback tattile", isOn: $vm.hapticFeedbackEnabled)
                .tint(Color.temporaIndigo)
                .listRowBackground(Color.temporaSurfaceElevated)
                .onChange(of: vm.hapticFeedbackEnabled) { _, _ in vm.savePreferences() }
        }
    }

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

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }
}
