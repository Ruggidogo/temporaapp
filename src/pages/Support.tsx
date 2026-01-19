import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { HeadphonesIcon, Mail, MessageCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const faqItems = [
  {
    question: "Come posso iniziare a usare Tempora?",
    answer: "Registrati gratuitamente e avrai accesso a 7 giorni di prova gratuita con tutte le funzionalità Pro. Non è richiesta carta di credito.",
  },
  {
    question: "Posso esportare i miei dati?",
    answer: "Sì, puoi esportare i tuoi timesheet in formato PDF o CSV in qualsiasi momento dalla sezione Report.",
  },
  {
    question: "Come funziona la fatturazione?",
    answer: "Tempora Pro costa €14,99/mese. Puoi annullare in qualsiasi momento e continuare a usare il servizio fino alla fine del periodo pagato.",
  },
  {
    question: "I miei dati sono al sicuro?",
    answer: "Assolutamente sì. Utilizziamo crittografia end-to-end e i tuoi dati sono conservati in data center sicuri in Europa.",
  },
  {
    question: "Posso usare Tempora su mobile?",
    answer: "Tempora è completamente responsive e funziona perfettamente su qualsiasi dispositivo mobile.",
  },
];

export default function Support() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Messaggio inviato! Ti risponderemo entro 24 ore.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
              <HeadphonesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Supporto</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Come possiamo{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                aiutarti?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Il nostro team è qui per aiutarti. Rispondiamo a tutte le richieste 
              entro 24 ore lavorative.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground text-sm">supporto@tempora.app</p>
              </div>
              <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Chat</h3>
                <p className="text-muted-foreground text-sm">Disponibile in-app</p>
              </div>
              <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Risposta</h3>
                <p className="text-muted-foreground text-sm">Entro 24 ore</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20">
          <div 
            ref={formRef}
            className="container max-w-2xl transition-all duration-1000"
            style={{
              opacity: formVisible ? 1 : 0,
              transform: formVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Inviaci un messaggio</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Il tuo nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="la@tua.email"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Oggetto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Come possiamo aiutarti?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Messaggio</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Descrivi il tuo problema o la tua domanda..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Invia messaggio
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted/30">
          <div 
            ref={faqRef}
            className="container max-w-3xl transition-all duration-1000"
            style={{
              opacity: faqVisible ? 1 : 0,
              transform: faqVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Domande frequenti</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm"
                >
                  <h3 className="font-semibold mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
