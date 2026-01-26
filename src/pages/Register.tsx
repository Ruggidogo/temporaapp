import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight, Check, Sparkles, Timer, BarChart3, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import temporaLogo from "@/assets/tempora-logo-light.svg";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: t("register.passwordTooShort"),
        description: t("register.passwordTooShortDesc"),
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
        title: t("register.successTitle"),
        description: t("register.successDesc"),
      });
      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: t("register.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Timer, text: t("register.benefit1") },
    { icon: BarChart3, text: t("register.benefit2") },
    { icon: FileText, text: t("register.benefit3") },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-primary-glow">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
          <Link to="/" className="group">
            <img 
              src={temporaLogoDark} 
              alt="Tempora" 
              className="h-8 transition-transform group-hover:scale-105 brightness-0 invert"
            />
          </Link>

          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t("register.trialBadge")}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {t("register.welcome")}
              </h1>
              <p className="text-white/80 text-xl leading-relaxed">
                {t("register.welcomeDesc")}
              </p>
            </div>

            <ul className="space-y-5">
              {benefits.map((benefit, index) => (
                <li 
                  key={benefit.text} 
                  className="flex items-center gap-4 text-white"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-medium">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/50 text-sm">
            {t("common.allRightsReserved")}
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
                    <span>{t("register.badge")}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{t("register.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("register.subtitle")}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">{t("register.name")}</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={t("register.namePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">{t("register.email")}</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("register.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">{t("register.password")}</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={t("register.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        minLength={6}
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
                    {loading ? t("register.submitting") : t("register.submit")}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 mt-6 py-4 border-t border-border/30">
                  {[t("register.secure"), t("register.private"), t("register.gdpr")].map((badge) => (
                    <div key={badge} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  {t("register.terms")}{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                    {t("register.termsLink")}
                  </Link>{" "}
                  {t("register.and")}{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                    {t("register.privacyLink")}
                  </Link>
                </p>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {t("register.hasAccount")}{" "}
                  <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    {t("register.login")}
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
