import SwiftUI
import SwiftData

struct TimerView: View {

    @Environment(\.modelContext) private var context
    @StateObject private var vm = TimerViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 0) {

                        modeToggle
                            .padding(.top, 12)
                            .padding(.horizontal)

                        if vm.inputMode == .timer {
                            timerSection
                        } else {
                            manualSection
                        }

                        clientSection
                            .padding(.top, 28)

                        descriptionField
                            .padding(.top, 16)
                            .padding(.horizontal)

                        if let error = vm.errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundStyle(Color.temporaError)
                                .padding(.top, 8)
                        }

                        actionButton
                            .padding(.top, 20)
                            .padding(.horizontal)

                        if !vm.recentEntries.isEmpty {
                            recentSection
                                .padding(.top, 36)
                        }

                        Spacer(minLength: 40)
                    }
                }
            }
            .navigationTitle("Tempora")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if vm.isRunning { runningBadge }
                }
            }
        }
        .onAppear {
            vm.configure(context: context)
        }
    }

    // MARK: - Mode toggle

    private var modeToggle: some View {
        Picker("Modalità", selection: $vm.inputMode) {
            Text("Timer").tag(TimerViewModel.InputMode.timer)
            Text("Manuale").tag(TimerViewModel.InputMode.manual)
        }
        .pickerStyle(.segmented)
        .disabled(vm.isRunning)
    }

    // MARK: - Timer section

    private var timerSection: some View {
        VStack(spacing: 6) {
            TimerDisplay(
                seconds: vm.elapsedSeconds,
                isRunning: vm.isRunning
            )
            .padding(.top, 36)
            .padding(.bottom, 4)

            if vm.isRunning {
                Text("In esecuzione…")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Color.temporaSuccess)
            } else {
                Text("Pronto")
                    .font(.caption)
                    .foregroundStyle(Color.temporaTextMuted)
            }
        }
    }

    // MARK: - Manual section

    private var manualSection: some View {
        VStack(spacing: 0) {
            VStack(spacing: 16) {
                DatePicker("Data", selection: $vm.manualDate, displayedComponents: .date)
                    .foregroundStyle(.white)

                DatePicker("Inizio", selection: $vm.manualStart, displayedComponents: .hourAndMinute)
                    .foregroundStyle(.white)

                DatePicker("Fine", selection: $vm.manualEnd, displayedComponents: .hourAndMinute)
                    .foregroundStyle(.white)
            }
            .padding(16)
            .temporaCard(padding: 0)
            .padding(.horizontal)
            .padding(.top, 24)

            let mins = max(0, Int(vm.manualEnd.timeIntervalSince(vm.manualStart) / 60))
            Text("Durata: \(Formatters.duration(minutes: mins))")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Color.temporaTextSecondary)
                .padding(.top, 12)
        }
    }

    // MARK: - Client section

    private var clientSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("CLIENTE")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
                .tracking(1)
                .padding(.horizontal)

            if vm.clients.isEmpty {
                Text("Aggiungi un cliente dalle Impostazioni")
                    .font(.subheadline)
                    .foregroundStyle(Color.temporaTextMuted)
                    .padding(.horizontal)
            } else {
                ClientSelectorView(clients: vm.clients, selected: $vm.selectedClient)
            }
        }
    }

    // MARK: - Description field

    private var descriptionField: some View {
        HStack {
            Image(systemName: "pencil")
                .foregroundStyle(Color.temporaTextMuted)
                .font(.subheadline)
            TextField("Descrizione attività…", text: $vm.description)
                .foregroundStyle(.white)
                .submitLabel(.done)
                .onSubmit { hideKeyboard() }
        }
        .padding(14)
        .background(Color.temporaSurfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.temporaBorder))
    }

    // MARK: - Action button

    private var actionButton: some View {
        Group {
            if vm.inputMode == .timer {
                PrimaryButton(
                    title: vm.isRunning ? "STOP" : "START",
                    systemImage: vm.isRunning ? "stop.fill" : "play.fill",
                    color: vm.isRunning ? .temporaError : .temporaSuccess
                ) {
                    vm.isRunning ? vm.stopTimer() : vm.startTimer()
                }
            } else {
                PrimaryButton(
                    title: "Salva voce",
                    systemImage: "checkmark",
                    color: .temporaIndigo
                ) {
                    vm.saveManualEntry()
                }
                .disabled(vm.selectedClient == nil)
            }
        }
    }

    // MARK: - Recent entries

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("RECENTI")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
                .tracking(1)
                .padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(Array(vm.recentEntries.enumerated()), id: \.element.0.id) { idx, pair in
                    let (entry, client) = pair

                    HStack {
                        EntryRow(entry: entry, client: client)

                        Button {
                            vm.replay(entry: entry)
                        } label: {
                            Image(systemName: "play.circle.fill")
                                .font(.title3)
                                .foregroundStyle(Color.temporaIndigo)
                        }
                        .padding(.trailing, 4)
                    }
                    .padding(.horizontal, 12)

                    if idx < vm.recentEntries.count - 1 {
                        Divider()
                            .background(Color.temporaBorder)
                            .padding(.horizontal, 12)
                    }
                }
            }
            .background(Color.temporaSurfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.temporaBorder))
            .padding(.horizontal)
        }
    }

    // MARK: - Running badge

    private var runningBadge: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(Color.temporaError)
                .frame(width: 7, height: 7)
            Text("LIVE")
                .font(.caption2.weight(.bold))
                .foregroundStyle(Color.temporaError)
        }
    }
}
