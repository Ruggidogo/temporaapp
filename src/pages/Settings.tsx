import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, Users, Save, LogOut, FileText, Loader2, Crown, Check, Calendar, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogoUpload } from "@/components/settings/LogoUpload";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, profile, subscription, refreshProfile, signOut, checkSubscription } = useAuth();
  const { t } = useLanguage();
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
      setLogoUrl(profile.logo_url || null);
    }
  }, [profile]);

  // Check for checkout success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    
    if (checkoutStatus === 'success') {
      toast({
        title: t("settings.subscriptionActivated"),
        description: t("settings.welcomePro"),
      });
      // Remove query param
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh subscription status
      checkSubscription();
    } else if (checkoutStatus === 'cancelled') {
      toast({
        title: t("settings.checkoutCancelled"),
        description: t("settings.checkoutCancelledDesc"),
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkSubscription, t]);

  const handleSave = async () => {
    if (!user) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: t("settings.nameRequired"),
        description: t("settings.nameRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 100) {
      toast({
        title: t("settings.nameTooLong"),
        description: t("settings.nameTooLongDesc"),
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
        title: t("settings.saved"),
        description: t("settings.savedDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
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
        title: t("settings.disconnected"),
        description: t("settings.disconnectedDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  // Calculate trial days remaining
  const trialDaysRemaining = profile?.trial_ends_at 
    ? Math.max(0, differenceInDays(new Date(profile.trial_ends_at), new Date()))
    : 0;

  const isPro = subscription.subscribed || profile?.plan === 'pro';
  const isTrial = !isPro && profile?.plan === 'trial';

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto tempora-animate-in overflow-x-hidden">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t("settings.subtitle")}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 stagger-children">
          {/* Subscription Card */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl border p-4 sm:p-6 transition-all",
            isPro 
              ? "border-success/30 bg-gradient-to-br from-success/5 to-emerald-500/5" 
              : "border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5"
          )}>
            {/* Background decoration */}
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2",
              isPro ? "bg-success/20" : "bg-primary/20"
            )} />
            
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0",
                    isPro 
                      ? "bg-gradient-to-r from-success to-emerald-400 shadow-success/30" 
                      : "bg-gradient-to-r from-primary to-purple-500 shadow-primary/30"
                  )}>
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg">
                      {isPro ? t("settings.plan.pro") : t("settings.plan.trial")}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isPro ? t("settings.plan.proDesc") : t("settings.plan.trialDesc")}
                    </p>
                  </div>
                </div>
                
                {isPro && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-xs sm:text-sm font-medium text-success w-fit">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t("settings.plan.active")}
                  </div>
                )}
              </div>

              {/* Plan details */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {isPro && subscription.subscriptionEnd && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{t("settings.plan.nextRenewal")}</span>
                    <span className="font-medium">
                      {format(new Date(subscription.subscriptionEnd), "d MMMM yyyy", { locale: it })}
                    </span>
                  </div>
                )}
                
                {isTrial && profile?.trial_ends_at && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{t("settings.plan.trialExpires")}</span>
                    <span className={cn(
                      "font-medium",
                      trialDaysRemaining <= 3 ? "text-warning" : ""
                    )}>
                      {trialDaysRemaining === 0 
                        ? t("settings.plan.expiresToday") 
                        : t("settings.plan.expiresIn").replace("{days}", String(trialDaysRemaining))}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{t("settings.plan.price")}</span>
                  <span className="font-medium">
                    {isPro ? t("settings.plan.proPricing") : t("settings.plan.trialPricing")}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                  t("settings.features.unlimitedTimer"),
                  t("settings.features.unlimitedClients"),
                  t("settings.features.advancedReports"),
                  t("settings.features.exportPdfCsv")
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs sm:text-sm">
                    <Check className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0",
                      isPro ? "text-success" : "text-primary"
                    )} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action button */}
              <UpgradeButton className="w-full" />
            </div>
          </div>

          {/* Profile Card */}
          <div className="card-premium p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base sm:text-lg">{t("settings.profile")}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("settings.profileDesc")}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("settings.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("settings.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="rounded-xl h-12 bg-card/50"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="rounded-xl h-12 bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t("settings.emailReadOnly")}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Work Type */}
              <div className="space-y-3">
                <Label>{t("settings.workType")}</Label>
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
                      <p className="font-semibold">{t("settings.freelancer")}</p>
                      <p className="text-xs text-muted-foreground">{t("settings.freelancerDesc")}</p>
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
                      <p className="font-semibold">{t("settings.team")}</p>
                      <p className="text-xs text-muted-foreground">{t("settings.teamDesc")}</p>
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
                {loading ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </div>
          </div>

          {/* Export Settings Card */}
          <div className="card-premium p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base sm:text-lg">{t("settings.export")}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("settings.exportDesc")}
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
          <div className="card-premium p-4 sm:p-6 border-destructive/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base sm:text-lg text-destructive">{t("settings.session")}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("settings.sessionDesc")}
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
              {logoutLoading ? t("settings.loggingOut") : t("settings.logout")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
