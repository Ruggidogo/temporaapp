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
              Ai sensi dell'Art. 122 del D.Lgs. 196/2003 e del Provvedimento del Garante n. 229/2014
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
                
                <p className="text-sm text-muted-foreground">
                  Ultimo aggiornamento: 19 Gennaio 2026
                </p>

                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Cosa Sono i Cookie</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I cookie sono piccoli file di testo che i siti web visitati inviano al dispositivo 
                    dell'utente (computer, tablet, smartphone), dove vengono memorizzati per essere 
                    ritrasmessi agli stessi siti alla visita successiva. I cookie permettono al sito 
                    di ricordare le azioni e preferenze dell'utente (login, lingua, dimensioni dei 
                    caratteri e altre impostazioni di visualizzazione).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Tipologie di Cookie Utilizzati</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Il sito utilizza le seguenti categorie di cookie:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50 border-l-4 border-primary">
                      <h3 className="font-semibold mb-2">Cookie Tecnici Essenziali</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        <strong>Base giuridica:</strong> necessari per l'esecuzione del contratto (Art. 6.1.b GDPR)
                      </p>
                      <p className="text-muted-foreground text-sm mb-2">
                        <strong>Finalità:</strong> autenticazione, gestione sessione, sicurezza, preferenze utente (tema, lingua)
                      </p>
                      <p className="text-muted-foreground text-sm mb-2">
                        <strong>Durata:</strong> sessione o max 30 giorni
                      </p>
                      <p className="text-muted-foreground text-sm">
                        <strong>Nota:</strong> Non possono essere disabilitati in quanto essenziali per il funzionamento del Servizio
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50 border-l-4 border-blue-500">
                      <h3 className="font-semibold mb-2">Cookie Analitici (Anonimi)</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        <strong>Base giuridica:</strong> legittimo interesse (Art. 6.1.f GDPR) - dati anonimizzati
                      </p>
                      <p className="text-muted-foreground text-sm mb-2">
                        <strong>Finalità:</strong> analisi aggregate sull'utilizzo del sito per migliorare il Servizio
                      </p>
                      <p className="text-muted-foreground text-sm mb-2">
                        <strong>Durata:</strong> max 24 mesi
                      </p>
                      <p className="text-muted-foreground text-sm">
                        <strong>Nota:</strong> I dati sono aggregati e anonimizzati, non permettono l'identificazione dell'utente
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Cookie di Terze Parti</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Il sito può utilizzare servizi di terze parti che installano propri cookie:
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-muted-foreground">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 font-semibold text-foreground">Fornitore</th>
                          <th className="text-left py-3 font-semibold text-foreground">Finalità</th>
                          <th className="text-left py-3 font-semibold text-foreground">Privacy Policy</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-3">Stripe Inc.</td>
                          <td className="py-3">Elaborazione pagamenti sicuri</td>
                          <td className="py-3">
                            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              stripe.com/privacy
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Gestione dei Cookie</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    L'utente può gestire le preferenze sui cookie in diversi modi:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Tramite il Browser</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        Ogni browser permette di gestire le impostazioni dei cookie. Di seguito i link alle guide:
                      </p>
                      <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                        <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Opt-out Analytics</h3>
                      <p className="text-muted-foreground text-sm">
                        Per disabilitare i cookie analitici, contatta 
                        <a href="mailto:privacy@tempora.app" className="text-primary hover:underline ml-1">
                          privacy@tempora.app
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    <strong>Attenzione:</strong> la disabilitazione dei cookie tecnici può compromettere 
                    l'utilizzo del Servizio, impedendo ad esempio l'autenticazione.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Durata dei Cookie</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Cookie di sessione:</strong> eliminati alla chiusura del browser</li>
                    <li><strong>Cookie persistenti:</strong> rimangono memorizzati fino alla scadenza o cancellazione manuale</li>
                    <li><strong>Cookie di autenticazione:</strong> max 30 giorni (o fino al logout manuale)</li>
                    <li><strong>Cookie di preferenze:</strong> max 12 mesi</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Trasferimento Dati</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Alcuni cookie di terze parti (es. Stripe) possono comportare il trasferimento di dati 
                    verso paesi extra-UE. In tali casi, il trasferimento avviene sulla base di garanzie 
                    adeguate previste dal GDPR (Clausole Contrattuali Standard). Per maggiori informazioni, 
                    consulta la Privacy Policy del fornitore terzo.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Aggiornamenti</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    La presente Cookie Policy può essere aggiornata periodicamente. La data dell'ultimo 
                    aggiornamento è indicata in alto. Ti invitiamo a consultare periodicamente questa 
                    pagina per eventuali modifiche.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Diritti dell'Utente</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Per l'esercizio dei diritti previsti dal GDPR (accesso, rettifica, cancellazione, 
                    opposizione, portabilità) relativi ai dati raccolti tramite cookie, consulta la 
                    nostra <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> o 
                    contatta:
                  </p>
                  <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
                    <li><strong>Email:</strong> <a href="mailto:privacy@tempora.app" className="text-primary hover:underline">privacy@tempora.app</a></li>
                    <li><strong>Titolare:</strong> Tempora S.r.l., Via Example 123, 20100 Milano (MI)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Autorità di Controllo</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Per reclami relativi al trattamento dei dati tramite cookie, puoi rivolgerti al 
                    Garante per la Protezione dei Dati Personali: 
                    <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      www.garanteprivacy.it
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
