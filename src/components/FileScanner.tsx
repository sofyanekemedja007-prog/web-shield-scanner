import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { ResultsView, ScanResult } from "./ResultsView";
import { Loader2, Upload, ShieldCheck, AlertCircle, FileIcon, X } from "lucide-react";

const MAX_SIZE = 32 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileScanner() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "uploading" | "analyzing">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    setError(null);
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError(t.fileTooLarge);
      return;
    }
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (loading) return;
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  }

  async function uploadAndScan() {
    if (!file) return;
    setError(null);
    setLoading(true);
    setPhase("uploading");
    setProgress(0);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
    const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    const url = `${SUPABASE_URL}/functions/v1/scan-file`;

    const form = new FormData();
    form.append("file", file);

    try {
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${KEY}`);
        xhr.setRequestHeader("apikey", KEY);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = (evt.loaded / evt.total) * 100;
            setProgress(pct);
            if (pct >= 100) setPhase("analyzing");
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(json);
            else reject(new Error(json?.error || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(form);
      });

      const res: ScanResult = {
        url: `${data.fileName} (${formatSize(data.fileSize)})`,
        stats: data.stats,
        engines: data.engines,
        reputation: 0,
        lastAnalysisDate: null,
      };
      setResult(res);
    } catch (err: any) {
      setError(err?.message || t.failed);
    } finally {
      setLoading(false);
      setPhase("idle");
      setTimeout(() => setProgress(0), 600);
    }
  }

  if (result) {
    return (
      <ResultsView
        result={result}
        onReset={() => {
          setResult(null);
          setFile(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`glass-strong rounded-2xl p-10 border-2 border-dashed transition cursor-pointer text-center ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onChange}
          disabled={loading}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--gradient-cyber)", boxShadow: "var(--shadow-glow)" }}
          >
            <Upload className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="font-display font-bold text-lg">{t.dropHere}</div>
          <div className="text-sm text-muted-foreground">{t.orClick}</div>
          <div className="text-xs font-mono text-muted-foreground mt-1">{t.maxSize}</div>
        </div>
      </div>

      {file && !loading && (
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t.selectedFile}
            </div>
            <div className="font-mono text-sm truncate">{file.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{formatSize(file.size)}</div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="glass h-9 w-9 rounded-lg flex items-center justify-center hover:border-destructive/40 transition"
            aria-label={t.removeFile}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        onClick={uploadAndScan}
        disabled={!file || loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
        style={{ background: "var(--gradient-cyber)", boxShadow: "var(--shadow-glow)" }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {phase === "uploading" ? t.uploading : t.analyzing}
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            {t.scanFile}
          </>
        )}
      </button>

      {loading && (
        <div className="glass rounded-xl p-4 scan-line">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-primary">
              {phase === "uploading" ? t.uploading : t.analyzing}
            </span>
            <span className="text-muted-foreground">
              {phase === "uploading" ? `${Math.round(progress)}%` : "…"}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                phase === "analyzing" ? "animate-pulse w-full" : ""
              }`}
              style={{
                width: phase === "uploading" ? `${progress}%` : "100%",
                background: "var(--gradient-cyber)",
              }}
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
