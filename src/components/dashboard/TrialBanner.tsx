import { useMemo } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrialBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export function TrialBanner({ onDismiss, className }: TrialBannerProps) {
  const { profile, subscription } = useAuth();
  const { t } = useLanguage();

  const trialDaysRemaining = useMemo(() => {
    if (!profile?.trial_ends_at) return null;
    const now = new Date();
    const trialEnd = new Date(profile.trial_ends_at);
    const diffMs = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [profile?.trial_ends_at]);

  // Don't show if already subscribed or not in trial
  if (subscription.subscribed || profile?.plan !== "trial") {
    return null;
  }

  // Don't show if no trial info
  if (trialDaysRemaining === null) {
    return null;
  }

  const isUrgent = trialDaysRemaining <= 3;

  const getTitle = () => {
    if (isUrgent) {
      if (trialDaysRemaining === 0) {
        return t("trial.expirestoday");
      }
      return t("trial.onlyDaysLeft").replace("{days}", String(trialDaysRemaining));
    }
    return t("trial.usingTrial");
  };

  const getMessage = () => {
    if (isUrgent) {
      return t("trial.urgentMessage");
    }
    return t("trial.daysRemaining").replace("{days}", String(trialDaysRemaining));
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-all",
        isUrgent
          ? "bg-gradient-to-r from-destructive/10 via-destructive/5 to-orange-500/10 border border-destructive/20"
          : "bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/5 border border-primary/20",
        className
      )}
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-foreground/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
            isUrgent
              ? "bg-destructive/20"
              : "bg-gradient-to-br from-primary/20 to-purple-500/20"
          )}
        >
          <Sparkles
            className={cn(
              "w-7 h-7",
              isUrgent ? "text-destructive" : "text-primary"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={cn(
              "text-lg font-bold mb-1",
              isUrgent ? "text-destructive" : "text-foreground"
            )}
          >
            {getTitle()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getMessage()}
          </p>
        </div>

        {/* CTA */}
        <UpgradeButton 
          size="lg"
          className={cn(
            "rounded-2xl px-6 flex-shrink-0",
            isUrgent 
              ? "bg-destructive hover:bg-destructive/90" 
              : "btn-gradient"
          )}
        >
          {t("trial.upgradeToPro")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </UpgradeButton>
      </div>

      {/* Progress bar */}
      <div className="relative mt-6">
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isUrgent
                ? "bg-gradient-to-r from-destructive to-orange-500"
                : "bg-gradient-to-r from-primary to-purple-500"
            )}
            style={{
              width: `${Math.max(5, ((7 - trialDaysRemaining) / 7) * 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{t("trial.day1")}</span>
          <span>{t("trial.day7")}</span>
        </div>
      </div>
    </div>
  );
}
