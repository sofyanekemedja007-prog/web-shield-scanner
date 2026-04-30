import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/Header";
import { Scanner } from "@/components/Scanner";
import { FileScanner } from "@/components/FileScanner";
import { DownloadAndroidButton } from "@/components/DownloadAndroidButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, Link2, FileUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScanVirusDZ — Instant URL & File Threat Scanner" },
      {
        name: "description",
        content:
          "Scan any URL or file with 70+ antivirus engines via VirusTotal. Get an instant safe / dangerous verdict with detailed engine results.",
      },
      { property: "og:title", content: "ScanVirusDZ — Instant URL & File Threat Scanner" },
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
      {/* كود إخفاء العلامة المائية المضافة من Lovable */}
      <style>{`
        #lovable-badge, 
        .lovable-badge, 
        [class*="lovable-badge"] { 
          display: none !important; 
          visibility: hidden !important; 
          pointer-events: none !important;
        }
      `}</style>
      
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
          <DownloadAndroidButton />
        </div>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="glass mx-auto mb-6 grid w-full max-w-md grid-cols-2 h-auto p-1">
            <TabsTrigger value="url" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 gap-2">
              <Link2 className="h-4 w-4" />
              {t.tabUrl}
            </TabsTrigger>
            <TabsTrigger value="file" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 gap-2">
              <FileUp className="h-4 w-4" />
              {t.tabFile}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="mt-0">
            <Scanner />
          </TabsContent>
          <TabsContent value="file" className="mt-0">
            <FileScanner />
          </TabsContent>
        </Tabs>
        <div className="mt-10 text-center text-xs text-muted-foreground font-mono">
          ScanVirusDZ
        </div>
      </main>
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground font-mono">
        {t.poweredBy}
      </footer>
    </div>
  );
}
