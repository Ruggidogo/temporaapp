import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield } from "lucide-react";

export default function Privacy() {
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
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Privacy Policy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Informativa sulla{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Privacy
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
                  <h2 className="text-2xl font-bold mb-4">1. Introduzione</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tempora ("noi", "nostro" o "Tempora") si impegna a proteggere la privacy dei propri utenti. 
                    Questa Informativa sulla Privacy descrive come raccogliamo, utilizziamo e proteggiamo le 
                    informazioni personali quando utilizzi il nostro servizio di time tracking.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Dati che raccogliamo</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Raccogliamo i seguenti tipi di informazioni:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Informazioni di registrazione (nome, email, password)</li>
                    <li>Dati di time tracking (ore lavorate, clienti, progetti)</li>
                    <li>Informazioni di fatturazione (per gli abbonamenti Pro)</li>
                    <li>Dati di utilizzo e analytics anonimi</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Come utilizziamo i dati</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Utilizziamo le informazioni raccolte per:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Fornire e migliorare il servizio Tempora</li>
                    <li>Gestire il tuo account e l'abbonamento</li>
                    <li>Inviare comunicazioni relative al servizio</li>
                    <li>Analizzare l'utilizzo per migliorare l'esperienza utente</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Sicurezza dei dati</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Implementiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati, 
                    inclusa la crittografia end-to-end, backup regolari e accesso limitato ai dati personali. 
                    I tuoi dati sono conservati in data center sicuri situati nell'Unione Europea.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Condivisione dei dati</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Non vendiamo, affittiamo o condividiamo le tue informazioni personali con terze parti 
                    per scopi di marketing. Possiamo condividere i dati solo con fornitori di servizi che 
                    ci aiutano a gestire il servizio (es. processori di pagamento) e solo nella misura 
                    necessaria per fornire il servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. I tuoi diritti</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    In conformità con il GDPR, hai il diritto di:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Accedere ai tuoi dati personali</li>
                    <li>Correggere dati inesatti</li>
                    <li>Richiedere la cancellazione dei dati</li>
                    <li>Esportare i tuoi dati</li>
                    <li>Opporti al trattamento dei dati</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Contatti</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Per qualsiasi domanda sulla privacy, contattaci all'indirizzo: 
                    <a href="mailto:privacy@tempora.app" className="text-primary hover:underline ml-1">
                      privacy@tempora.app
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
