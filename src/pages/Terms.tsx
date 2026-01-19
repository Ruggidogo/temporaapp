import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FileText } from "lucide-react";

export default function Terms() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div 
            ref={heroRef}
            className="container relative z-10 text-center transition-all duration-1000"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Termini di Servizio</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Termini e{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Condizioni
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ultimo aggiornamento: Gennaio 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div 
            ref={contentRef}
            className="container max-w-3xl transition-all duration-1000"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Accettazione dei termini</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Utilizzando Tempora, accetti di essere vincolato da questi Termini di Servizio. 
                    Se non accetti questi termini, non utilizzare il servizio. Ci riserviamo il diritto 
                    di modificare questi termini in qualsiasi momento, con notifica agli utenti registrati.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Descrizione del servizio</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tempora è un servizio di time tracking online che permette agli utenti di tracciare 
                    le ore lavorate, gestire clienti e generare report. Il servizio è disponibile in 
                    versione gratuita (trial) e a pagamento (Pro).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Account utente</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Per utilizzare Tempora, devi:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Avere almeno 18 anni di età</li>
                    <li>Fornire informazioni accurate durante la registrazione</li>
                    <li>Mantenere la sicurezza del tuo account e password</li>
                    <li>Notificarci immediatamente di eventuali accessi non autorizzati</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Abbonamento e pagamenti</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Il piano Pro di Tempora prevede:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Fatturazione mensile di €14,99</li>
                    <li>Rinnovo automatico fino alla cancellazione</li>
                    <li>Possibilità di annullare in qualsiasi momento</li>
                    <li>Nessun rimborso per periodi parzialmente utilizzati</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Uso accettabile</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    È vietato utilizzare Tempora per:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Attività illegali o fraudolente</li>
                    <li>Violare i diritti di terzi</li>
                    <li>Distribuire malware o contenuti dannosi</li>
                    <li>Tentare di accedere a sistemi non autorizzati</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Proprietà intellettuale</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tempora e tutti i suoi contenuti, funzionalità e design sono di nostra proprietà 
                    esclusiva. Non è consentito copiare, modificare, distribuire o creare opere 
                    derivate senza il nostro esplicito consenso scritto.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Limitazione di responsabilità</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tempora viene fornito "così com'è". Non garantiamo che il servizio sarà sempre 
                    disponibile, sicuro o privo di errori. In nessun caso saremo responsabili per 
                    danni indiretti, incidentali o consequenti derivanti dall'uso del servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Risoluzione</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Possiamo sospendere o terminare il tuo account in caso di violazione di questi 
                    termini. Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni. 
                    Alla cancellazione, i tuoi dati saranno eliminati entro 30 giorni.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Legge applicabile</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia 
                    sarà competente il Foro di Milano.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. Contatti</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Per domande sui Termini di Servizio, contattaci: 
                    <a href="mailto:legal@tempora.app" className="text-primary hover:underline ml-1">
                      legal@tempora.app
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
