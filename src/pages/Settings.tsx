import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, Users, Save, LogOut, FileText, Settings2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogoUpload } from "@/components/settings/LogoUpload";

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [workType, setWorkType] = useState<"freelancer" | "team">("freelancer");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setWorkType((profile.work_type as "freelancer" | "team") || "freelancer");
      setLogoUrl((profile as any).logo_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Nome richiesto",
        description: "Inserisci il tuo nome per continuare.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 100) {
      toast({
        title: "Nome troppo lungo",
        description: "Il nome deve essere inferiore a 100 caratteri.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: trimmedName,
          work_type: workType,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Impostazioni salvate! ✓",
        description: "Le tue modifiche sono state salvate con successo.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut();
      navigate("/");
      toast({
        title: "Disconnesso",
        description: "Sei stato disconnesso con successo.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci il tuo profilo e le preferenze
          </p>
        </div>

        <div className="space-y-6 stagger-children">
          {/* Profile Card */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Profilo</h2>
                <p className="text-sm text-muted-foreground">
                  Modifica le informazioni del tuo account
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Il tuo nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="rounded-xl h-12 bg-card/50"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="rounded-xl h-12 bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'email non può essere modificata
                </p>
              </div>

              <Separator className="my-6" />

              {/* Work Type */}
              <div className="space-y-3">
                <Label>Tipo di lavoro</Label>
                <RadioGroup
                  value={workType}
                  onValueChange={(value) => setWorkType(value as "freelancer" | "team")}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="freelancer"
                    className="flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:shadow-primary/10 has-[[data-state=checked]]:shadow-lg"
                  >
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Freelancer</p>
                      <p className="text-xs text-muted-foreground">Lavoro da solo</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="team"
                    className="flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:shadow-primary/10 has-[[data-state=checked]]:shadow-lg"
                  >
                    <RadioGroupItem value="team" id="team" />
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Team</p>
                      <p className="text-xs text-muted-foreground">Lavoro in squadra</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={loading} 
                className="btn-gradient rounded-xl h-12"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </div>
          </div>

          {/* Export Settings Card */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Esportazione</h2>
                <p className="text-sm text-muted-foreground">
                  Personalizza i tuoi documenti esportati
                </p>
              </div>
            </div>
            
            {user && (
              <LogoUpload
                userId={user.id}
                currentLogoUrl={logoUrl}
                onLogoChange={(url) => {
                  setLogoUrl(url);
                  refreshProfile();
                }}
              />
            )}
          </div>

          {/* Session Card */}
          <div className="card-premium p-6 border-destructive/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-destructive">Sessione</h2>
                <p className="text-sm text-muted-foreground">
                  Gestisci la tua sessione attiva
                </p>
              </div>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="rounded-xl h-12"
            >
              {logoutLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              {logoutLoading ? "Disconnessione..." : "Esci dall'account"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
