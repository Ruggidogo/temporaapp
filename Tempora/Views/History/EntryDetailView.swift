import SwiftUI
import SwiftData

struct EntryDetailView: View {

    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss

    let entry: TimeEntry
    let client: Client?
    let onSave: () -> Void

    @State private var description: String
    @State private var startTime: Date
    @State private var endTime: Date
    @State private var date: Date

    init(entry: TimeEntry, client: Client?, onSave: @escaping () -> Void) {
        self.entry = entry
        self.client = client
        self.onSave = onSave
        _description = State(initialValue: entry.description)
        _startTime   = State(initialValue: entry.startTime)
        _endTime     = State(initialValue: entry.endTime ?? Date())
        _date        = State(initialValue: entry.date)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                Form {
                    Section("Dettagli") {
                        TextField("Descrizione", text: $description)
                            .listRowBackground(Color.temporaSurfaceElevated)

                        if let client {
                            LabeledContent("Cliente") {
                                HStack(spacing: 6) {
                                    Circle().fill(Color(hex: client.color)).frame(width: 8, height: 8)
                                    Text(client.name).foregroundStyle(Color.temporaTextSecondary)
                                }
                            }
                            .listRowBackground(Color.temporaSurfaceElevated)
                        }
                    }

                    Section("Orari") {
                        DatePicker("Data", selection: $date, displayedComponents: .date)
                            .listRowBackground(Color.temporaSurfaceElevated)
                        DatePicker("Inizio", selection: $startTime, displayedComponents: .hourAndMinute)
                            .listRowBackground(Color.temporaSurfaceElevated)
                        DatePicker("Fine", selection: $endTime, displayedComponents: .hourAndMinute)
                            .listRowBackground(Color.temporaSurfaceElevated)
                    }

                    Section {
                        let mins = max(0, Int(endTime.timeIntervalSince(startTime) / 60))
                        LabeledContent("Durata", value: Formatters.duration(minutes: mins))
                            .listRowBackground(Color.temporaSurfaceElevated)

                        if let rate = client?.hourlyRate {
                            let mins2 = max(0, Int(endTime.timeIntervalSince(startTime) / 60))
                            let fakeEntry = TimeEntry(clientId: entry.clientId, durationMinutes: mins2)
                            if let value = fakeEntry.value(hourlyRate: rate) {
                                LabeledContent("Valore", value: Formatters.currency(value))
                                    .foregroundStyle(Color.temporaSuccess)
                                    .listRowBackground(Color.temporaSurfaceElevated)
                            }
                        }
                    }
                }
                .scrollContentBackground(.hidden)
                .foregroundStyle(.white)
            }
            .navigationTitle("Modifica voce")
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
                }
            }
        }
    }

    private func save() {
        var updated = entry
        updated.description = description
        updated.date = date
        updated.startTime = startTime
        updated.endTime = endTime
        updated.durationMinutes = nil

        let ds = DataService(context: context)
        try? ds.updateEntry(updated)
        onSave()
        dismiss()
    }
}
