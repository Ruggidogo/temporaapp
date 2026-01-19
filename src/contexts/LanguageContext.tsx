import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "it" | "en" | "es" | "fr" | "de";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageNames: Record<Language, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

const languageFlags: Record<Language, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
};

export { languageNames, languageFlags };

// Detect browser language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split("-")[0];
  const supportedLanguages: Language[] = ["it", "en", "es", "fr", "de"];
  
  if (supportedLanguages.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  
  return "en"; // Default to English
};

// Get stored language or detect from browser
const getInitialLanguage = (): Language => {
  const stored = localStorage.getItem("tempora-language");
  if (stored && ["it", "en", "es", "fr", "de"].includes(stored)) {
    return stored as Language;
  }
  return detectBrowserLanguage();
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("tempora-language", lang);
  };

  useEffect(() => {
    // Dynamically import translations
    import(`@/i18n/${language}.ts`).then((module) => {
      setTranslations(module.default);
    });
  }, [language]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
