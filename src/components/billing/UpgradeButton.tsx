import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Crown, Loader2, Sparkles, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UpgradeButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  upgradeVariant?: "default" | "compact" | "banner";
  children?: React.ReactNode;
}

export function UpgradeButton({ upgradeVariant = "default", className, size, children, ...props }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { subscription } = useAuth();

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
        title: "Errore",
        description: "Impossibile avviare il checkout. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast({
        title: "Errore",
        description: "Impossibile aprire il portale. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If already subscribed, show manage button
  if (subscription.subscribed) {
    if (upgradeVariant === "compact") {
      return (
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
              Pro
            </>
          )}
        </Button>
      );
    }

    return (
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
        Gestisci abbonamento
        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
      </Button>
    );
  }

  // Upgrade button variants
  if (upgradeVariant === "compact") {
    return (
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
            Upgrade
          </>
        )}
      </Button>
    );
  }

  if (upgradeVariant === "banner") {
    return (
      <div className={cn("relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-6", className)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Passa a Tempora Pro</h3>
              <p className="text-sm text-muted-foreground">
                Sblocca tutte le funzionalità e rimuovi i limiti
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
            €14,99/mese
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
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
          Passa a Pro
        </>
      )}
    </Button>
  );
}
