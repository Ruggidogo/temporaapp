import { 
  Timer, 
  Users, 
  BarChart3, 
  FileText, 
  Palette, 
  Zap,
} from "lucide-react";
import { useScrollAnimation, useScrollAnimationGroup } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Timer,
    title: "Timer con un click",
    description: "Inizia a tracciare in un secondo. Stop. È tutto qui.",
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/25",
  },
  {
    icon: Users,
    title: "Gestione clienti",
    description: "Organizza i tuoi clienti con colori distintivi e tariffe orarie.",
    gradient: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/25",
  },
  {
    icon: BarChart3,
    title: "Report intelligenti",
    description: "Visualizza dove va il tuo tempo con grafici interattivi.",
    gradient: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/25",
  },
  {
    icon: FileText,
    title: "Export professionale",
    description: "PDF brandizzati pronti da inviare ai tuoi clienti.",
    gradient: "from-orange-500 to-amber-500",
    shadowColor: "shadow-orange-500/25",
  },
  {
    icon: Palette,
    title: "Design delightful",
    description: "Un'interfaccia che è un piacere usare ogni giorno.",
    gradient: "from-pink-500 to-rose-500",
    shadowColor: "shadow-pink-500/25",
  },
  {
    icon: Zap,
    title: "Veloce come te",
    description: "Shortcut tastiera e azioni rapide per i power user.",
    gradient: "from-amber-500 to-yellow-500",
    shadowColor: "shadow-amber-500/25",
  },
];

const stats = [
  { value: "2s", label: "per iniziare a tracciare" },
  { value: "14", label: "giorni di prova gratuita" },
  { value: "100%", label: "dei dati tuoi" },
  { value: "∞", label: "progetti illimitati" },
];

export function FeaturesSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: featuresRef, isVisible: featuresVisible, getItemStyle } = useScrollAnimationGroup(features.length, 100);
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  return (
    <section className="py-28 md:py-36 bg-gradient-to-b from-muted/30 via-muted/50 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      
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
            Tutto quello che serve.
            <br />
            <span className="text-muted-foreground">Niente di più.</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Tempora è progettato per essere semplice ma potente. 
            Ogni funzionalità è pensata per farti risparmiare tempo.
          </p>
        </div>

        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className="group relative"
              style={getItemStyle(index)}
            >
              {/* Hover glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative h-full p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg ${feature.shadowColor} transition-transform group-hover:scale-110 duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
              key={stat.label} 
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
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
