import { useState, FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { ResultsView, ScanResult } from "./ResultsView";
import { Loader2, Search, ShieldCheck, AlertCircle } from "lucide-react";

function isValidUrl(s: string) {
  try {
    const u = new URL(s.includes("://") ? s : `https://${s}`);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function Scanner() {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState(0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const target = url.trim();
    if (!isValidUrl(target)) {
      setError(t.invalidUrl);
      return;
    }
    const normalized = target.includes("://") ? target : `https://${target}`;

    setLoading(true);
    setProgress(8);
    const tick = setInterval(
      () => setProgress((p) => (p < 92 ? p + Math.random() * 6 : p)),
      350
    );

    try {
      const { data, error: fnError } = await supabase.functions.invoke("scan-url", {
        body: { url: normalized },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setProgress(100);
      setResult(data as ScanResult);
    } catch (err: any) {
      setError(err?.message || t.failed);
    } finally {
      clearInterval(tick);
      setLoading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  if (result) {
    return (
      <ResultsView
        result={result}
        onReset={() => {
          setResult(null);
          setUrl("");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-2 glow">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Search className="h-5 w-5 text-primary shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.placeholder}
              dir="ltr"
              disabled={loading}
              className="w-full bg-transparent border-0 outline-none py-4 font-mono text-sm md:text-base placeholder:text-muted-foreground/60"
              aria-label="URL to scan"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
            style={{ background: "var(--gradient-cyber)", boxShadow: "var(--shadow-glow)" }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.scanning}
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {t.scan}
              </>
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="glass rounded-xl p-4 scan-line">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-primary">{t.scanning}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%`, background: "var(--gradient-cyber)" }}
            />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="glass rounded-xl p-4 border border-destructive/40 flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-destructive">{t.failed}</div>
            <div className="text-muted-foreground mt-1">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
