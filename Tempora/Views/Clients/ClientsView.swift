import SwiftUI
import SwiftData

struct ClientsView: View {
    @Environment(\.modelContext) private var context
    @State private var clients: [Client] = []
    @State private var showAdd = false
    @State private var editClient: Client?
    @State private var deleteTarget: Client?
    @State private var showDeleteConfirm = false
    private var dataService: DataService { DataService(context: context) }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                Group {
                    if clients.isEmpty {
                        emptyState
                    } else {
                        clientList
                    }
                }
            }
            .navigationTitle("Clienti")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showAdd = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundStyle(Color.temporaIndigo)
                    }
                }
            }
            .sheet(isPresented: $showAdd, onDismiss: reload) {
                ClientFormSheet(dataService: dataService)
            }
            .sheet(item: $editClient, onDismiss: reload) { client in
                ClientFormSheet(dataService: dataService, existing: client)
            }
            .confirmationDialog("Elimina cliente?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
                Button("Elimina", role: .destructive) {
                    if let c = deleteTarget { delete(c) }
                }
                Button("Annulla", role: .cancel) {}
            } message: {
                Text("Tutte le voci associate verranno rimosse.")
            }
            .onAppear(perform: reload)
        }
    }

    // MARK: - List

    private var clientList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(clients) { client in
                    ClientCard(client: client)
                        .contextMenu {
                            Button("Modifica") { editClient = client }
                            Button("Elimina", role: .destructive) {
                                deleteTarget = client
                                showDeleteConfirm = true
                            }
                        }
                        .onTapGesture { editClient = client }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
        }
    }

    // MARK: - Empty state

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "person.2")
                .font(.system(size: 52))
                .foregroundStyle(Color.temporaTextMuted)
            Text("Nessun cliente")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
            Text("Aggiungi il primo cliente\nper iniziare a tracciare il tempo")
                .font(.subheadline)
                .foregroundStyle(Color.temporaTextMuted)
                .multilineTextAlignment(.center)
            Button {
                showAdd = true
            } label: {
                Label("Aggiungi cliente", systemImage: "plus")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.temporaIndigo)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding(.top, 4)
        }
    }

    // MARK: - Helpers

    private func reload() {
        clients = (try? dataService.fetchClients()) ?? []
    }

    private func delete(_ client: Client) {
        try? dataService.deleteClient(id: client.id)
        reload()
        Haptics.notification(.warning)
    }
}

// MARK: - Client card

private struct ClientCard: View {
    let client: Client

    var body: some View {
        HStack(spacing: 14) {
            Circle()
                .fill(Color(hex: client.color))
                .frame(width: 44, height: 44)
                .overlay {
                    Text(String(client.name.prefix(1)).uppercased())
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(client.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                if let rate = client.hourlyRate {
                    Text("\(Formatters.currency(rate))/h")
                        .font(.caption)
                        .foregroundStyle(Color.temporaTextMuted)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
        }
        .padding(16)
        .background(Color.temporaSurface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.temporaBorder))
    }
}

// MARK: - Client form sheet

struct ClientFormSheet: View {
    let dataService: DataService
    var existing: Client?
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var hourlyRate = ""
    @State private var notes = ""
    @State private var selectedColor = Client.palette[0]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()
                Form {
                    Section("Nome") {
                        TextField("Es. Acme Srl", text: $name)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurface)
                    }

                    Section("Tariffa oraria (€)") {
                        TextField("0", text: $hourlyRate)
                            .keyboardType(.decimalPad)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurface)
                    }

                    Section("Colore") {
                        LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 8), spacing: 12) {
                            ForEach(Client.palette, id: \.self) { hex in
                                Circle()
                                    .fill(Color(hex: hex))
                                    .frame(width: 32, height: 32)
                                    .overlay {
                                        if hex == selectedColor {
                                            Image(systemName: "checkmark")
                                                .font(.caption.weight(.bold))
                                                .foregroundStyle(.white)
                                        }
                                    }
                                    .onTapGesture { selectedColor = hex }
                            }
                        }
                        .padding(.vertical, 4)
                        .listRowBackground(Color.temporaSurface)
                    }

                    Section("Note") {
                        TextField("Facoltativo", text: $notes, axis: .vertical)
                            .lineLimit(3...6)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurface)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle(existing == nil ? "Nuovo cliente" : "Modifica cliente")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") { dismiss() }
                        .foregroundStyle(Color.temporaTextMuted)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") { save() }
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.temporaIndigo)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear {
                if let c = existing {
                    name = c.name
                    selectedColor = c.color
                    notes = c.notes ?? ""
                    if let r = c.hourlyRate { hourlyRate = "\(r)" }
                }
            }
        }
    }

    private func save() {
        let rate = Decimal(string: hourlyRate.replacingOccurrences(of: ",", with: "."))
        if var c = existing {
            c.name = name
            c.color = selectedColor
            c.notes = notes.isEmpty ? nil : notes
            c.hourlyRate = rate
            try? dataService.updateClient(c)
        } else {
            let c = Client(name: name, color: selectedColor, hourlyRate: rate, notes: notes.isEmpty ? nil : notes)
            try? dataService.saveClient(c)
        }
        Haptics.notification(.success)
        dismiss()
    }
}
