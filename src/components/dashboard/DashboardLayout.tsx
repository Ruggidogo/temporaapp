import { ReactNode, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Sparkles,
  ListTodo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import temporaLogoLight from "@/assets/tempora-logo-light.svg";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";
import temporaIcon from "@/assets/tempora-icon.svg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.clients", href: "/clients", icon: Users },
  { key: "nav.tasks", href: "/tasks", icon: ListTodo },
  { key: "nav.timesheet", href: "/timesheet", icon: Calendar },
  { key: "nav.reports", href: "/reports", icon: BarChart3 },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const trialDaysRemaining = useMemo(() => {
    if (!profile?.trial_ends_at) return null;
    const now = new Date();
    const trialEnd = new Date(profile.trial_ends_at);
    const diffMs = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [profile?.trial_ends_at]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-mesh bg-background">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col border-r bg-card/80 backdrop-blur-xl transition-all duration-300 relative",
          sidebarOpen ? "w-72" : "w-20"
        )}
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Logo */}
        <div className="h-18 flex items-center justify-between px-5 py-4 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-3">
            {sidebarOpen ? (
              <img 
                src={temporaLogoLight} 
                alt="Tempora" 
                className="h-10 dark:hidden"
              />
            ) : (
              <img 
                src={temporaIcon} 
                alt="Tempora" 
                className="h-10 w-10"
              />
            )}
            {sidebarOpen && (
              <img 
                src={temporaLogoDark} 
                alt="Tempora" 
                className="h-10 hidden dark:block"
              />
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-shrink-0 hover:bg-primary/10 rounded-xl"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href}
                className={cn(
                  "nav-item",
                  isActive 
                    ? "nav-item-active" 
                    : "nav-item-inactive"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{t(item.key)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Trial badge */}
        {sidebarOpen && profile?.plan === "trial" && trialDaysRemaining !== null && (
          <div className="px-4 pb-2">
            <div className={cn(
              "p-4 rounded-2xl border transition-all",
              trialDaysRemaining <= 3 
                ? "bg-destructive/5 border-destructive/20" 
                : "bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={cn(
                  "w-4 h-4",
                  trialDaysRemaining <= 3 ? "text-destructive" : "text-primary"
                )} />
                <p className={cn(
                  "font-semibold text-sm",
                  trialDaysRemaining <= 3 ? "text-destructive" : "text-primary"
                )}>
                  {t("nav.freeTrial")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {trialDaysRemaining === 0 
                  ? t("nav.expirestoday") 
                  : trialDaysRemaining === 1 
                    ? t("nav.oneDayRemaining") 
                    : t("nav.daysRemaining").replace("{days}", String(trialDaysRemaining))}
              </p>
              <Button 
                size="sm" 
                className="w-full mt-3 btn-gradient text-xs h-8"
              >
                {t("nav.upgradeToPro")}
              </Button>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile?.name || t("nav.user")}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 hover:text-destructive rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 border-b glass">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src={temporaLogoLight} 
            alt="Tempora" 
            className="h-9 dark:hidden"
          />
          <img 
            src={temporaLogoDark} 
            alt="Tempora" 
            className="h-9 hidden dark:block"
          />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-lg animate-fade-in">
          <div className="pt-20 p-4">
            <nav className="space-y-2 stagger-children">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:overflow-auto scrollbar-thin">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
}
