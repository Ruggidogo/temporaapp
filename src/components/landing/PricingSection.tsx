import { Button } from "@/components/ui/button";
import { Check, Sparkles, Shield, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

export function PricingSection() {
  const features = [
    "Timer illimitato",
    "Clienti e progetti illimitati",
    "Report e analytics avanzati",
    "Export PDF e CSV",
    "Email report ai clienti",
    "Report schedulati automatici",
    "Supporto prioritario",
    "Integrazioni (prossimamente)",
  ];

  return (
    <section className="py-28 md:py-36 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Un prezzo semplice.
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Zero sorprese.</span>
          </h2>
          <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            Inizia con 14 giorni gratuiti, poi scegli se continuare. 
            Nessuna carta richiesta per provare.
          </p>
        </div>

        <div className="max-w-lg mx-auto animate-scale-in" style={{ animationDelay: '200ms' }}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-3xl blur-xl opacity-30" />
            
            <div className="relative rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-card via-card to-card/80 overflow-hidden shadow-2xl">
              {/* Header gradient */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
              
              {/* Popular badge */}
              <div className="relative pt-8 pb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 text-sm font-semibold mb-6">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Più popolare</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Tempora Pro</h3>
                <p className="text-muted-foreground">
                  Tutto quello che serve per tracciare il tuo tempo come un professionista.
                </p>
              </div>
              
              <div className="p-8 pt-4">
                {/* Price */}
                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">€14,99</span>
                    <span className="text-xl text-muted-foreground">/mese</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Fatturato mensilmente • Cancella quando vuoi
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {features.map((feature, index) => (
                    <li key={feature} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${(index + 3) * 50}ms` }}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-success to-emerald-400 flex items-center justify-center shadow-lg shadow-success/30">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button variant="hero" size="xl" className="w-full shadow-2xl shadow-primary/30" asChild>
                  <Link to="/register">
                    <Sparkles className="w-5 h-5" />
                    Inizia prova gratuita
                  </Link>
                </Button>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  14 giorni gratuiti • Nessuna carta richiesta
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground mb-6 font-medium">Pagamenti sicuri e protetti</p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <span className="font-bold text-muted-foreground tracking-tight">stripe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
