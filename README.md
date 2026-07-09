# Tempora iOS

*Il tuo tempo, valorizzato*

App nativa iOS per il tracciamento delle ore fatturabili. Costruita con SwiftUI + SwiftData.

## Stack tecnico
- iOS 17+, SwiftUI, SwiftData
- Swift Charts (report)
- StoreKit 2 (abbonamenti)
- Nessuna dipendenza esterna

## Struttura repository

```
Tempora/
├── App/                  # Entry point + navigazione
├── Models/               # Tipi Swift value (Client, Project, TimeEntry, User)
├── Services/
│   ├── DataModels.swift  # @Model SwiftData (ClientModel, ProjectModel, TimeEntryModel)
│   ├── DataService.swift # CRUD via ModelContext
│   ├── TimerService.swift# Timer async, persiste in background via UserDefaults
│   ├── ExportService.swift
│   ├── StoreKitService.swift
│   └── SyncService.swift # Protocol stub per futuro Supabase
├── ViewModels/           # @MainActor ObservableObject per ogni tab
├── Views/
│   ├── Timer/            # TimerView, ClientSelectorView
│   ├── History/          # HistoryView, EntryDetailView
│   ├── Reports/          # ReportsView (Swift Charts)
│   └── Settings/         # SettingsView, ClientEditView, PaywallView
├── Components/           # TimerDisplay, PrimaryButton, ClientPill, StatCard, EntryRow
├── Utilities/            # Colors (Color(hex:)), Formatters, Extensions
└── Resources/            # Assets.xcassets, Localizable.strings
```

## Apertura in Xcode

1. Crea un nuovo progetto Xcode → **App** (SwiftUI, no Storage)
   - Product Name: `Tempora`
   - Bundle ID: `com.tempora.app`
   - Minimum Deployments: iOS 17.0
2. Elimina i file generati da Xcode (`ContentView.swift`, `TemporaApp.swift`)
3. **File → Add Files to "Tempora"** → seleziona la cartella `Tempora/` di questo repo → ✅ "Create groups"
4. In **Signing & Capabilities** aggiungi:
   - In-App Purchase (per StoreKit)
5. ⌘B — deve compilare senza errori

## Ordine di sviluppo (priority roadmap)

1. ✅ Step 1 — Struttura progetto + SwiftData models
2. Step 2 — TimerView funzionante + persistenza
3. Step 3 — HistoryView con lista voci
4. Step 4 — Gestione clienti in Settings
5. Step 5 — ReportsView con Swift Charts
6. Step 6 — Export CSV/PDF
7. Step 7 — Paywall + StoreKit 2
8. Step 8 — Polish e animazioni

## Bundle ID prodotti StoreKit
- `com.tempora.app.pro.monthly`
- `com.tempora.app.pro.yearly`
