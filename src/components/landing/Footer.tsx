import { Link } from "react-router-dom";
import { Clock, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(285_80%_55%)] flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary-foreground" />
              </div>
              <span>Tempora</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Time tracking semplice e bello per freelancer e team.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Prodotto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Funzionalità</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Prezzi</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Integrazioni</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Risorse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Guide</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Supporto</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">API Docs</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legale</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Termini</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Cookie</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Tempora. Tutti i diritti riservati.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Fatto con <Heart className="w-4 h-4 text-destructive fill-current" /> in Italia
          </p>
        </div>
      </div>
    </footer>
  );
}
