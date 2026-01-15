import { Link } from "react-router-dom";
import { Heart, Twitter, Linkedin, Github } from "lucide-react";
import temporaLogo from "@/assets/tempora-logo-light.svg";
import temporaLogoDark from "@/assets/tempora-logo-dark.svg";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Footer() {
  const { ref: footerRef, isVisible: footerVisible } = useScrollAnimation();

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  const footerLinks = {
    Prodotto: ["Funzionalità", "Prezzi", "Integrazioni", "Roadmap"],
    Risorse: ["Blog", "Guide", "Supporto", "API Docs"],
    Legale: ["Privacy", "Termini", "Cookie"],
  };

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/30">
      <div 
        ref={footerRef}
        className="container py-16 md:py-20 transition-all duration-1000"
        style={{
          opacity: footerVisible ? 1 : 0,
          transform: footerVisible ? "translateY(0)" : "translateY(40px)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-6 group">
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
            <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
              Time tracking semplice e bello per freelancer e team che vogliono lavorare meglio.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], sectionIndex) => (
            <div 
              key={title}
              style={{
                transitionDelay: `${(sectionIndex + 1) * 100}ms`,
              }}
            >
              <h4 className="font-semibold mb-5 text-foreground">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link 
                      to="/" 
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Tempora. Tutti i diritti riservati.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Fatto con 
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> 
            in Italia
          </p>
        </div>
      </div>
    </footer>
  );
}
