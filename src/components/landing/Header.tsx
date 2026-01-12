import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(285_80%_55%)] flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>Tempora</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Funzionalità
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Prezzi
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Accedi</Link>
          </Button>
          <Button variant="default" asChild>
            <Link to="/register">Prova gratis</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col gap-2">
              <Link 
                to="/" 
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funzionalità
              </Link>
              <Link 
                to="/" 
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prezzi
              </Link>
              <Link 
                to="/" 
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">Accedi</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/register">Prova gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
