"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    title: "Stackspedia",
    subtitle: "is coming!",
    description: "The hub for Open Source projects. Sign up now to receive exclusive updates and get early access.",
    emailPlaceholder: "Enter your email",
    buttonText: "🎯 Notify me when ready",
    loading: "Sending...",
    successMessage: "✨ Perfect! We'll contact you soon with exclusive news",
    errorMessage: "⚠️ Oops! Something went wrong. Please try again in a moment",
    features: {
      docs: { title: "Documentation", desc: "Complete and updated guides" },
      tools: { title: "Tools", desc: "Utilities for developers" },
      insights: { title: "Insights", desc: "About the most common frameworks" } // Inglese
    }
  },
  it: {
    title: "Stackspedia",
    subtitle: "sta arrivando!",
    description: "L'hub per i progetti Open Source. Iscriviti ora per ricevere aggiornamenti esclusivi e accedere in anteprima.",
    emailPlaceholder: "Inserisci la tua email",
    buttonText: "🎯 Avvisami quando è pronto",
    loading: "Invio in corso...",
    successMessage: "✨ Perfetto! Ti contatteremo presto con novità esclusive",
    errorMessage: "⚠️ Ops! Qualcosa è andato storto. Riprova tra un momento",
    features: {
      docs: { title: "Documentazione", desc: "Guide complete e aggiornate" },
      tools: { title: "Strumenti", desc: "Utility per sviluppatori" },
      insights: { title: "Insight", desc: "Sui framework più comuni" }
    }
  },
  es: {
    title: "Stackspedia",
    subtitle: "¡ya viene!",
    description: "El hub para proyectos Open Source. Regístrate ahora para recibir actualizaciones exclusivas y acceso anticipado.",
    emailPlaceholder: "Ingresa tu email",
    buttonText: "🎯 Avísame cuando esté listo",
    loading: "Enviando...",
    successMessage: "✨ ¡Perfecto! Te contactaremos pronto con noticias exclusivas",
    errorMessage: "⚠️ ¡Ups! Algo salió mal. Inténtalo de nuevo en un momento",
    features: {
      docs: { title: "Documentación", desc: "Guías completas y actualizadas" },
      tools: { title: "Herramientas", desc: "Utilidades para desarrolladores" },
      insights: { title: "Insights", desc: "Sobre los frameworks más comunes" } // Spagnolo
    }
  },
  fr: {
    title: "Stackspedia",
    subtitle: "arrive bientôt!",
    description: "Le hub pour les projets Open Source. Inscrivez-vous maintenant pour recevoir des mises à jour exclusives et un accès anticipé.",
    emailPlaceholder: "Entrez votre email",
    buttonText: "🎯 Prévenez-moi quand c'est prêt",
    loading: "Envoi en cours...",
    successMessage: "✨ Parfait! Nous vous contacterons bientôt avec des nouvelles exclusives",
    errorMessage: "⚠️ Oups! Quelque chose a mal tourné. Réessayez dans un moment",
    features: {
      docs: { title: "Documentation", desc: "Guides complets et à jour" },
      tools: { title: "Outils", desc: "Utilitaires pour développeurs" },
      insights: { title: "Insights", desc: "Sur les frameworks les plus courants" } // Francese
    }
  },
  de: {
    title: "Stackspedia",
    subtitle: "kommt bald!",
    description: "Der Hub für Open Source Projekte. Melde dich jetzt an, um exklusive Updates zu erhalten und frühen Zugang zu bekommen.",
    emailPlaceholder: "E-Mail eingeben",
    buttonText: "🎯 Benachrichtige mich, wenn bereit",
    loading: "Wird gesendet...",
    successMessage: "✨ Perfekt! Wir werden Sie bald mit exklusiven Neuigkeiten kontaktieren",
    errorMessage: "⚠️ Ups! Etwas ist schief gelaufen. Versuchen Sie es in einem Moment erneut",
    features: {
      docs: { title: "Dokumentation", desc: "Vollständige und aktuelle Anleitungen" },
      tools: { title: "Werkzeuge", desc: "Dienstprogramme für Entwickler" },
      insights: { title: "Insights", desc: "Über die gängigsten Frameworks" }   // Tedesco
    }
  }
};

function detectLanguage() {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language || navigator.languages?.[0];
    const langCode = browserLang?.split('-')[0] as keyof typeof translations;
    return translations[langCode] ? langCode : 'en';
  }
  return 'en';
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [language, setLanguage] = useState('en');
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
    setT(translations[detectedLang as keyof typeof translations]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Simulated API call - replace with your Supabase code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center px-4 overflow-hidden pb-16">
        {/* Animated background with floating elements */}
        <div className="absolute inset-0 z-0">
          {/* Floating colored orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-green-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>

          {/* Animated grid */}
          <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0 L0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="z-10 w-full max-w-6xl mx-auto px-4">
          {/* Language Selector */}
          <div className="flex justify-center mb-16">
            <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              {Object.keys(translations).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setT(translations[lang as keyof typeof translations]);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${language === lang
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Logo and Title - Perfectly Centered */}
          <div className="w-full flex flex-col items-center justify-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="flex-shrink-0" width="80" height="80" viewBox="-30 -100 130 120" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M-25,-15 L25,-40 L75,-15 L25,10 Z" fill="#3498db" opacity="0.9" className="animate-pulse" />
                  <path d="M-25,-33.75 L25,-58.75 L75,-33.75 L25,-8.75 Z" fill="#e74c3c" opacity="0.9" className="animate-pulse delay-300" />
                  <path d="M-25,-52.5 L25,-77.5 L75,-52.5 L25,-27.5 Z" fill="#2ecc71" opacity="0.9" className="animate-pulse delay-700" />
                  <path d="M-25,-71.25 L25,-96.25 L75,-71.25 L25,-46.25 Z" fill="#f39c12" opacity="0.9" className="animate-pulse delay-1000" />
                  <path d="M25,-40 L75,-15 L75,-33.75 L25,-58.75 Z" fill="#2980b9" opacity="0.7" />
                  <path d="M25,-58.75 L75,-33.75 L75,-52.5 L25,-77.5 Z" fill="#c0392b" opacity="0.7" />
                  <path d="M25,-77.5 L75,-52.5 L75,-71.25 L25,-96.25 Z" fill="#27ae60" opacity="0.7" />
                </g>
              </svg>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white">
                {t.title}
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-slate-300 font-light">
              {t.subtitle}
            </p>
          </div>

          {/* Form - Centered */}
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-md">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white placeholder:text-slate-400 h-14 text-lg rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 w-full"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-red-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {status === "loading" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {t.loading}
                      </div>
                    ) : (
                      t.buttonText
                    )}
                  </Button>
                </div>
                {status === "success" && (
                  <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl">
                    <p className="text-green-400 text-center font-medium">
                      {t.successMessage}
                    </p>
                  </div>
                )}
                {status === "error" && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                    <p className="text-red-400 text-center font-medium">
                      {t.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description centered */}
          <div className="flex justify-center mb-12">
            <p className="text-slate-300 text-lg lg:text-xl leading-relaxed max-w-2xl text-center">
              {t.description}
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-blue-300 font-semibold mb-2">{t.features.docs.title}</h3>
              <p className="text-slate-400 text-sm">{t.features.docs.desc}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🛠️</div>
              <h3 className="text-red-300 font-semibold mb-2">{t.features.tools.title}</h3>
              <p className="text-slate-400 text-sm">{t.features.tools.desc}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-green-300 font-semibled mb-2">{t.features.insights.title}</h3>
              <p className="text-slate-400 text-sm">{t.features.insights.desc}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            {/* Logo e Copyright */}
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="-30 -100 130 120" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M-25,-15 L25,-40 L75,-15 L25,10 Z" fill="#3498db" opacity="0.9" />
                  <path d="M-25,-33.75 L25,-58.75 L75,-33.75 L25,-8.75 Z" fill="#e74c3c" opacity="0.9" />
                  <path d="M-25,-52.5 L25,-77.5 L75,-52.5 L25,-27.5 Z" fill="#2ecc71" opacity="0.9" />
                  <path d="M-25,-71.25 L25,-96.25 L75,-71.25 L25,-46.25 Z" fill="#f39c12" opacity="0.9" />
                </g>
              </svg>
              <span className="text-sm font-bold text-white">Stackspedia</span>
              <span className="text-slate-400 text-xs">© 2025 Beniamino Torregrossa</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/in/bentorregrossa/" className="text-slate-400 hover:text-white transition-colors">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>

  );
}