import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "ar" | "fr";

const translations = {
  en: {
    tagline: "URL & file threat intelligence, instant.",
    heroTitle: "Scan any URL or file.",
    heroTitle2: "Know if it's safe.",
    heroDesc: "Powered by 70+ antivirus engines via VirusTotal. Paste a link or drop a file and get a verdict in seconds.",
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
    tabUrl: "URL Scan",
    tabFile: "File Scan",
    dropHere: "Drag & drop a file here",
    orClick: "or click to browse",
    chooseFile: "Choose file",
    maxSize: "Max 32MB",
    scanFile: "Scan File",
    uploading: "Uploading…",
    analyzing: "Analyzing…",
    fileTooLarge: "File exceeds 32MB limit.",
    selectedFile: "Selected file",
    removeFile: "Remove",
  },
  ar: {
    tagline: "استخبارات تهديدات الروابط والملفات، فوراً.",
    heroTitle: "افحص أي رابط أو ملف.",
    heroTitle2: "اعرف إن كان آمناً.",
    heroDesc: "مدعوم بأكثر من 70 محرك مكافحة فيروسات عبر VirusTotal. الصق رابطاً أو أسقط ملفاً واحصل على النتيجة خلال ثوانٍ.",
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
    tabUrl: "فحص رابط",
    tabFile: "فحص ملف",
    dropHere: "اسحب وأفلت ملفاً هنا",
    orClick: "أو انقر للتصفح",
    chooseFile: "اختر ملفاً",
    maxSize: "بحد أقصى 32 ميجابايت",
    scanFile: "افحص الملف",
    uploading: "جارٍ الرفع…",
    analyzing: "جارٍ التحليل…",
    fileTooLarge: "يتجاوز الملف الحد الأقصى 32 ميجابايت.",
    selectedFile: "الملف المختار",
    removeFile: "إزالة",
  },
  fr: {
    tagline: "Renseignement instantané sur les URL et fichiers.",
    heroTitle: "Analysez une URL ou un fichier.",
    heroTitle2: "Sachez si c'est sûr.",
    heroDesc: "Propulsé par plus de 70 moteurs antivirus via VirusTotal. Collez un lien ou déposez un fichier, obtenez un verdict en quelques secondes.",
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
    tabUrl: "Analyse URL",
    tabFile: "Analyse fichier",
    dropHere: "Glissez-déposez un fichier ici",
    orClick: "ou cliquez pour parcourir",
    chooseFile: "Choisir un fichier",
    maxSize: "Max 32 Mo",
    scanFile: "Analyser le fichier",
    uploading: "Téléversement…",
    analyzing: "Analyse en cours…",
    fileTooLarge: "Le fichier dépasse la limite de 32 Mo.",
    selectedFile: "Fichier sélectionné",
    removeFile: "Retirer",
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
