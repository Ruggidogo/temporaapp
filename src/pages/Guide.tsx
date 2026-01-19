import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BookOpen, Play, Clock, Users, BarChart3, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const guides = [
  {
    icon: Play,
    title: "Iniziare con Tempora",
    description: "Guida completa per configurare il tuo account e iniziare a tracciare il tempo in pochi minuti.",
    readTime: "5 min",
    category: "Primi passi",
  },
  {
    icon: Clock,
    title: "Timer e tracking manuale",
    description: "Scopri come usare il timer automatico e inserire manualmente le ore lavorate.",
    readTime: "3 min",
    category: "Funzionalità",
  },
  {
    icon: Users,
    title: "Gestione clienti",
    description: "Impara a creare e organizzare i tuoi clienti con tariffe orarie personalizzate.",
    readTime: "4 min",
    category: "Funzionalità",
  },
  {
    icon: BarChart3,
    title: "Report e analisi",
    description: "Come generare report dettagliati e analizzare la produttività del tuo lavoro.",
    readTime: "6 min",
    category: "Avanzato",
  },
  {
    icon: FileText,
    title: "Esportazione PDF",
    description: "Crea timesheet professionali in PDF da condividere con i tuoi clienti.",
    readTime: "3 min",
    category: "Funzionalità",
  },
];

const videoTutorials = [
  {
    title: "Tour completo di Tempora",
    duration: "8:32",
    thumbnail: "bg-gradient-to-br from-primary/20 to-primary/5",
  },
  {
    title: "Come creare il primo cliente",
    duration: "3:15",
    thumbnail: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
  },
  {
    title: "Generare report mensili",
    duration: "5:48",
    thumbnail: "bg-gradient-to-br from-green-500/20 to-green-500/5",
  },
];

export default function Guide() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: guidesRef, isVisible: guidesVisible } = useScrollAnimation();
  const { ref: videosRef, isVisible: videosVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div 
            ref={heroRef}
            className="container relative z-10 text-center transition-all duration-1000"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Impara a usare{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Tempora
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tutorial, guide passo-passo e video per sfruttare al massimo 
              tutte le funzionalità di Tempora.
            </p>
          </div>
        </section>

        {/* Written Guides */}
        <section className="py-20">
          <div 
            ref={guidesRef}
            className="container transition-all duration-1000"
            style={{
              opacity: guidesVisible ? 1 : 0,
              transform: guidesVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <h2 className="text-2xl font-bold mb-8">Guide scritte</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <div
                  key={guide.title}
                  className="group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <guide.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {guide.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {guide.readTime} di lettura
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-20 bg-muted/30">
          <div 
            ref={videosRef}
            className="container transition-all duration-1000"
            style={{
              opacity: videosVisible ? 1 : 0,
              transform: videosVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <h2 className="text-2xl font-bold mb-8">Video tutorial</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {videoTutorials.map((video, index) => (
                <div
                  key={video.title}
                  className="group cursor-pointer"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div className={`aspect-video rounded-2xl ${video.thumbnail} border border-border/50 mb-4 flex items-center justify-center group-hover:border-primary/30 transition-all duration-300`}>
                    <div className="w-14 h-14 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <span className="text-sm text-muted-foreground">{video.duration}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">
                Hai bisogno di aiuto personalizzato?
              </p>
              <Link to="/support">
                <Button size="lg" className="gap-2">
                  Contatta il supporto
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
