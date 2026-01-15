import { Button } from "@/components/ui/button";
import { Check, Sparkles, Shield, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax, useMouseParallax } from "@/hooks/useParallax";

export function PricingSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: cardRef, isVisible: cardVisible } = useScrollAnimation();
  const { ref: trustRef, isVisible: trustVisible } = useScrollAnimation();

  // Parallax effects
  const parallaxSlow = useParallax({ speed: 0.1, direction: "up" });
  const mousePosition = useMouseParallax(0.008);

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
      {/* Background with parallax */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div 
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(calc(-50% + ${mousePosition.x * 0.3}px), calc(-50% + ${parallaxSlow + mousePosition.y * 0.3}px))` 
        }}
      />

      {/* Decorative shapes with parallax */}
      <div 
        className="absolute top-24 left-[10%] w-20 h-20 rounded-full border border-primary/10 hidden lg:block transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow * 1.5}px) rotate(${parallaxSlow * 0.1}deg)` }}
      />
      <div 
        className="absolute bottom-32 right-[12%] w-16 h-16 rounded-xl border border-purple-500/10 hidden lg:block transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow * 2}px) rotate(${-parallaxSlow * 0.12}deg)` }}
      />
      
      <div className="container relative">
        <div 
          ref={titleRef}
          className="text-center max-w-3xl mx-auto mb-16 transition-all duration-700"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Un prezzo semplice.
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Zero sorprese.</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Inizia con 14 giorni gratuiti, poi scegli se continuare. 
            Nessuna carta richiesta per provare.
          </p>
        </div>

        <div 
          ref={cardRef}
          className="max-w-lg mx-auto transition-all duration-1000"
          style={{
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
            transitionDelay: "200ms",
          }}
        >
          <div className="relative">
            {/* Glow effect with mouse parallax */}
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-3xl blur-xl opacity-30 transition-transform duration-100 ease-out"
              style={{ 
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` 
              }}
            />
            
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
                    <li 
                      key={feature} 
                      className="flex items-center gap-4 transition-all duration-500"
                      style={{
                        opacity: cardVisible ? 1 : 0,
                        transform: cardVisible ? "translateX(0)" : "translateX(-20px)",
                        transitionDelay: `${(index + 4) * 80}ms`,
                      }}
                    >
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
        <div 
          ref={trustRef}
          className="mt-20 text-center transition-all duration-700"
          style={{
            opacity: trustVisible ? 1 : 0,
            transform: trustVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
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
