import SwiftUI
import SwiftData

struct TimerView: View {
    @Environment(\.modelContext) private var context
    @StateObject private var vm = TimerViewModel()
    @State private var showManual = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    // Timer display
                    timerDisplay

                    Spacer()

                    // Client pills
                    clientRow
                        .padding(.bottom, 20)

                    // Description
                    descriptionField
                        .padding(.horizontal, 24)
                        .padding(.bottom, 28)

                    // START / STOP
                    mainButton
                        .padding(.horizontal, 24)
                        .padding(.bottom, 16)

                    // Manual link
                    Button("Aggiungi manualmente") { showManual = true }
                        .font(.footnote)
                        .foregroundStyle(Color.temporaTextMuted)
                        .padding(.bottom, 24)

                    // Recent
                    if !vm.recentEntries.isEmpty {
                        recentList
                            .padding(.bottom, 8)
                    }
                }
            }
            .navigationTitle("Tempora")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showManual) {
                ManualEntrySheet(vm: vm)
            }
        }
        .onAppear {
            vm.setup(context: context)
        }
    }

    // MARK: - Timer display

    private var timerDisplay: some View {
        VStack(spacing: 8) {
            Text(Formatters.elapsed(vm.elapsedSeconds))
                .font(.system(size: 80, weight: .thin, design: .monospaced))
                .foregroundStyle(.white)
                .contentTransition(.numericText())
                .scaleEffect(vm.isRunning ? 1.02 : 1.0)
                .animation(
                    vm.isRunning
                        ? .easeInOut(duration: 1.4).repeatForever(autoreverses: true)
                        : .spring(response: 0.3),
                    value: vm.isRunning
                )

            if vm.isRunning, let client = vm.selectedClient {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color(hex: client.color))
                        .frame(width: 7, height: 7)
                    Text(client.name)
                        .font(.subheadline)
                        .foregroundStyle(Color.temporaTextSecondary)
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: vm.isRunning)
    }

    // MARK: - Client row

    private var clientRow: some View {
        Group {
            if vm.clients.isEmpty {
                Text("Aggiungi un cliente dal tab Clienti")
                    .font(.caption)
                    .foregroundStyle(Color.temporaTextMuted)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(vm.clients) { client in
                            ClientPill(client: client, isSelected: vm.selectedClient?.id == client.id)
                                .onTapGesture {
                                    withAnimation(.spring(response: 0.2)) {
                                        vm.selectedClient = client
                                    }
                                }
                        }
                    }
                    .padding(.horizontal, 24)
                }
            }
        }
    }

    // MARK: - Description field

    private var descriptionField: some View {
        TextField("Su cosa stai lavorando?", text: $vm.entryDescription)
            .font(.subheadline)
            .foregroundStyle(.white)
            .padding(.vertical, 14)
            .padding(.horizontal, 16)
            .background(Color.temporaSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.temporaBorder))
            .submitLabel(.done)
    }

    // MARK: - Main button

    private var mainButton: some View {
        Button {
            withAnimation(.spring(response: 0.3)) {
                vm.toggleTimer()
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: vm.isRunning ? "stop.fill" : "play.fill")
                    .font(.title3.weight(.semibold))
                Text(vm.isRunning ? "Stop" : "Start")
                    .font(.title3.weight(.semibold))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(vm.isRunning ? Color.temporaError : Color.temporaSuccess)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .animation(.spring(response: 0.25), value: vm.isRunning)
        }
        .buttonStyle(SpringButtonStyle())
        .disabled(vm.selectedClient == nil && !vm.isRunning)
        .opacity(vm.selectedClient == nil && !vm.isRunning ? 0.4 : 1)
    }

    // MARK: - Recent list

    private var recentList: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Recenti")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
                .padding(.horizontal, 24)
                .padding(.bottom, 8)

            ForEach(Array(vm.recentEntries.enumerated()), id: \.element.entry.id) { i, pair in
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color(hex: pair.client?.color ?? "#6366F1"))
                        .frame(width: 3, height: 36)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(pair.entry.description.isEmpty ? "—" : pair.entry.description)
                            .font(.subheadline)
                            .foregroundStyle(.white)
                            .lineLimit(1)
                        Text(pair.client?.name ?? "")
                            .font(.caption)
                            .foregroundStyle(Color.temporaTextMuted)
                    }

                    Spacer()

                    Text(Formatters.duration(minutes: pair.entry.calculatedDurationMinutes))
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(Color.temporaTextSecondary)

                    Button {
                        vm.replay(pair.entry)
                    } label: {
                        Image(systemName: "play.circle")
                            .font(.title3)
                            .foregroundStyle(Color.temporaIndigo)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 8)

                if i < vm.recentEntries.count - 1 {
                    Divider()
                        .background(Color.temporaBorder)
                        .padding(.leading, 24 + 3 + 12)
                }
            }
        }
    }
}

// MARK: - Manual entry sheet

private struct ManualEntrySheet: View {
    @ObservedObject var vm: TimerViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var date = Date()
    @State private var start = Calendar.current.date(byAdding: .hour, value: -1, to: Date())!
    @State private var end = Date()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()
                Form {
                    Section("Cliente") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(vm.clients) { client in
                                    ClientPill(client: client, isSelected: vm.selectedClient?.id == client.id)
                                        .onTapGesture { vm.selectedClient = client }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                        .listRowBackground(Color.temporaSurfaceElevated)
                    }

                    Section("Attività") {
                        TextField("Descrizione", text: $vm.entryDescription)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurfaceElevated)
                    }

                    Section("Orari") {
                        DatePicker("Data", selection: $date, displayedComponents: .date)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurfaceElevated)
                        DatePicker("Inizio", selection: $start, displayedComponents: .hourAndMinute)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurfaceElevated)
                        DatePicker("Fine", selection: $end, displayedComponents: .hourAndMinute)
                            .foregroundStyle(.white)
                            .listRowBackground(Color.temporaSurfaceElevated)

                        let mins = max(0, Int(end.timeIntervalSince(start) / 60))
                        LabeledContent("Durata", value: Formatters.duration(minutes: mins))
                            .foregroundStyle(Color.temporaTextSecondary)
                            .listRowBackground(Color.temporaSurfaceElevated)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Voce manuale")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") { dismiss() }.foregroundStyle(Color.temporaTextMuted)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") {
                        vm.saveManual(start: start, end: end, date: date)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.temporaIndigo)
                    .disabled(vm.selectedClient == nil || end <= start)
                }
            }
        }
    }
}

// MARK: - Button style

private struct SpringButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.spring(response: 0.2), value: configuration.isPressed)
    }
}
