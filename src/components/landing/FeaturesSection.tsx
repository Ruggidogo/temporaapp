import { Card, CardContent } from "@/components/ui/card";
import { 
  Timer, 
  Users, 
  BarChart3, 
  FileText, 
  Palette, 
  Zap,
  Clock,
  Target
} from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Timer con un click",
    description: "Inizia a tracciare in un secondo. Stop. È tutto qui.",
    color: "text-client-violet",
    bgColor: "bg-client-violet/10",
  },
  {
    icon: Users,
    title: "Gestione clienti",
    description: "Organizza i tuoi clienti con colori distintivi e tariffe orarie.",
    color: "text-client-blue",
    bgColor: "bg-client-blue/10",
  },
  {
    icon: BarChart3,
    title: "Report intelligenti",
    description: "Visualizza dove va il tuo tempo con grafici interattivi.",
    color: "text-client-emerald",
    bgColor: "bg-client-emerald/10",
  },
  {
    icon: FileText,
    title: "Export professionale",
    description: "PDF brandizzati pronti da inviare ai tuoi clienti.",
    color: "text-client-orange",
    bgColor: "bg-client-orange/10",
  },
  {
    icon: Palette,
    title: "Design delightful",
    description: "Un'interfaccia che è un piacere usare ogni giorno.",
    color: "text-client-pink",
    bgColor: "bg-client-pink/10",
  },
  {
    icon: Zap,
    title: "Veloce come te",
    description: "Shortcut tastiera e azioni rapide per i power user.",
    color: "text-client-amber",
    bgColor: "bg-client-amber/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tutto quello che serve.
            <br />
            <span className="text-muted-foreground">Niente di più.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tempora è progettato per essere semplice ma potente. 
            Ogni funzionalità è pensata per farti risparmiare tempo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="feature"
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 transition-transform group-hover:scale-110`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "2s", label: "per iniziare a tracciare" },
            { value: "14", label: "giorni di prova gratuita" },
            { value: "100%", label: "dei dati tuoi" },
            { value: "∞", label: "progetti illimitati" },
          ].map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${(index + 6) * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
