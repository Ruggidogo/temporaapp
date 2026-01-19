import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Cookie } from "lucide-react";

export default function Cookies() {
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
              <Cookie className="w-4 h-4" />
              <span className="text-sm font-medium">Cookie Policy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Informativa sui{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Cookie
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
                  <h2 className="text-2xl font-bold mb-4">1. Cosa sono i cookie</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo 
                    quando visiti un sito web. Servono a migliorare la tua esperienza di navigazione 
                    e a fornire funzionalità essenziali del servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Cookie che utilizziamo</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Tempora utilizza le seguenti categorie di cookie:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Cookie essenziali</h3>
                      <p className="text-muted-foreground text-sm">
                        Necessari per il funzionamento del sito. Includono cookie di sessione 
                        e autenticazione. Non possono essere disabilitati.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Cookie funzionali</h3>
                      <p className="text-muted-foreground text-sm">
                        Permettono di ricordare le tue preferenze, come la lingua e il tema 
                        (chiaro/scuro). Migliorano la tua esperienza d'uso.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Cookie analitici</h3>
                      <p className="text-muted-foreground text-sm">
                        Ci aiutano a capire come gli utenti interagiscono con il sito. I dati 
                        sono anonimi e aggregati. Puoi disabilitarli nelle preferenze.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Cookie di terze parti</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Utilizziamo servizi di terze parti che potrebbero impostare propri cookie:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Stripe:</strong> Per elaborare i pagamenti in sicurezza</li>
                    <li><strong>Analytics:</strong> Per analisi anonime del traffico</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Durata dei cookie</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    I cookie hanno durate diverse:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Cookie di sessione:</strong> Eliminati alla chiusura del browser</li>
                    <li><strong>Cookie persistenti:</strong> Rimangono fino a 1 anno</li>
                    <li><strong>Cookie di autenticazione:</strong> 30 giorni (o fino al logout)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Come gestire i cookie</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Puoi controllare e gestire i cookie in diversi modi:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Attraverso le impostazioni del tuo browser</li>
                    <li>Utilizzando il banner dei cookie alla prima visita</li>
                    <li>Dalle impostazioni del tuo account Tempora</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Nota: disabilitare alcuni cookie potrebbe influire sul funzionamento del servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Aggiornamenti</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Potremmo aggiornare questa Cookie Policy periodicamente. Ti informeremo di 
                    eventuali modifiche significative tramite email o notifica nel servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Contatti</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Per domande sui cookie, contattaci: 
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
