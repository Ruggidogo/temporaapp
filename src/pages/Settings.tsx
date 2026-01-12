import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, Users, Save, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [workType, setWorkType] = useState<"freelancer" | "team">("freelancer");
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setWorkType((profile.work_type as "freelancer" | "team") || "freelancer");
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
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Impostazioni</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci il tuo profilo e le preferenze
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profilo
              </CardTitle>
              <CardDescription>
                Modifica le informazioni del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'email non può essere modificata
                </p>
              </div>

              <Separator />

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
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Freelancer</p>
                      <p className="text-xs text-muted-foreground">Lavoro da solo</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="team"
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value="team" id="team" />
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Team</p>
                      <p className="text-xs text-muted-foreground">Lavoro in squadra</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Sessione
              </CardTitle>
              <CardDescription>
                Gestisci la tua sessione attiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutLoading ? "Disconnessione..." : "Esci dall'account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
