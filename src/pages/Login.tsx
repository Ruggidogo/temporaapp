import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl w-fit">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>Tempora</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bentornato!</CardTitle>
            <CardDescription>
              Accedi al tuo account per continuare a tracciare
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Email/Password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:underline"
                  >
                    Password dimenticata?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Accesso in corso..." : "Accedi"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <Button 
              variant="ghost" 
              className="w-full mt-4 text-sm"
              onClick={handleMagicLink}
              disabled={magicLinkLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              {magicLinkLoading ? "Invio in corso..." : "Accedi con Magic Link"}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Non hai un account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Registrati gratis
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
