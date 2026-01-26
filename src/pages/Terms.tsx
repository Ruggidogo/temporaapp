import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div 
            ref={heroRef}
            className="container relative z-10 text-center transition-all duration-1000"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">{t("terms.title")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              {t("terms.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("terms.intro")}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div 
            ref={contentRef}
            className="container max-w-3xl transition-all duration-1000"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm space-y-8">
                
                <p className="text-sm text-muted-foreground">
                  {t("terms.lastUpdate")} 19 Gennaio 2026
                </p>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section1.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section1.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section2.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section2.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section3.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section3.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section4.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section4.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section5.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section5.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section6.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section6.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section7.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section7.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section8.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section8.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section9.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section9.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section10.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section10.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section11.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section11.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section12.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section12.content")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">{t("terms.section13.title")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("terms.section13.content")}
                  </p>
                </section>

              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
