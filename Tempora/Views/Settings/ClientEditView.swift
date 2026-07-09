import SwiftUI

struct ClientEditView: View {

    @Environment(\.dismiss) private var dismiss

    let existingClient: Client?
    let onSave: (Client) -> Void

    @State private var name: String
    @State private var selectedColor: String
    @State private var hourlyRateText: String
    @State private var notes: String

    init(client: Client?, onSave: @escaping (Client) -> Void) {
        self.existingClient = client
        self.onSave = onSave
        _name            = State(initialValue: client?.name ?? "")
        _selectedColor   = State(initialValue: client?.color ?? Client.palette[0])
        _hourlyRateText  = State(initialValue: client?.hourlyRate.map { "\(NSDecimalNumber(decimal: $0).doubleValue)" } ?? "")
        _notes           = State(initialValue: client?.notes ?? "")
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                Form {
                    Section("Informazioni") {
                        TextField("Nome cliente *", text: $name)
                            .listRowBackground(Color.temporaSurfaceElevated)
                            .foregroundStyle(.white)

                        TextField("Tariffa oraria (€)", text: $hourlyRateText)
                            .keyboardType(.decimalPad)
                            .listRowBackground(Color.temporaSurfaceElevated)
                            .foregroundStyle(.white)

                        TextField("Note", text: $notes, axis: .vertical)
                            .lineLimit(3...6)
                            .listRowBackground(Color.temporaSurfaceElevated)
                            .foregroundStyle(.white)
                    }

                    Section("Colore") {
                        LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 4), spacing: 12) {
                            ForEach(Client.palette, id: \.self) { hex in
                                Circle()
                                    .fill(Color(hex: hex))
                                    .frame(width: 40, height: 40)
                                    .overlay(
                                        Circle()
                                            .stroke(.white, lineWidth: selectedColor == hex ? 3 : 0)
                                    )
                                    .scaleEffect(selectedColor == hex ? 1.1 : 1.0)
                                    .animation(.spring(response: 0.2), value: selectedColor)
                                    .onTapGesture { selectedColor = hex }
                            }
                        }
                        .padding(.vertical, 8)
                        .listRowBackground(Color.temporaSurfaceElevated)
                    }
                }
                .scrollContentBackground(.hidden)
                .foregroundStyle(.white)
            }
            .navigationTitle(existingClient == nil ? "Nuovo cliente" : "Modifica cliente")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") { dismiss() }
                        .foregroundStyle(Color.temporaTextSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") { save() }
                        .foregroundStyle(Color.temporaIndigo)
                        .fontWeight(.semibold)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func save() {
        let rate = Decimal(string: hourlyRateText.replacingOccurrences(of: ",", with: "."))
        let client = Client(
            id: existingClient?.id ?? UUID(),
            name: name.trimmingCharacters(in: .whitespaces),
            color: selectedColor,
            hourlyRate: rate,
            notes: notes.isEmpty ? nil : notes,
            isActive: existingClient?.isActive ?? true,
            createdAt: existingClient?.createdAt ?? Date()
        )
        onSave(client)
        dismiss()
    }
}
