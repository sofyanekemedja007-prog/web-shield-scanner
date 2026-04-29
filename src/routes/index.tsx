import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/Header";
import { Scanner } from "@/components/Scanner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VirusSKWITCH — Instant URL Threat Scanner" },
      {
        name: "description",
        content:
          "Scan any URL with 70+ antivirus engines via VirusTotal. Get an instant safe / dangerous verdict with detailed engine results.",
      },
      { property: "og:title", content: "VirusSKWITCH — Instant URL Threat Scanner" },
      {
        property: "og:description",
        content: "Paste a link, get a verdict in seconds. Powered by VirusTotal.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  );
}

function App() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="grid-bg fixed inset-0 -z-10 opacity-40 pointer-events-none" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-4xl w-full">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs font-mono mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">{t.tagline}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            {t.heroTitle}
            <br />
            <span className="text-gradient">{t.heroTitle2}</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            {t.heroDesc}
          </p>
        </div>
        <Scanner />
      </main>
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground font-mono">
        {t.poweredBy}
      </footer>
    </div>
  );
}
