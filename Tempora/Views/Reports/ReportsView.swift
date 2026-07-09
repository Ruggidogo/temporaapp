import SwiftUI
import Charts
import SwiftData

struct ReportsView: View {

    @Environment(\.modelContext) private var context
    @StateObject private var vm = ReportsViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.temporaBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {

                        periodPicker
                            .padding(.horizontal)
                            .padding(.top, 8)

                        dateNavigator
                            .padding(.horizontal)

                        statsRow

                        if !vm.minutesByClient.isEmpty {
                            clientPieChart
                            dailyBarChart
                            clientBreakdownList
                        } else {
                            emptyState
                        }

                        Spacer(minLength: 40)
                    }
                }
            }
            .navigationTitle("Report")
        }
        .onAppear { vm.configure(context: context) }
        .onChange(of: vm.period) { _, _ in vm.load() }
    }

    // MARK: - Period picker

    private var periodPicker: some View {
        Picker("Periodo", selection: $vm.period) {
            ForEach(ReportsViewModel.Period.allCases, id: \.self) {
                Text($0.rawValue).tag($0)
            }
        }
        .pickerStyle(.segmented)
    }

    // MARK: - Date navigator

    private var dateNavigator: some View {
        HStack {
            Button { vm.navigate(by: -1) } label: {
                Image(systemName: "chevron.left")
                    .foregroundStyle(Color.temporaIndigo)
            }
            Spacer()
            Text(vm.rangeLabel)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
            Spacer()
            Button { vm.navigate(by: 1) } label: {
                Image(systemName: "chevron.right")
                    .foregroundStyle(Color.temporaIndigo)
            }
        }
    }

    // MARK: - Stats row

    private var statsRow: some View {
        HStack(spacing: 12) {
            StatCard(
                title: "Ore totali",
                value: Formatters.duration(minutes: vm.totalMinutes),
                gradient: .temporaPrimary
            )
            if vm.totalValue > 0 {
                StatCard(
                    title: "Valore totale",
                    value: Formatters.currency(vm.totalValue),
                    gradient: .temporaPrimary
                )
            }
        }
        .padding(.horizontal)
    }

    // MARK: - Pie chart

    private var clientPieChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Ore per cliente")
                .font(.headline)
                .foregroundStyle(.white)

            Chart(vm.minutesByClient, id: \.client.id) { item in
                SectorMark(
                    angle: .value("Minuti", item.minutes),
                    innerRadius: .ratio(0.55),
                    angularInset: 2
                )
                .foregroundStyle(Color(hex: item.client.color))
            }
            .frame(height: 200)

            // Legend
            VStack(spacing: 8) {
                ForEach(vm.minutesByClient, id: \.client.id) { item in
                    HStack {
                        Circle()
                            .fill(Color(hex: item.client.color))
                            .frame(width: 10, height: 10)
                        Text(item.client.name)
                            .font(.subheadline)
                            .foregroundStyle(.white)
                        Spacer()
                        Text(Formatters.duration(minutes: item.minutes))
                            .font(.subheadline.monospacedDigit())
                            .foregroundStyle(Color.temporaTextSecondary)
                    }
                }
            }
        }
        .temporaCard()
        .padding(.horizontal)
    }

    // MARK: - Bar chart

    private var dailyBarChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Andamento giornaliero")
                .font(.headline)
                .foregroundStyle(.white)

            Chart(vm.dailyPoints) { point in
                BarMark(
                    x: .value("Giorno", point.date, unit: .day),
                    y: .value("Ore", Double(point.minutes) / 60)
                )
                .foregroundStyle(clientColor(for: point.clientId))
                .cornerRadius(4)
            }
            .chartXAxis {
                AxisMarks(values: .stride(by: .day)) { _ in
                    AxisValueLabel(format: .dateTime.day(), centered: true)
                        .foregroundStyle(Color.temporaTextMuted)
                }
            }
            .chartYAxis {
                AxisMarks { value in
                    AxisValueLabel {
                        if let v = value.as(Double.self) {
                            Text(String(format: "%.0fh", v))
                                .foregroundStyle(Color.temporaTextMuted)
                        }
                    }
                    AxisGridLine()
                        .foregroundStyle(Color.temporaBorder)
                }
            }
            .frame(height: 180)
        }
        .temporaCard()
        .padding(.horizontal)
    }

    // MARK: - Client breakdown list

    private var clientBreakdownList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Dettaglio clienti")
                .font(.headline)
                .foregroundStyle(.white)

            ForEach(vm.minutesByClient, id: \.client.id) { item in
                VStack(spacing: 0) {
                    HStack(spacing: 12) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color(hex: item.client.color))
                            .frame(width: 4, height: 44)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.client.name)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.white)
                            Text(Formatters.duration(minutes: item.minutes))
                                .font(.caption.monospacedDigit())
                                .foregroundStyle(Color.temporaTextSecondary)
                        }

                        Spacer()

                        if let rate = item.client.hourlyRate {
                            let hours = Decimal(item.minutes) / 60
                            var product = rate * hours
                            var rounded = Decimal()
                            let _ = NSDecimalRound(&rounded, &product, 2, .plain)
                            Text(Formatters.currency(rounded))
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Color.temporaSuccess)
                        }
                    }
                    .padding(.vertical, 4)

                    if item.client.id != vm.minutesByClient.last?.client.id {
                        Divider().background(Color.temporaBorder)
                    }
                }
            }
        }
        .temporaCard()
        .padding(.horizontal)
    }

    // MARK: - Empty state

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.bar.xaxis")
                .font(.system(size: 44))
                .foregroundStyle(Color.temporaTextMuted)
            Text("Nessun dato")
                .font(.headline)
                .foregroundStyle(Color.temporaTextSecondary)
            Text("Traccia ore per vedere i report.")
                .font(.subheadline)
                .foregroundStyle(Color.temporaTextMuted)
        }
        .padding(.top, 60)
    }

    // MARK: - Helpers

    private func clientColor(for id: UUID) -> Color {
        vm.minutesByClient.first { $0.client.id == id }
            .map { Color(hex: $0.client.color) } ?? .temporaIndigo
    }
}
