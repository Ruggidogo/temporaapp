import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import temporaLogo from "@/assets/tempora-logo-light.svg";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { key: "nav.features", href: "/#features" },
    { key: "nav.pricing", href: "/#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={temporaLogo} 
            alt="Tempora" 
            className="h-8 dark:hidden transition-transform group-hover:scale-105"
          />
          <img 
            src={temporaLogoDark} 
            alt="Tempora" 
            className="h-8 hidden dark:block transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link 
              key={item.key}
              to={item.href} 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <Button variant="ghost" asChild className="font-medium">
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
          <Button variant="hero" asChild className="group shadow-lg shadow-primary/25">
            <Link to="/register" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t("nav.register")}
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container py-6 space-y-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link 
                  key={item.key}
                  to={item.href} 
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" asChild className="w-full h-12">
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button variant="hero" asChild className="w-full h-12 shadow-lg shadow-primary/25">
                <Link to="/register" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t("nav.register")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
