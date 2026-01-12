import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clienti", href: "/clients", icon: Users },
  { name: "Timesheet", href: "/timesheet", icon: Calendar },
  { name: "Report", href: "/reports", icon: BarChart3 },
  { name: "Impostazioni", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(285_80%_55%)] flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-primary-foreground" />
            </div>
            {sidebarOpen && <span>Tempora</span>}
          </Link>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-shrink-0"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Trial badge */}
        {sidebarOpen && (
          <div className="p-4 border-t">
            <div className="px-3 py-2 rounded-lg bg-warning/10 text-warning text-xs">
              <p className="font-medium">Trial gratuito</p>
              <p className="text-warning/80">12 giorni rimanenti</p>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary">M</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Mario Rossi</p>
                <p className="text-xs text-muted-foreground truncate">mario@esempio.com</p>
              </div>
            )}
            {sidebarOpen && (
              <Button variant="ghost" size="icon-sm">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 border-b bg-card">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(285_80%_55%)] flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>Tempora</span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background animate-fade-in">
          <div className="pt-20 p-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:overflow-auto">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
}
