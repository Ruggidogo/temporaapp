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
              Condizioni Generali di Servizio
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
                  <h2 className="text-2xl font-bold mb-4">1. Definizioni</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>"Tempora" o "Fornitore":</strong> Tempora S.r.l., con sede in Via Example 123, 20100 Milano (MI), P.IVA 12345678901</li>
                    <li><strong>"Servizio":</strong> la piattaforma di time tracking accessibile via web all'indirizzo temporaapp.lovable.app</li>
                    <li><strong>"Utente":</strong> la persona fisica o giuridica che utilizza il Servizio</li>
                    <li><strong>"Account":</strong> l'insieme di credenziali che identificano l'Utente</li>
                    <li><strong>"Contenuti":</strong> tutti i dati inseriti dall'Utente nel Servizio</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Oggetto del Contratto</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I presenti Termini di Servizio disciplinano l'accesso e l'utilizzo del Servizio Tempora. 
                    L'accesso al Servizio comporta l'accettazione integrale dei presenti Termini. Se non 
                    accetti questi termini, non devi utilizzare il Servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Requisiti per la Registrazione</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Per registrarsi al Servizio, l'Utente deve:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Avere almeno 18 anni di età o la capacità legale di stipulare contratti</li>
                    <li>Fornire informazioni veritiere, accurate e complete</li>
                    <li>Mantenere aggiornate le informazioni del proprio profilo</li>
                    <li>Essere responsabile della riservatezza delle credenziali di accesso</li>
                    <li>Notificare immediatamente eventuali accessi non autorizzati</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Piani e Prezzi</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Trial Gratuito</h3>
                      <p className="text-muted-foreground text-sm">
                        Il Servizio offre un periodo di prova gratuita di 7 giorni con accesso a tutte 
                        le funzionalità. Non è richiesta carta di credito per l'attivazione.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <h3 className="font-semibold mb-2">Piano Pro</h3>
                      <p className="text-muted-foreground text-sm">
                        Abbonamento mensile al costo di €14,99/mese (IVA inclusa). Il rinnovo è automatico 
                        salvo disdetta. Il pagamento viene elaborato tramite Stripe.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Diritto di Recesso</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ai sensi degli artt. 52-59 del Codice del Consumo (D.Lgs. 206/2005), l'Utente consumatore 
                    ha diritto di recedere dal contratto entro 14 giorni dalla sottoscrizione dell'abbonamento, 
                    senza specificarne il motivo. Per esercitare il diritto di recesso, inviare comunicazione a 
                    <a href="mailto:supporto@tempora.app" className="text-primary hover:underline ml-1">
                      supporto@tempora.app
                    </a>. 
                    Il rimborso sarà effettuato entro 14 giorni utilizzando lo stesso metodo di pagamento.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Disdetta e Cancellazione</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>L'Utente può disdire l'abbonamento in qualsiasi momento dalle Impostazioni</li>
                    <li>La disdetta ha effetto alla scadenza del periodo già pagato</li>
                    <li>Non sono previsti rimborsi per periodi parzialmente utilizzati (dopo i 14 giorni di recesso)</li>
                    <li>I dati dell'Utente saranno cancellati entro 30 giorni dalla chiusura dell'account</li>
                    <li>L'Utente può richiedere l'esportazione dei propri dati prima della cancellazione</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Obblighi dell'Utente</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    L'Utente si impegna a:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Utilizzare il Servizio in conformità alla legge e ai presenti Termini</li>
                    <li>Non utilizzare il Servizio per attività illegali, fraudolente o lesive di diritti di terzi</li>
                    <li>Non tentare di accedere a sistemi o dati non autorizzati</li>
                    <li>Non distribuire malware, virus o contenuti dannosi</li>
                    <li>Non sovraccaricare intenzionalmente i sistemi del Servizio</li>
                    <li>Non rivendere o sublicenziare l'accesso al Servizio</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Proprietà Intellettuale</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tutti i diritti di proprietà intellettuale relativi al Servizio (software, design, 
                    marchi, logo, documentazione) sono e rimangono di esclusiva proprietà di Tempora S.r.l. 
                    L'Utente non acquisisce alcun diritto di proprietà sul Servizio. I Contenuti inseriti 
                    dall'Utente rimangono di sua proprietà; l'Utente concede a Tempora una licenza limitata 
                    per elaborarli al solo fine di erogare il Servizio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Disponibilità del Servizio</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tempora si impegna a garantire la disponibilità del Servizio con un uptime del 99,5% 
                    su base mensile, escluse le manutenzioni programmate (comunicate con almeno 48 ore di 
                    anticipo) e gli eventi di forza maggiore. In caso di interruzioni significative, 
                    l'Utente potrà richiedere un'estensione proporzionale dell'abbonamento.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. Limitazione di Responsabilità</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Nei limiti consentiti dalla legge applicabile:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Il Servizio è fornito "così com'è" senza garanzie di idoneità a scopi particolari</li>
                    <li>Tempora non è responsabile per danni indiretti, incidentali, speciali o consequenziali</li>
                    <li>La responsabilità massima di Tempora è limitata all'importo pagato dall'Utente nei 12 mesi precedenti</li>
                    <li>Tempora non è responsabile per la perdita di dati dovuta a cause non imputabili al Fornitore</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Queste limitazioni non si applicano in caso di dolo o colpa grave.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">11. Sospensione e Risoluzione</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Tempora si riserva il diritto di:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Sospendere temporaneamente l'account in caso di sospetta violazione dei Termini</li>
                    <li>Risolvere il contratto con effetto immediato in caso di violazione grave</li>
                    <li>Sospendere l'account per mancato pagamento dopo 7 giorni di mora</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    In caso di risoluzione per inadempimento dell'Utente, non è previsto alcun rimborso.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">12. Modifiche ai Termini</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tempora può modificare i presenti Termini con preavviso di almeno 30 giorni via email. 
                    L'uso continuato del Servizio dopo l'entrata in vigore delle modifiche costituisce 
                    accettazione. In caso di modifiche sostanziali sfavorevoli, l'Utente può recedere 
                    senza penali entro la data di entrata in vigore.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">13. Legge Applicabile e Foro Competente</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I presenti Termini sono regolati dalla legge italiana. Per le controversie con Utenti 
                    consumatori, è competente il foro del luogo di residenza o domicilio del consumatore, 
                    se ubicato in Italia. Per gli Utenti professionisti, è competente in via esclusiva 
                    il Foro di Milano. È possibile ricorrere alla piattaforma ODR della Commissione 
                    Europea per la risoluzione alternativa delle controversie: 
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      ec.europa.eu/consumers/odr
                    </a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">14. Contatti</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Per qualsiasi comunicazione relativa ai presenti Termini:
                  </p>
                  <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
                    <li><strong>Email:</strong> <a href="mailto:legal@tempora.app" className="text-primary hover:underline">legal@tempora.app</a></li>
                    <li><strong>PEC:</strong> tempora@pec.it</li>
                    <li><strong>Indirizzo:</strong> Tempora S.r.l., Via Example 123, 20100 Milano (MI)</li>
                  </ul>
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
