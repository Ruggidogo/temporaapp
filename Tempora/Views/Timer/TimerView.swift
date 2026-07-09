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
                            .padding(.top, 8)

                        if vm.inputMode == .timer {
                            timerSection
                        } else {
                            manualSection
                        }

                        clientSection
                            .padding(.top, 24)

                        descriptionField
                            .padding(.top, 16)
                            .padding(.horizontal)

                        actionButton
                            .padding(.top, 24)
                            .padding(.horizontal)

                        if !vm.recentEntries.isEmpty {
                            recentSection
                                .padding(.top, 32)
                        }

                        Spacer(minLength: 40)
                    }
                }
            }
            .navigationTitle("Tempora")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if vm.isRunning {
                        runningBadge
                    }
                }
            }
        }
        .onAppear { vm.configure(context: context) }
    }

    // MARK: - Subviews

    private var modeToggle: some View {
        Picker("Modalità", selection: $vm.inputMode) {
            Text("Timer").tag(TimerViewModel.InputMode.timer)
            Text("Manuale").tag(TimerViewModel.InputMode.manual)
        }
        .pickerStyle(.segmented)
        .padding(.horizontal)
    }

    private var timerSection: some View {
        VStack(spacing: 8) {
            TimerDisplay(
                seconds: vm.timerService.elapsedSeconds,
                isRunning: vm.isRunning
            )
            .padding(.top, 32)

            if vm.isRunning {
                Text("In esecuzione…")
                    .font(.caption)
                    .foregroundStyle(Color.temporaSuccess)
            }
        }
    }

    private var manualSection: some View {
        VStack(spacing: 16) {
            DatePicker("Data", selection: $vm.manualDate, displayedComponents: .date)
                .datePickerStyle(.compact)
                .padding(.horizontal)
                .padding(.top, 24)

            HStack {
                DatePicker("Inizio", selection: $vm.manualStart, displayedComponents: .hourAndMinute)
                DatePicker("Fine", selection: $vm.manualEnd, displayedComponents: .hourAndMinute)
            }
            .datePickerStyle(.compact)
            .padding(.horizontal)

            let mins = max(0, Int(vm.manualEnd.timeIntervalSince(vm.manualStart) / 60))
            Text("Durata: \(Formatters.duration(minutes: mins))")
                .font(.subheadline)
                .foregroundStyle(Color.temporaTextSecondary)
        }
    }

    private var clientSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cliente")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
                .textCase(.uppercase)
                .tracking(0.8)
                .padding(.horizontal)

            ClientSelectorView(clients: vm.clients, selected: $vm.selectedClient)
        }
    }

    private var descriptionField: some View {
        TextField("Descrizione attività…", text: $vm.description)
            .padding(14)
            .background(Color.temporaSurfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.temporaBorder))
            .foregroundStyle(.white)
            .submitLabel(.done)
            .onSubmit { hideKeyboard() }
    }

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
                .disabled(vm.selectedClient == nil && !vm.isRunning)
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

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recenti")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.temporaTextMuted)
                .textCase(.uppercase)
                .tracking(0.8)
                .padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(vm.recentEntries, id: \.0.id) { entry, client in
                    EntryRow(entry: entry, client: client)
                        .padding(.horizontal, 12)
                        .contentShape(Rectangle())
                        .overlay(alignment: .trailing) {
                            Button {
                                vm.replay(entry: entry)
                            } label: {
                                Image(systemName: "play.circle.fill")
                                    .font(.title3)
                                    .foregroundStyle(Color.temporaIndigo)
                            }
                            .padding(.trailing, 12)
                        }

                    if entry.id != vm.recentEntries.last?.0.id {
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

    private var runningBadge: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(Color.temporaError)
                .frame(width: 8, height: 8)
            Text("LIVE")
                .font(.caption2.weight(.bold))
                .foregroundStyle(Color.temporaError)
        }
    }
}
