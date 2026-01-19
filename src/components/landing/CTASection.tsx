import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Clock, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax, useMouseParallax } from "@/hooks/useParallax";
import { useLanguage } from "@/contexts/LanguageContext";

export function CTASection() {
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollAnimation();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: descRef, isVisible: descVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const { t } = useLanguage();

  // Parallax effects
  const parallaxSlow = useParallax({ speed: 0.12, direction: "up" });
  const parallaxMedium = useParallax({ speed: 0.2, direction: "down" });
  const mousePosition = useMouseParallax(0.01);

  return (
    <section className="py-28 md:py-36 relative overflow-hidden">
      {/* Background gradients with parallax */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/10" />
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePosition.x * 0.3}px, ${parallaxSlow + mousePosition.y * 0.3}px)` }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translate(${-mousePosition.x * 0.2}px, ${parallaxMedium + -mousePosition.y * 0.2}px)` }}
      />
      
      {/* Floating icons with parallax */}
      <div 
        className="absolute top-1/4 left-[15%] w-14 h-14 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center hidden lg:flex transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow * 1.5}px) rotate(${parallaxSlow * 0.1}deg)` }}
      >
        <Clock className="w-6 h-6 text-primary" />
      </div>
      <div 
        className="absolute top-1/3 right-[15%] w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center hidden lg:flex transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxMedium * 1.2}px) rotate(${-parallaxMedium * 0.08}deg)` }}
      >
        <BarChart3 className="w-6 h-6 text-emerald-500" />
      </div>
      <div 
        className="absolute bottom-1/3 left-[20%] w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center hidden lg:flex transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow * 1.8}px) rotate(${parallaxSlow * 0.12}deg)` }}
      >
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
            <span>{t("cta.badge")}</span>
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
            {t("cta.title")}{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{t("cta.titleHighlight")}</span>?
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
            {t("cta.subtitle")}
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
                {t("cta.button")}
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
              {t("cta.trial")}
            </span>
            <span className="text-border">•</span>
            <span>{t("cta.noCard")}</span>
            <span className="text-border">•</span>
            <span>{t("cta.cancel")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
