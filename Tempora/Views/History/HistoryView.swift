import SwiftUI
import SwiftData

struct HistoryView: View {

    @Environment(\.modelContext) private var context
    @StateObject private var vm = HistoryViewModel()
    @State private var entryToEdit: TimeEntry?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                VStack(spacing: 0) {
                    periodPicker
                        .padding(.horizontal)
                        .padding(.top, 8)

                    searchBar
                        .padding(.horizontal)
                        .padding(.top, 12)

                    if vm.grouped.isEmpty {
                        emptyState
                    } else {
                        entriesList
                    }
                }
            }
            .navigationTitle("Cronologia")
            .sheet(item: $entryToEdit) { entry in
                EntryDetailView(entry: entry, client: vm.client(for: entry)) {
                    vm.load()
                }
            }
        }
        .onAppear {
            vm.configure(context: context)
        }
    }

    // MARK: - Subviews

    private var periodPicker: some View {
        Picker("Periodo", selection: $vm.selectedPeriod) {
            ForEach(HistoryViewModel.Period.allCases, id: \.self) {
                Text($0.rawValue).tag($0)
            }
        }
        .pickerStyle(.segmented)
    }

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Color.temporaTextMuted)
            TextField("Cerca…", text: $vm.searchText)
                .foregroundStyle(.white)
                .submitLabel(.search)
        }
        .padding(10)
        .background(Color.temporaSurfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.temporaBorder))
    }

    private var entriesList: some View {
        List {
            ForEach(vm.grouped, id: \.key) { day in
                Section {
                    ForEach(day.entries) { entry in
                        EntryRow(entry: entry, client: vm.client(for: entry))
                            .listRowBackground(Color.temporaSurfaceElevated)
                            .listRowSeparatorTint(Color.temporaBorder)
                            .contentShape(Rectangle())
                            .onTapGesture { entryToEdit = entry }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    vm.delete(entry: entry)
                                } label: {
                                    Label("Elimina", systemImage: "trash")
                                }
                            }
                            .swipeActions(edge: .leading) {
                                Button {
                                    entryToEdit = entry
                                } label: {
                                    Label("Modifica", systemImage: "pencil")
                                }
                                .tint(Color.temporaIndigo)
                            }
                    }
                } header: {
                    HStack {
                        Text(Formatters.weekdayAndDate(day.key))
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.temporaTextSecondary)
                        Spacer()
                        Text(Formatters.duration(minutes: vm.totalMinutes(for: day.entries)))
                            .font(.subheadline.weight(.semibold).monospacedDigit())
                            .foregroundStyle(Color.temporaIndigo)
                    }
                    .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 4, trailing: 16))
                }
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Spacer()
            Image(systemName: "clock.badge.xmark")
                .font(.system(size: 44))
                .foregroundStyle(Color.temporaTextMuted)
            Text("Nessuna voce trovata")
                .font(.headline)
                .foregroundStyle(Color.temporaTextSecondary)
            Text("Avvia un timer o aggiungi una voce manuale.")
                .font(.subheadline)
                .foregroundStyle(Color.temporaTextMuted)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding()
    }
}
