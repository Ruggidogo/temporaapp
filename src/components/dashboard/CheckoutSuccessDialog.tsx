import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Crown, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function CheckoutSuccessDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSubscription, subscription, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    
    if (checkoutStatus === "success") {
      setOpen(true);
      handleRefreshSubscription();
    }
  }, [searchParams]);

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    
    try {
      // Refresh subscription status multiple times with delays to ensure Stripe webhook has processed
      await checkSubscription();
      await new Promise(resolve => setTimeout(resolve, 1500));
      await checkSubscription();
      await refreshProfile();
      
      setRefreshComplete(true);
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Remove checkout param from URL
    searchParams.delete("checkout");
    setSearchParams(searchParams, { replace: true });
  };

  const isPro = subscription.subscribed || profile?.plan === "pro";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <DialogHeader className="relative text-center pb-2">
          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className={cn(
              "relative p-4 rounded-2xl transition-all duration-500",
              isPro 
                ? "bg-gradient-to-r from-primary to-purple-500 shadow-xl shadow-primary/30" 
                : "bg-muted"
            )}>
              {isRefreshing ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : (
                <Crown className="w-10 h-10 text-white" />
              )}
              
              {/* Animated sparkles */}
              {isPro && (
                <>
                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
                  <Sparkles className="absolute -bottom-1 -left-2 w-4 h-4 text-yellow-400 animate-pulse delay-100" />
                </>
              )}
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold">
            {isRefreshing 
              ? t("checkout.verifying")
              : isPro 
                ? t("checkout.successTitle")
                : t("checkout.processingTitle")
            }
          </DialogTitle>
          
          <DialogDescription className="text-base mt-2">
            {isRefreshing 
              ? t("checkout.verifyingDesc")
              : isPro 
                ? t("checkout.successDesc")
                : t("checkout.processingDesc")
            }
          </DialogDescription>
        </DialogHeader>

        {/* Features unlocked */}
        {isPro && !isRefreshing && (
          <div className="relative space-y-3 py-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {t("checkout.unlocked")}
            </p>
            {[
              t("checkout.feature1"),
              t("checkout.feature2"),
              t("checkout.feature3"),
              t("checkout.feature4"),
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="relative flex flex-col gap-3 pt-4">
          {isRefreshing ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("checkout.pleaseWait")}
            </div>
          ) : (
            <>
              <Button 
                onClick={handleClose}
                className="w-full btn-gradient rounded-xl h-12 text-base font-semibold"
              >
                {isPro ? t("checkout.startWorking") : t("checkout.gotIt")}
              </Button>
              
              {!isPro && (
                <Button
                  variant="ghost"
                  onClick={handleRefreshSubscription}
                  className="text-sm"
                >
                  {t("checkout.refreshStatus")}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
