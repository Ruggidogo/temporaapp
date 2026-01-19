import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Puzzle, Calendar, CreditCard, MessageSquare, FileText, Cloud, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const integrations = [
  {
    icon: Calendar,
    name: "Google Calendar",
    description: "Sincronizza automaticamente i tuoi eventi e traccia il tempo direttamente dal calendario.",
    status: "Disponibile",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: CreditCard,
    name: "Stripe",
    description: "Genera fatture automatiche basate sulle ore tracciate per ogni cliente.",
    status: "Disponibile",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    icon: MessageSquare,
    name: "Slack",
    description: "Ricevi notifiche e aggiorna i timer direttamente da Slack.",
    status: "Prossimamente",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    icon: FileText,
    name: "Notion",
    description: "Collega i tuoi progetti Notion e traccia il tempo per ogni task.",
    status: "Prossimamente",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    icon: Cloud,
    name: "Dropbox",
    description: "Salva automaticamente i report e i backup nel tuo Dropbox.",
    status: "Prossimamente",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    icon: Zap,
    name: "Zapier",
    description: "Connetti Tempora con oltre 5000 app tramite Zapier.",
    status: "Prossimamente",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

export default function Integrations() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

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
              <Puzzle className="w-4 h-4" />
              <span className="text-sm font-medium">Integrazioni</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Connetti i tuoi{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                strumenti preferiti
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tempora si integra perfettamente con le app che già usi, 
              rendendo il time tracking ancora più semplice e automatico.
            </p>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="py-20">
          <div 
            ref={gridRef}
            className="container transition-all duration-1000"
            style={{
              opacity: gridVisible ? 1 : 0,
              transform: gridVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => (
                <div
                  key={integration.name}
                  className="group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center mb-4`}>
                    <integration.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{integration.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      integration.status === "Disponibile" 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {integration.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">
                Non trovi l'integrazione che cerchi? Faccelo sapere!
              </p>
              <Link to="/support">
                <Button size="lg" className="gap-2">
                  Richiedi un'integrazione
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
