import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "ar" | "fr";

const translations = {
  en: {
    tagline: "URL threat intelligence, instant.",
    heroTitle: "Scan any URL.",
    heroTitle2: "Know if it's safe.",
    heroDesc: "Powered by 70+ antivirus engines via VirusTotal. Paste a link and get a verdict in seconds.",
    placeholder: "https://example.com",
    scan: "Scan URL",
    scanning: "Scanning…",
    invalidUrl: "Please enter a valid URL.",
    safe: "Safe",
    dangerous: "Dangerous",
    suspicious: "Suspicious",
    malicious: "Malicious",
    harmless: "Harmless",
    undetected: "Undetected",
    statsTitle: "Detection statistics",
    enginesTitle: "Top security engines",
    engine: "Engine",
    verdict: "Verdict",
    method: "Method",
    clean: "clean",
    newScan: "New scan",
    failed: "Scan failed",
    target: "Target",
    poweredBy: "Powered by VirusTotal",
    theme: "Theme",
    language: "Language",
  },
  ar: {
    tagline: "استخبارات تهديدات الروابط، فوراً.",
    heroTitle: "افحص أي رابط.",
    heroTitle2: "اعرف إن كان آمناً.",
    heroDesc: "مدعوم بأكثر من 70 محرك مكافحة فيروسات عبر VirusTotal. الصق الرابط واحصل على النتيجة خلال ثوانٍ.",
    placeholder: "https://example.com",
    scan: "افحص الرابط",
    scanning: "جارٍ الفحص…",
    invalidUrl: "الرجاء إدخال رابط صالح.",
    safe: "آمن",
    dangerous: "خطير",
    suspicious: "مشبوه",
    malicious: "ضار",
    harmless: "سليم",
    undetected: "غير مكتشف",
    statsTitle: "إحصاءات الكشف",
    enginesTitle: "أبرز محركات الأمان",
    engine: "المحرك",
    verdict: "النتيجة",
    method: "الطريقة",
    clean: "نظيف",
    newScan: "فحص جديد",
    failed: "فشل الفحص",
    target: "الهدف",
    poweredBy: "بدعم من VirusTotal",
    theme: "المظهر",
    language: "اللغة",
  },
  fr: {
    tagline: "Renseignement instantané sur les URL.",
    heroTitle: "Analysez n'importe quelle URL.",
    heroTitle2: "Sachez si elle est sûre.",
    heroDesc: "Propulsé par plus de 70 moteurs antivirus via VirusTotal. Collez un lien, obtenez un verdict en quelques secondes.",
    placeholder: "https://exemple.com",
    scan: "Analyser",
    scanning: "Analyse en cours…",
    invalidUrl: "Veuillez saisir une URL valide.",
    safe: "Sûr",
    dangerous: "Dangereux",
    suspicious: "Suspect",
    malicious: "Malveillant",
    harmless: "Inoffensif",
    undetected: "Non détecté",
    statsTitle: "Statistiques de détection",
    enginesTitle: "Principaux moteurs de sécurité",
    engine: "Moteur",
    verdict: "Verdict",
    method: "Méthode",
    clean: "propre",
    newScan: "Nouvelle analyse",
    failed: "Échec de l'analyse",
    target: "Cible",
    poweredBy: "Propulsé par VirusTotal",
    theme: "Thème",
    language: "Langue",
  },
};

type Dict = typeof translations.en;
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict; dir: "ltr" | "rtl" };

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("vs-lang") as Lang) || "en";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("vs-lang", l);
  };

  return (
    <I18nCtx.Provider value={{ lang, setLang, t: translations[lang], dir }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
