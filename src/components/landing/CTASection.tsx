import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Clock, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function CTASection() {
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollAnimation();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: descRef, isVisible: descVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  return (
    <section className="py-28 md:py-36 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/10" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Floating icons */}
      <div className="absolute top-1/4 left-1/6 w-14 h-14 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center animate-float hidden lg:flex">
        <Clock className="w-6 h-6 text-primary" />
      </div>
      <div className="absolute top-1/3 right-1/6 w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center animate-float hidden lg:flex" style={{ animationDelay: '1s' }}>
        <BarChart3 className="w-6 h-6 text-emerald-500" />
      </div>
      <div className="absolute bottom-1/3 left-1/5 w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center animate-float hidden lg:flex" style={{ animationDelay: '2s' }}>
        <Users className="w-6 h-6 text-blue-500" />
      </div>
      
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div 
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-medium mb-8 transition-all duration-700"
            style={{
              opacity: badgeVisible ? 1 : 0,
              transform: badgeVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Unisciti a migliaia di professionisti</span>
          </div>
          
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 transition-all duration-700"
            style={{
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "100ms",
            }}
          >
            Pronto a riprendere il controllo del tuo{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">tempo</span>?
          </h2>
          
          <p 
            ref={descRef}
            className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto transition-all duration-700"
            style={{
              opacity: descVisible ? 1 : 0,
              transform: descVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "200ms",
            }}
          >
            Inizia oggi stesso e scopri quanto tempo puoi risparmiare 
            con un time tracking che funziona davvero.
          </p>
          
          <div 
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "300ms",
            }}
          >
            <Button variant="hero" size="xl" asChild className="group shadow-2xl shadow-primary/30">
              <Link to="/register">
                <Play className="w-5 h-5 fill-current" />
                Inizia la prova gratuita
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          <p 
            className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2 transition-all duration-700"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transitionDelay: "400ms",
            }}
          >
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              14 giorni gratis
            </span>
            <span className="text-border">•</span>
            <span>Nessuna carta richiesta</span>
            <span className="text-border">•</span>
            <span>Cancella quando vuoi</span>
          </p>
        </div>
      </div>
    </section>
  );
}
