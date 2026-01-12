import { Button } from "@/components/ui/button";
import { Play, Clock, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-pattern">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="container relative py-24 md:py-32 lg:py-40">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Prova gratuita 14 giorni • Nessuna carta richiesta
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Il tempo è denaro.
            <br />
            <span className="text-gradient">Traccialo con stile.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Tempora è il time tracking più semplice e bello che tu abbia mai usato. 
            Perfetto per freelancer e piccole aziende che vogliono lavorare meglio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button variant="hero" size="xl" className="group">
              <Play className="w-5 h-5" />
              Inizia gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="hero-outline" size="xl">
              <Clock className="w-5 h-5" />
              Vedi come funziona
            </Button>
          </div>

          {/* Timer Preview Card */}
          <div className="w-full max-w-2xl">
            <div className="relative rounded-2xl border-2 border-border bg-card p-8 shadow-2xl animate-scale-in">
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-success animate-pulse" />
              
              {/* Timer display */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-client-violet" />
                  <span className="text-sm font-medium text-muted-foreground">Acme Corp</span>
                </div>
                
                <div className="font-mono text-6xl md:text-7xl font-bold tracking-tighter mb-4">
                  02:34:15
                </div>
                
                <p className="text-muted-foreground mb-8">Sviluppo landing page</p>
                
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-success text-success-foreground shadow-lg">
                    <div className="w-4 h-4 bg-current rounded-sm" />
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted text-muted-foreground">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
