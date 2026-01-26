import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Timer, Users, User, ArrowRight, ArrowLeft, Check, Sparkles, Rocket, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import temporaLogo from "@/assets/tempora-logo-light.svg";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";

const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 data
  const [name, setName] = useState('');
  const [workType, setWorkType] = useState<'freelancer' | 'team' | null>(null);
  
  // Step 2 data
  const [clientName, setClientName] = useState('');
  const [clientColor, setClientColor] = useState(COLORS[0]);

  const handleStep1Next = async () => {
    if (!name.trim() || !workType) {
      toast({
        title: t("onboarding.step1.error"),
        description: t("onboarding.step1.errorDesc"),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim(), work_type: workType })
        .eq('user_id', user?.id);

      if (error) throw error;
      setStep(2);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async (skip: boolean = false) => {
    setLoading(true);
    try {
      // Create client if provided
      if (!skip && clientName.trim()) {
        const { error } = await supabase
          .from('clients')
          .insert({
            user_id: user?.id,
            name: clientName.trim(),
            color: clientColor
          });

        if (error) throw error;
      }
      setStep(3);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await refreshProfile();
      toast({
        title: t("onboarding.complete.title"),
        description: t("onboarding.complete.desc")
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Timer, text: t("onboarding.benefit1") },
    { icon: BarChart3, text: t("onboarding.benefit2") },
    { icon: FileText, text: t("onboarding.benefit3") },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-primary-glow">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Floating icons */}
        <div className="absolute top-1/4 left-1/4 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float">
          <Timer className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-2/3 right-1/4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
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
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {t("onboarding.welcome")}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed">
                {t("onboarding.welcomeDesc")}
              </p>
            </div>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li 
                  key={index} 
                  className="flex items-center gap-4 text-white"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/50 text-sm">
            {t("common.allRightsReserved")}
          </p>
        </div>
      </div>

      {/* Right side - Content */}
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
          <div className="w-full max-w-lg">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-500",
                      s === step 
                        ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30 scale-110" 
                        : s < step 
                          ? "bg-success text-white" 
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={cn(
                      "w-12 h-1 mx-2 rounded-full transition-all duration-500",
                      s < step ? "bg-success" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* Card with glow effect */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-xl opacity-50" />
              
              <div className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 p-8 shadow-2xl backdrop-blur-sm">
                
                {/* Step 1: Profile */}
                {step === 1 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                        <Timer className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{t("onboarding.step1.title")}</h2>
                      <p className="text-muted-foreground">
                        {t("onboarding.step1.subtitle")}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">{t("onboarding.step1.nameLabel")}</Label>
                        <Input
                          id="name"
                          placeholder={t("onboarding.step1.namePlaceholder")}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">{t("onboarding.step1.workLabel")}</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setWorkType('freelancer')}
                            className={cn(
                              "relative p-6 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden",
                              workType === 'freelancer'
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                            )}
                          >
                            {workType === 'freelancer' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10" />
                            )}
                            <div className={cn(
                              "relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                              workType === 'freelancer' 
                                ? "bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30" 
                                : "bg-muted group-hover:bg-muted/80"
                            )}>
                              <User className={cn(
                                "w-5 h-5 transition-colors",
                                workType === 'freelancer' ? "text-white" : "text-muted-foreground"
                              )} />
                            </div>
                            <p className="relative font-semibold mb-1">{t("onboarding.step1.freelancer")}</p>
                            <p className="relative text-sm text-muted-foreground">{t("onboarding.step1.freelancerDesc")}</p>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setWorkType('team')}
                            className={cn(
                              "relative p-6 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden",
                              workType === 'team'
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                            )}
                          >
                            {workType === 'team' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10" />
                            )}
                            <div className={cn(
                              "relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                              workType === 'team' 
                                ? "bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30" 
                                : "bg-muted group-hover:bg-muted/80"
                            )}>
                              <Users className={cn(
                                "w-5 h-5 transition-colors",
                                workType === 'team' ? "text-white" : "text-muted-foreground"
                              )} />
                            </div>
                            <p className="relative font-semibold mb-1">{t("onboarding.step1.team")}</p>
                            <p className="relative text-sm text-muted-foreground">{t("onboarding.step1.teamDesc")}</p>
                          </button>
                        </div>
                      </div>

                      <Button 
                        onClick={handleStep1Next} 
                        variant="hero"
                        size="lg"
                        className="w-full h-12 shadow-lg shadow-primary/25"
                        disabled={loading || !name.trim() || !workType}
                      >
                        {loading ? t("onboarding.saving") : t("common.continue")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: First client */}
                {step === 2 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{t("onboarding.step2.title")}</h2>
                      <p className="text-muted-foreground">
                        {t("onboarding.step2.subtitle")}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="clientName" className="text-sm font-medium">{t("onboarding.step2.clientName")}</Label>
                        <Input
                          id="clientName"
                          placeholder={t("onboarding.step2.clientPlaceholder")}
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">{t("onboarding.step2.colorLabel")}</Label>
                        <div className="flex flex-wrap gap-3">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setClientColor(color)}
                              className={cn(
                                "w-10 h-10 rounded-xl transition-all duration-300 hover:scale-110",
                                clientColor === color 
                                  ? "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110 shadow-lg" 
                                  : "hover:shadow-md"
                              )}
                              style={{ 
                                backgroundColor: color,
                                boxShadow: clientColor === color ? `0 8px 20px -4px ${color}50` : undefined
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setStep(1)}
                          className="h-12 border-border/50"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {t("common.back")}
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => handleStep2Next(true)}
                          className="h-12"
                          disabled={loading}
                        >
                          {t("common.skip")}
                        </Button>
                        <Button 
                          onClick={() => handleStep2Next(false)} 
                          variant="hero"
                          className="flex-1 h-12 shadow-lg shadow-primary/25"
                          disabled={loading || !clientName.trim()}
                        >
                          {loading ? t("onboarding.saving") : t("common.continue")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Ready */}
                {step === 3 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-success to-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-success/40 animate-float">
                        <Rocket className="w-10 h-10 text-white" />
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-success/10 to-emerald-400/10 border border-success/20 text-sm font-medium text-success mb-4">
                        <Sparkles className="w-4 h-4" />
                        {t("onboarding.step3.configured")}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{t("onboarding.step3.readyTitle")}</h2>
                      <p className="text-muted-foreground">
                        {t("onboarding.step3.readySubtitle")}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gradient-to-b from-muted/50 to-muted/30 rounded-xl p-5 space-y-4 border border-border/30">
                        {[
                          t("onboarding.step3.feature1"),
                          t("onboarding.step3.feature2"),
                          t("onboarding.step3.feature3")
                        ].map((text, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-success to-emerald-400 flex items-center justify-center shadow-md shadow-success/30">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium">{text}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={handleComplete} 
                        variant="hero"
                        size="xl"
                        className="w-full h-14 text-lg shadow-xl shadow-primary/30"
                        disabled={loading}
                      >
                        {loading ? t("onboarding.loading") : t("onboarding.step3.startTracking")}
                        <Timer className="w-5 h-5 ml-2" />
                      </Button>

                      <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        {t("onboarding.step3.trialInfo")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
