import { 
  Timer, 
  Users, 
  BarChart3, 
  FileText, 
  Palette, 
  Zap,
} from "lucide-react";
import { useScrollAnimation, useScrollAnimationGroup } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeaturesSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const { t } = useLanguage();

  const features = [
    {
      icon: Timer,
      titleKey: "features.timer.title",
      descriptionKey: "features.timer.description",
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/25",
    },
    {
      icon: Users,
      titleKey: "features.clients.title",
      descriptionKey: "features.clients.description",
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      icon: BarChart3,
      titleKey: "features.reports.title",
      descriptionKey: "features.reports.description",
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
    },
    {
      icon: FileText,
      titleKey: "features.export.title",
      descriptionKey: "features.export.description",
      gradient: "from-orange-500 to-amber-500",
      shadowColor: "shadow-orange-500/25",
    },
    {
      icon: Palette,
      titleKey: "features.design.title",
      descriptionKey: "features.design.description",
      gradient: "from-pink-500 to-rose-500",
      shadowColor: "shadow-pink-500/25",
    },
    {
      icon: Zap,
      titleKey: "features.speed.title",
      descriptionKey: "features.speed.description",
      gradient: "from-amber-500 to-yellow-500",
      shadowColor: "shadow-amber-500/25",
    },
  ];

  const stats = [
    { value: "2s", labelKey: "features.stats.time" },
    { value: "7", labelKey: "features.stats.trial" },
    { value: "100%", labelKey: "features.stats.data" },
    { value: "∞", labelKey: "features.stats.projects" },
  ];

  const { ref: featuresRef, isVisible: featuresVisible, getItemStyle } = useScrollAnimationGroup(features.length, 100);

  // Parallax effects
  const parallaxSlow = useParallax({ speed: 0.1, direction: "up" });
  const parallaxMedium = useParallax({ speed: 0.18, direction: "down" });

  return (
    <section id="features" className="py-28 md:py-36 bg-gradient-to-b from-muted/30 via-muted/50 to-background relative overflow-hidden">
      {/* Background decoration with parallax */}
      <div 
        className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow}px)` }}
      />
      <div 
        className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxMedium}px)` }}
      />

      {/* Floating shapes with parallax */}
      <div 
        className="absolute top-20 left-[5%] w-24 h-24 rounded-full border border-primary/10 hidden lg:block transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow * 2}px) rotate(${parallaxSlow * 0.1}deg)` }}
      />
      <div 
        className="absolute top-1/2 right-[8%] w-16 h-16 rounded-xl border border-purple-500/10 hidden lg:block transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxMedium * 1.5}px) rotate(${-parallaxMedium * 0.15}deg)` }}
      />
      <div 
        className="absolute bottom-32 left-[12%] w-20 h-20 rounded-2xl border border-emerald-500/10 hidden lg:block transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${parallaxSlow * 1.8}px) rotate(${parallaxSlow * 0.08}deg)` }}
      />
      
      <div className="container relative">
        <div 
          ref={titleRef}
          className="text-center max-w-3xl mx-auto mb-20 transition-all duration-700"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("features.title.line1")}
            <br />
            <span className="text-muted-foreground">{t("features.title.line2")}</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>

        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.titleKey} 
              className="group relative"
              style={getItemStyle(index)}
            >
              {/* Hover glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative h-full p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg ${feature.shadowColor} transition-transform group-hover:scale-110 duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(feature.descriptionKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div 
          ref={statsRef}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div 
              key={stat.labelKey} 
              className="text-center p-6 rounded-2xl bg-gradient-to-b from-card/50 to-transparent border border-border/30 hover:border-border/50 transition-all duration-700"
              style={{
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
