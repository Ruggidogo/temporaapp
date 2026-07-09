import SwiftUI

struct ClientSelectorView: View {
    let clients: [Client]
    @Binding var selected: Client?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(clients.filter(\.isActive)) { client in
                    ClientPill(client: client, isSelected: selected?.id == client.id)
                        .onTapGesture {
                            withAnimation {
                                selected = selected?.id == client.id ? nil : client
                            }
                        }
                }

                NavigationLink {
                    // ClientsListView()  — wired in Step 5
                    Text("Gestisci clienti")
                } label: {
                    Label("Aggiungi", systemImage: "plus")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Color.temporaTextSecondary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Color.temporaSurface)
                        .clipShape(Capsule())
                        .overlay(Capsule().stroke(Color.temporaBorder))
                }
            }
            .padding(.horizontal)
        }
    }
}
