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
              Ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003
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
                  <h2 className="text-2xl font-bold mb-4">1. Titolare del Trattamento</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Il Titolare del trattamento dei dati personali è Tempora S.r.l., con sede legale in 
                    Via Example 123, 20100 Milano (MI), Italia, P.IVA 12345678901, email: 
                    <a href="mailto:privacy@tempora.app" className="text-primary hover:underline ml-1">
                      privacy@tempora.app
                    </a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Categorie di Dati Raccolti</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Raccogliamo le seguenti categorie di dati personali:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Dati identificativi:</strong> nome, cognome, indirizzo email</li>
                    <li><strong>Dati di accesso:</strong> credenziali di autenticazione (password cifrata)</li>
                    <li><strong>Dati di utilizzo:</strong> time entries, clienti, progetti, ore lavorate</li>
                    <li><strong>Dati di navigazione:</strong> indirizzo IP, browser, sistema operativo, timestamp di accesso</li>
                    <li><strong>Dati di pagamento:</strong> elaborati tramite Stripe Inc. (non conserviamo dati delle carte)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Finalità e Base Giuridica del Trattamento</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    I dati personali sono trattati per le seguenti finalità:
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">a) Esecuzione del contratto (Art. 6.1.b GDPR)</h3>
                      <p className="text-muted-foreground text-sm">
                        Creazione e gestione dell'account, erogazione del servizio di time tracking, 
                        gestione degli abbonamenti e fatturazione.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">b) Obblighi di legge (Art. 6.1.c GDPR)</h3>
                      <p className="text-muted-foreground text-sm">
                        Adempimenti fiscali, contabili e amministrativi previsti dalla normativa vigente.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">c) Legittimo interesse (Art. 6.1.f GDPR)</h3>
                      <p className="text-muted-foreground text-sm">
                        Sicurezza del servizio, prevenzione frodi, miglioramento dell'esperienza utente, 
                        analytics aggregati e anonimi.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">d) Consenso (Art. 6.1.a GDPR)</h3>
                      <p className="text-muted-foreground text-sm">
                        Invio di comunicazioni promozionali e newsletter (solo previo consenso esplicito, 
                        revocabile in qualsiasi momento).
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Destinatari dei Dati</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    I dati possono essere comunicati a:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Stripe Inc.:</strong> per l'elaborazione dei pagamenti (Privacy Shield/SCC)</li>
                    <li><strong>Provider di hosting:</strong> infrastruttura cloud con server ubicati nell'UE</li>
                    <li><strong>Consulenti:</strong> commercialisti e legali, vincolati da obblighi di riservatezza</li>
                    <li><strong>Autorità:</strong> quando richiesto dalla legge</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Non vendiamo, affittiamo o condividiamo i tuoi dati con terze parti per finalità di marketing.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Trasferimenti Extra-UE</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Alcuni fornitori (es. Stripe) possono trattare dati negli Stati Uniti. In questi casi, 
                    il trasferimento avviene sulla base di Clausole Contrattuali Standard (SCC) approvate 
                    dalla Commissione Europea o altre garanzie adeguate previste dal GDPR.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Periodo di Conservazione</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Dati dell'account:</strong> per tutta la durata del rapporto contrattuale + 10 anni (obblighi fiscali)</li>
                    <li><strong>Dati di fatturazione:</strong> 10 anni dalla data della fattura</li>
                    <li><strong>Dati di navigazione:</strong> massimo 24 mesi</li>
                    <li><strong>Backup:</strong> massimo 90 giorni dalla cancellazione dell'account</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Diritti dell'Interessato</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Ai sensi degli artt. 15-22 del GDPR, hai diritto di:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Accesso:</strong> ottenere conferma del trattamento e copia dei dati</li>
                    <li><strong>Rettifica:</strong> correggere dati inesatti o incompleti</li>
                    <li><strong>Cancellazione:</strong> richiedere la cancellazione ("diritto all'oblio")</li>
                    <li><strong>Limitazione:</strong> limitare il trattamento in determinati casi</li>
                    <li><strong>Portabilità:</strong> ricevere i dati in formato strutturato e leggibile</li>
                    <li><strong>Opposizione:</strong> opporsi al trattamento per legittimo interesse</li>
                    <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Per esercitare i tuoi diritti, contatta: 
                    <a href="mailto:privacy@tempora.app" className="text-primary hover:underline ml-1">
                      privacy@tempora.app
                    </a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Reclamo all'Autorità</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Hai il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali 
                    (www.garanteprivacy.it) se ritieni che il trattamento dei tuoi dati violi il GDPR.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Sicurezza</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali, 
                    tra cui: crittografia TLS per i dati in transito, cifratura a riposo per i dati 
                    sensibili, autenticazione sicura, backup regolari, accesso limitato ai dati su 
                    base "need-to-know", monitoraggio continuo della sicurezza.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. Modifiche alla Privacy Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ci riserviamo il diritto di modificare questa informativa. Le modifiche saranno 
                    pubblicate su questa pagina con aggiornamento della data. Per modifiche sostanziali, 
                    ti informeremo via email.
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
