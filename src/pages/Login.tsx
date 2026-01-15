import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Sparkles, Timer, BarChart3, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import temporaLogo from "@/assets/tempora-logo-light.svg";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Benvenuto! 👋",
        description: "Accesso effettuato con successo",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Errore di accesso",
        description:
          error.message === "Invalid login credentials"
            ? "Email o password non corretti"
            : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      toast({
        title: "Email richiesta",
        description: "Inserisci la tua email per ricevere il magic link.",
        variant: "destructive",
      });
      return;
    }

    setMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast({
        title: "Magic Link inviato! ✨",
        description: "Controlla la tua email e clicca sul link per accedere.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-primary-glow">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Floating icons */}
        <div className="absolute top-1/4 left-1/4 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float">
          <Timer className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
          <Users className="w-5 h-5 text-white" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
          <Link to="/" className="group">
            <img 
              src={temporaLogoDark} 
              alt="Tempora" 
              className="h-8 transition-transform group-hover:scale-105 brightness-0 invert"
            />
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Bentornato nel tuo spazio di lavoro
              </h1>
              <p className="text-white/80 text-xl leading-relaxed">
                Riprendi da dove hai lasciato e continua a tracciare il tuo tempo in modo intelligente.
              </p>
            </div>
          </div>

          <p className="text-white/50 text-sm">
            © 2026 Tempora. Tutti i diritti riservati.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        {/* Mobile header */}
        <header className="p-6 lg:hidden relative z-10">
          <Link to="/" className="inline-block group">
            <img 
              src={temporaLogo} 
              alt="Tempora" 
              className="h-8 dark:hidden transition-transform group-hover:scale-105"
            />
            <img 
              src={temporaLogoDark} 
              alt="Tempora" 
              className="h-8 hidden dark:block transition-transform group-hover:scale-105"
            />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            {/* Card with glow effect */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 rounded-3xl blur-xl opacity-50" />
              
              <div className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 p-8 shadow-2xl backdrop-blur-sm">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Accedi al tuo account</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Bentornato!</h2>
                  <p className="text-muted-foreground">
                    Inserisci le tue credenziali per continuare
                  </p>
                </div>

                {/* Email/Password form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@esempio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Password dimenticata?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero"
                    size="lg"
                    className="w-full h-12 shadow-lg shadow-primary/25" 
                    disabled={loading}
                  >
                    {loading ? "Accesso in corso..." : "Accedi"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">oppure</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
                  onClick={handleMagicLink}
                  disabled={magicLinkLoading}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {magicLinkLoading ? "Invio in corso..." : "Accedi con Magic Link"}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-8">
                  Non hai un account?{" "}
                  <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Registrati gratis
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
