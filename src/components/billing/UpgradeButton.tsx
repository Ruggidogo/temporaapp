import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Crown, Loader2, Sparkles, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpgradeButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  upgradeVariant?: "default" | "compact" | "banner";
  children?: React.ReactNode;
}

function LoadingOverlay() {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-card border border-border shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative p-4 rounded-full bg-gradient-to-br from-primary to-purple-500">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1">{t("upgrade.redirecting")}</h3>
          <p className="text-sm text-muted-foreground">{t("upgrade.pleaseWait")}</p>
        </div>
      </div>
    </div>
  );
}

export function UpgradeButton({ upgradeVariant = "default", className, size, children, ...props }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const { subscription } = useAuth();
  const { t } = useLanguage();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        setShowOverlay(true);
        // Small delay to show the overlay before redirect
        setTimeout(() => {
          window.location.href = data.url;
        }, 300);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setLoading(false);
      toast({
        title: t("upgrade.error"),
        description: t("upgrade.checkoutError"),
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        setShowOverlay(true);
        setTimeout(() => {
          window.location.href = data.url;
        }, 300);
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      setLoading(false);
      toast({
        title: t("upgrade.error"),
        description: t("upgrade.portalError"),
        variant: "destructive",
      });
    }
  };

  // If already subscribed, show manage button
  if (subscription.subscribed) {
    if (upgradeVariant === "compact") {
      return (
        <>
          {showOverlay && <LoadingOverlay />}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageSubscription}
            disabled={loading}
            className={cn("border-success/30 text-success hover:bg-success/10", className)}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                {t("upgrade.pro")}
              </>
            )}
          </Button>
        </>
      );
    }

    return (
      <>
        {showOverlay && <LoadingOverlay />}
        <Button
          variant="outline"
          onClick={handleManageSubscription}
          disabled={loading}
          className={cn("border-success/30 hover:bg-success/10", className)}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Crown className="w-4 h-4 mr-2 text-success" />
          )}
          {t("upgrade.manageSubscription")}
          <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
        </Button>
      </>
    );
  }

  // Upgrade button variants
  if (upgradeVariant === "compact") {
    return (
      <>
        {showOverlay && <LoadingOverlay />}
        <Button
          size="sm"
          onClick={handleUpgrade}
          disabled={loading}
          className={cn(
            "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25",
            className
          )}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Crown className="w-4 h-4 mr-1" />
              {t("upgrade.upgrade")}
            </>
          )}
        </Button>
      </>
    );
  }

  if (upgradeVariant === "banner") {
    return (
      <>
        {showOverlay && <LoadingOverlay />}
        <div className={cn("relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-6", className)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t("upgrade.bannerTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("upgrade.bannerDesc")}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {t("upgrade.price")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Default variant
  return (
    <>
      {showOverlay && <LoadingOverlay />}
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        size={size}
        className={cn(
          "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : children ? (
          children
        ) : (
          <>
            <Crown className="w-4 h-4 mr-2" />
            {t("upgrade.upgradeToPro")}
          </>
        )}
      </Button>
    </>
  );
}
