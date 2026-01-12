import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Timer, Users, User, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
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
        title: "Compila tutti i campi",
        description: "Inserisci il tuo nome e seleziona come lavori",
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
        title: "Errore",
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
        title: "Errore",
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
        title: "Benvenuto in Tempora! 🎉",
        description: "Sei pronto per iniziare a tracciare il tuo tempo"
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/60" : "w-8 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step 1: Profile */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Timer className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Benvenuto in Tempora!</CardTitle>
              <CardDescription>
                Prima di iniziare, raccontaci un po' di te
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Come ti chiami?</Label>
                <Input
                  id="name"
                  placeholder="Il tuo nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label>Come lavori?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setWorkType('freelancer')}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-200 text-left",
                      workType === 'freelancer'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <User className={cn(
                      "w-8 h-8 mb-3",
                      workType === 'freelancer' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <p className="font-medium">Freelancer</p>
                    <p className="text-sm text-muted-foreground">Lavoro da solo</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setWorkType('team')}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-200 text-left",
                      workType === 'team'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Users className={cn(
                      "w-8 h-8 mb-3",
                      workType === 'team' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <p className="font-medium">Team</p>
                    <p className="text-sm text-muted-foreground">Lavoro in squadra</p>
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleStep1Next} 
                className="w-full h-12"
                disabled={loading || !name.trim() || !workType}
              >
                {loading ? "Salvataggio..." : "Continua"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: First client */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Aggiungi il tuo primo cliente</CardTitle>
              <CardDescription>
                Puoi sempre aggiungerne altri in seguito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Es. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label>Colore identificativo</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setClientColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all duration-200",
                        clientColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => handleStep2Next(true)}
                  className="h-12"
                  disabled={loading}
                >
                  Salta
                </Button>
                <Button 
                  onClick={() => handleStep2Next(false)} 
                  className="flex-1 h-12"
                  disabled={loading || !clientName.trim()}
                >
                  {loading ? "Salvataggio..." : "Continua"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mb-4 animate-float">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Sei pronto!</CardTitle>
              <CardDescription className="text-base">
                Il tuo account è configurato. Inizia a tracciare il tempo e a gestire i tuoi progetti in modo semplice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Traccia il tempo con un click</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Organizza le attività per cliente</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Genera report professionali</span>
                </div>
              </div>

              <Button 
                onClick={handleComplete} 
                className="w-full h-14 text-lg"
                disabled={loading}
              >
                {loading ? "Caricamento..." : "Inizia a tracciare"}
                <Timer className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Hai 14 giorni di prova gratuita con tutte le funzionalità
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
