import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

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
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Un prezzo semplice.
            <br />
            <span className="text-gradient">Zero sorprese.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Inizia con 14 giorni gratuiti, poi scegli se continuare. 
            Nessuna carta richiesta per provare.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card variant="pricing-featured" className="relative overflow-hidden animate-scale-in">
            {/* Gradient border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-50" />
            
            <CardHeader className="relative text-center pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 mx-auto">
                <Sparkles className="w-3 h-3" />
                Più popolare
              </div>
              <CardTitle className="text-2xl">Tempora Pro</CardTitle>
              <CardDescription>
                Tutto quello che serve per tracciare il tuo tempo come un professionista.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">€14,99</span>
                  <span className="text-muted-foreground">/mese</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Fatturato mensilmente. Cancella quando vuoi.
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="relative flex flex-col gap-3">
              <Button variant="hero" size="xl" className="w-full">
                Inizia prova gratuita
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                14 giorni gratuiti • Nessuna carta richiesta
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Pagamenti sicuri con</p>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <div className="text-2xl font-bold tracking-tight">stripe</div>
          </div>
        </div>
      </div>
    </section>
  );
}
