import { useEffect, useState } from "react";
import { Smartphone, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const APK_URL =
  "https://drive.usercontent.google.com/download?id=1N20sd_ZQZNw6xx2pIaqqVwi6lVCmMHcS&export=download";

function isNativeApp(): boolean {
  if (typeof window === "undefined") return true;
  try {
    // Capacitor injects this global on native platforms
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) return true;
    if (cap?.getPlatform && cap.getPlatform() !== "web") return true;
  } catch {}
  const ua = navigator.userAgent || "";
  if (/Median|wv\)/i.test(ua) && /Android|iPhone|iPad/i.test(ua)) return true;
  return false;
}

export function DownloadAndroidButton() {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isNativeApp());
  }, []);

  if (!show) return null;

  const label =
    lang === "ar"
      ? "تحميل تطبيق أندرويد"
      : lang === "fr"
      ? "Télécharger l'app Android"
      : "Download Android App";
  const sub = lang === "ar" ? "ملف APK" : "APK";

  return (
    <div className="mt-7 flex justify-center">
      <a
        href={APK_URL}
        download="ScanVirusDZ.apk"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-3 rounded-xl px-6 py-3.5 font-semibold text-white transition-all active:scale-[0.98] hover:shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.6)",
        }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
          <Smartphone className="h-5 w-5" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-xs font-mono opacity-80">{sub}</span>
          <span className="text-sm md:text-base">{label}</span>
        </span>
        <Download className="h-4 w-4 opacity-80 transition-transform group-hover:translate-y-0.5" />
      </a>
    </div>
  );
}
