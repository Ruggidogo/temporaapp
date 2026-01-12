import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Password troppo corta",
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account creato! 🎉",
        description: "Benvenuto in Tempora!",
      });
      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Errore di registrazione",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "14 giorni di prova gratuita",
    "Tutte le funzionalità sbloccate",
    "Nessuna carta richiesta",
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-glow p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>Tempora</span>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">
              Inizia a tracciare il tuo tempo oggi
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Unisciti a migliaia di professionisti che hanno scelto Tempora.
            </p>
          </div>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-primary-foreground">
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-primary-foreground/60 text-sm">
          © 2026 Tempora. Tutti i diritti riservati.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Mobile header */}
        <header className="p-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl w-fit">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>Tempora</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-xl animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
              <CardDescription>
                Inizia la tua prova gratuita di 14 giorni
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Email/Password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Mario Rossi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@esempio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimo 6 caratteri"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creazione account..." : "Crea account"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Continuando, accetti i nostri{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Termini di servizio
                </Link>{" "}
                e la{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Hai già un account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Accedi
                </Link>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
