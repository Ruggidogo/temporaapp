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
                        .padding(.bottom, 12)

                    searchBar
                        .padding(.horizontal)
                        .padding(.bottom, 8)

                    if vm.grouped.isEmpty {
                        emptyState
                    } else {
                        totalBar
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
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        ForEach(vm.clients.filter(\.isActive)) { client in
                            Button {
                                if vm.selectedClientFilter.contains(client.id) {
                                    vm.selectedClientFilter.remove(client.id)
                                } else {
                                    vm.selectedClientFilter.insert(client.id)
                                }
                            } label: {
                                HStack {
                                    Text(client.name)
                                    if vm.selectedClientFilter.contains(client.id) {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                        if !vm.selectedClientFilter.isEmpty {
                            Divider()
                            Button("Rimuovi filtri", role: .destructive) {
                                vm.selectedClientFilter.removeAll()
                            }
                        }
                    } label: {
                        Image(systemName: vm.selectedClientFilter.isEmpty
                              ? "line.3.horizontal.decrease.circle"
                              : "line.3.horizontal.decrease.circle.fill")
                            .foregroundStyle(Color.temporaIndigo)
                    }
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
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Color.temporaTextMuted)
                .font(.subheadline)
            TextField("Cerca…", text: $vm.searchText)
                .foregroundStyle(.white)
                .submitLabel(.search)
            if !vm.searchText.isEmpty {
                Button { vm.searchText = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Color.temporaTextMuted)
                }
            }
        }
        .padding(10)
        .background(Color.temporaSurfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.temporaBorder))
    }

    private var totalBar: some View {
        HStack {
            Text("\(vm.filtered.count) voci")
                .font(.caption)
                .foregroundStyle(Color.temporaTextMuted)
            Spacer()
            Text(Formatters.duration(minutes: vm.totalMinutes(for: vm.filtered)))
                .font(.caption.weight(.bold).monospacedDigit())
                .foregroundStyle(Color.temporaIndigo)
        }
        .padding(.horizontal)
        .padding(.bottom, 4)
    }

    private var entriesList: some View {
        List {
            ForEach(vm.grouped, id: \.key) { group in
                Section {
                    ForEach(group.entries) { entry in
                        EntryRow(entry: entry, client: vm.client(for: entry))
                            .listRowBackground(Color.temporaSurfaceElevated)
                            .listRowSeparatorTint(Color.temporaBorder)
                            .contentShape(Rectangle())
                            .onTapGesture { entryToEdit = entry }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    withAnimation { vm.delete(entry: entry) }
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
                        Text(Formatters.weekdayAndDate(group.key))
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.temporaTextSecondary)
                        Spacer()
                        Text(Formatters.duration(minutes: vm.totalMinutes(for: group.entries)))
                            .font(.subheadline.weight(.bold).monospacedDigit())
                            .foregroundStyle(Color.temporaIndigo)
                    }
                    .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 6, trailing: 16))
                }
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "clock.badge.xmark")
                .font(.system(size: 52))
                .foregroundStyle(Color.temporaTextMuted)
            Text("Nessuna voce")
                .font(.title3.weight(.semibold))
                .foregroundStyle(Color.temporaTextSecondary)
            Text("Avvia un timer o aggiungi una voce manuale dalla scheda Timer.")
                .font(.subheadline)
                .foregroundStyle(Color.temporaTextMuted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            Spacer()
        }
    }
}
