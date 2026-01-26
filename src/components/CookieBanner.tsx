import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie, X, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "tempora-cookie-consent";

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function CookieBanner() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid showing banner immediately on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const rejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const savePreferences = () => {
    saveConsent({
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("cookieBanner.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("cookieBanner.description")}
                  </p>
                </div>
                <button
                  onClick={rejectNonEssential}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {t("cookieBanner.customize")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectNonEssential}
                >
                  {t("cookieBanner.rejectAll")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={acceptAll}
                >
                  {t("cookieBanner.acceptAll")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("cookieBanner.settings.title")}</DialogTitle>
            <DialogDescription>
              {t("cookieBanner.settings.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <Checkbox id="necessary" checked disabled className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="necessary" className="font-medium">
                  {t("cookieBanner.settings.necessary")}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("cookieBanner.settings.necessaryDesc")}
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="analytics"
                checked={analytics}
                onCheckedChange={(checked) => setAnalytics(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="analytics" className="font-medium cursor-pointer">
                  {t("cookieBanner.settings.analytics")}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("cookieBanner.settings.analyticsDesc")}
                </p>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="marketing"
                checked={marketing}
                onCheckedChange={(checked) => setMarketing(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="marketing" className="font-medium cursor-pointer">
                  {t("cookieBanner.settings.marketing")}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("cookieBanner.settings.marketingDesc")}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              {t("cookieBanner.settings.cancel")}
            </Button>
            <Button onClick={savePreferences}>
              {t("cookieBanner.settings.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
