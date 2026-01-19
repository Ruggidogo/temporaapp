import { Button } from "@/components/ui/button";
import { Play, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax, useMouseParallax } from "@/hooks/useParallax";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroSection() {
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollAnimation();
  const { ref: headlineRef, isVisible: headlineVisible } = useScrollAnimation();
  const { ref: subRef, isVisible: subVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const { ref: cardRef, isVisible: cardVisible } = useScrollAnimation();
  const { t } = useLanguage();

  // Parallax effects
  const parallaxSlow = useParallax({ speed: 0.15, direction: "up" });
  const parallaxMedium = useParallax({ speed: 0.25, direction: "up" });
  const parallaxFast = useParallax({ speed: 0.35, direction: "down" });
  const mousePosition = useMouseParallax(0.015);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Animated gradient orbs with parallax */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/30 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(${mousePosition.x * 0.5}px, calc(-50% + ${parallaxSlow}px + ${mousePosition.y * 0.5}px))` 
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-primary/20 to-blue-500/15 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(${-mousePosition.x * 0.3}px, calc(50% + ${parallaxMedium}px + ${-mousePosition.y * 0.3}px))` 
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(calc(-50% + ${mousePosition.x * 0.2}px), calc(-50% + ${parallaxFast}px + ${mousePosition.y * 0.2}px))` 
        }}
      />

      {/* Floating decorative elements with parallax */}
      <div 
        className="absolute top-32 right-[15%] w-20 h-20 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 hidden lg:block transition-transform duration-100 ease-out"
        style={{ 
          transform: `translateY(${parallaxSlow * 1.5}px) rotate(${parallaxSlow * 0.05}deg)` 
        }}
      />
      <div 
        className="absolute top-1/3 left-[10%] w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hidden lg:block transition-transform duration-100 ease-out"
        style={{ 
          transform: `translateY(${parallaxMedium * 1.2}px) rotate(${-parallaxMedium * 0.08}deg)` 
        }}
      />
      <div 
        className="absolute bottom-1/4 right-[8%] w-12 h-12 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hidden lg:block transition-transform duration-100 ease-out"
        style={{ 
          transform: `translateY(${parallaxFast * 0.8}px) rotate(${parallaxFast * 0.1}deg)` 
        }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container relative py-28 md:py-36 lg:py-44">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div 
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-medium mb-10 shadow-lg shadow-primary/5 transition-all duration-700"
            style={{
              opacity: badgeVisible ? 1 : 0,
              transform: badgeVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-foreground">{t("hero.badge.trial")}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{t("hero.badge.noCard")}</span>
          </div>

          {/* Headline */}
          <h1 
            ref={headlineRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 transition-all duration-700"
            style={{
              opacity: headlineVisible ? 1 : 0,
              transform: headlineVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "100ms",
            }}
          >
            {t("hero.title.line1")}
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              {t("hero.title.line2")}
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            ref={subRef}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 leading-relaxed transition-all duration-700"
            style={{
              opacity: subVisible ? 1 : 0,
              transform: subVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "200ms",
            }}
          >
            {t("hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div 
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 mb-20 transition-all duration-700"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "300ms",
            }}
          >
            <Button variant="hero" size="xl" className="group shadow-2xl shadow-primary/30" asChild>
              <Link to="/register">
                <Play className="w-5 h-5 fill-current" />
                {t("hero.cta.start")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="border-2 border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-lg"
            >
              <Clock className="w-5 h-5" />
              {t("hero.cta.demo")}
            </Button>
          </div>

          {/* Timer Preview Card */}
          <div 
            ref={cardRef}
            className="w-full max-w-2xl transition-all duration-1000"
            style={{
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
              transitionDelay: "400ms",
            }}
          >
            <div className="relative">
              {/* Glow effect with parallax */}
              <div 
                className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 rounded-3xl blur-xl opacity-30 transition-transform duration-100 ease-out"
                style={{ 
                  transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` 
                }}
              />
              
              <div className="relative rounded-2xl border-2 border-border/50 bg-gradient-to-b from-card to-card/80 p-10 shadow-2xl backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-success to-emerald-400 animate-pulse shadow-lg shadow-success/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                
                {/* Timer display */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/50" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("hero.timer.client")}</span>
                  </div>
                  
                  <div className="font-mono text-7xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    02:34:15
                  </div>
                  
                  <p className="text-muted-foreground mb-10 text-lg">{t("hero.timer.description")}</p>
                  
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
