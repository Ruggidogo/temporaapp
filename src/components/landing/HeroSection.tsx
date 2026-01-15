import { Button } from "@/components/ui/button";
import { Play, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/30 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-primary/20 to-blue-500/15 rounded-full blur-3xl translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container relative py-28 md:py-36 lg:py-44">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-medium mb-10 animate-fade-in shadow-lg shadow-primary/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-foreground">Prova gratuita 14 giorni</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Nessuna carta richiesta</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Il tempo è denaro.
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Traccialo con stile.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
            Tempora è il time tracking più semplice e bello che tu abbia mai usato. 
            Perfetto per freelancer e piccole aziende.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button variant="hero" size="xl" className="group shadow-2xl shadow-primary/30" asChild>
              <Link to="/register">
                <Play className="w-5 h-5 fill-current" />
                Inizia gratis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="border-2 border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-lg"
            >
              <Clock className="w-5 h-5" />
              Vedi come funziona
            </Button>
          </div>

          {/* Timer Preview Card */}
          <div className="w-full max-w-2xl animate-scale-in" style={{ animationDelay: '400ms' }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 rounded-3xl blur-xl opacity-30" />
              
              <div className="relative rounded-2xl border-2 border-border/50 bg-gradient-to-b from-card to-card/80 p-10 shadow-2xl backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-success to-emerald-400 animate-pulse shadow-lg shadow-success/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                
                {/* Timer display */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/50" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Acme Corp</span>
                  </div>
                  
                  <div className="font-mono text-7xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    02:34:15
                  </div>
                  
                  <p className="text-muted-foreground mb-10 text-lg">Sviluppo landing page</p>
                  
                  <div className="flex gap-4">
                    <button className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-success to-emerald-400 text-white shadow-xl shadow-success/40 hover:shadow-success/60 transition-all duration-300 hover:scale-105">
                      <div className="w-5 h-5 bg-current rounded-sm" />
                    </button>
                    <button className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/80 text-muted-foreground border border-border/50 hover:bg-muted transition-all duration-300 hover:scale-105">
                      <Clock className="w-6 h-6" />
                    </button>
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
