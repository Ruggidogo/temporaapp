import { useState } from "react";
import { Crown, Clock, Check, Sparkles, Zap, FileText, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";
import temporaLogoLight from "@/assets/tempora-logo-light.svg";

export default function TrialExpired() {
  const [loading, setLoading] = useState(false);
  const { signOut, profile } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      icon: Clock,
      title: t("trialExpired.feature1Title"),
      description: t("trialExpired.feature1Desc")
    },
    {
      icon: Users,
      title: t("trialExpired.feature2Title"),
      description: t("trialExpired.feature2Desc")
    },
    {
      icon: FileText,
      title: t("trialExpired.feature3Title"),
      description: t("trialExpired.feature3Desc")
    },
    {
      icon: Zap,
      title: t("trialExpired.feature4Title"),
      description: t("trialExpired.feature4Desc")
    }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: t("upgrade.error"),
        description: t("upgrade.checkoutError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src={temporaLogoDark} 
            alt="Tempora" 
            className="h-8 dark:hidden" 
          />
          <img 
            src={temporaLogoLight} 
            alt="Tempora" 
            className="h-8 hidden dark:block" 
          />
          <Button variant="ghost" onClick={signOut}>
            {t("trialExpired.signOut")}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Expired Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t("trialExpired.badge")}</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-8 md:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-primary to-purple-500 shadow-xl shadow-primary/30 mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {t("trialExpired.greeting").replace("{name}", profile?.name || 'there')}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-6">
                {t("trialExpired.message")
                  .replace("<highlight>", "")
                  .replace("</highlight>", "")
                  .split("Tempora Pro")
                  .map((part, i, arr) => i < arr.length - 1 ? (
                    <span key={i}>{part}<span className="text-primary font-semibold">Tempora Pro</span></span>
                  ) : part)}
              </p>

              {/* Special Offer */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20 mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{t("trialExpired.specialOffer")}</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="relative text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl text-muted-foreground line-through">{t("trialExpired.originalPrice")}</span>
                <span className="text-4xl font-bold text-primary">{t("trialExpired.discountPrice")}</span>
                <span className="text-muted-foreground">{t("trialExpired.perMonth")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("trialExpired.pricingNote")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-xl shadow-primary/30 text-lg px-8 py-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Crown className="w-5 h-5 mr-2" />
                )}
                {t("trialExpired.cta")}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="relative flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>{t("trialExpired.cancelAnytime")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>{t("trialExpired.securePayment")}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("trialExpired.contactUs")} <a href="mailto:support@tempora.app" className="text-primary hover:underline">support@tempora.app</a>
          </p>
        </div>
      </main>
    </div>
  );
}
