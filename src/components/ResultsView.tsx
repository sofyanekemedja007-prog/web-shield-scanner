import { useI18n } from "@/lib/i18n";

export type ScanStats = {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout?: number;
};

export type ScanEngine = {
  name: string;
  category: string;
  result: string | null;
  method: string;
};

export type ScanResult = {
  url: string;
  stats: ScanStats;
  engines: ScanEngine[];
  reputation: number;
  lastAnalysisDate: number | null;
};

import { ShieldCheck, ShieldAlert, AlertTriangle, CircleHelp, RotateCcw } from "lucide-react";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "success" | "muted";
}) {
  const colors = {
    danger: "text-destructive border-destructive/30 bg-destructive/10",
    warning: "text-warning border-warning/30 bg-warning/10",
    success: "text-success border-success/30 bg-success/10",
    muted: "text-muted-foreground border-border bg-muted/30",
  }[tone];

  return (
    <div className={`glass rounded-xl p-5 border ${colors}`}>
      <div className="font-display text-4xl font-extrabold">{value}</div>
      <div className="text-xs uppercase tracking-wider mt-2 opacity-80">{label}</div>
    </div>
  );
}

export function ResultsView({
  result,
  onReset,
}: {
  result: ScanResult;
  onReset: () => void;
}) {
  const { t } = useI18n();
  const { stats } = result;
  const isDangerous = stats.malicious > 0 || stats.suspicious > 1;
  const total =
    stats.malicious + stats.suspicious + stats.harmless + stats.undetected + (stats.timeout || 0);

  const topEngines = result.engines
    .filter((e) => e.result || e.category !== "undetected")
    .sort((a, b) => {
      const order = { malicious: 0, suspicious: 1, harmless: 2, undetected: 3 } as Record<string, number>;
      return (order[a.category] ?? 4) - (order[b.category] ?? 4);
    })
    .slice(0, 12);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Verdict card */}
      <div
        className={`glass-strong rounded-2xl p-8 border ${
          isDangerous ? "border-destructive/40" : "border-success/40"
        } relative overflow-hidden`}
      >
        <div
          className="absolute -top-24 -end-24 h-64 w-64 rounded-full blur-3xl opacity-30"
          style={{
            background: isDangerous
              ? "var(--color-destructive)"
              : "var(--gradient-cyber)",
          }}
        />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div
            className={`h-20 w-20 rounded-2xl flex items-center justify-center ${
              isDangerous ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
            }`}
          >
            {isDangerous ? (
              <ShieldAlert className="h-10 w-10" />
            ) : (
              <ShieldCheck className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t.target}
            </div>
            <div className="font-mono text-sm md:text-base truncate mt-1">{result.url}</div>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span
                className={`font-display text-4xl md:text-5xl font-extrabold ${
                  isDangerous ? "text-destructive" : "text-success"
                }`}
              >
                {isDangerous ? t.dangerous : t.safe}
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {stats.malicious + stats.suspicious}/{total} {t.malicious.toLowerCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onReset}
            className="glass rounded-lg px-4 py-2.5 text-sm font-medium hover:border-primary/40 transition flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t.newScan}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {t.statsTitle}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label={t.malicious} value={stats.malicious} tone="danger" />
          <StatCard label={t.suspicious} value={stats.suspicious} tone="warning" />
          <StatCard label={t.harmless} value={stats.harmless} tone="success" />
          <StatCard label={t.undetected} value={stats.undetected} tone="muted" />
        </div>
      </div>

      {/* Engines */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
          {t.enginesTitle}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-start py-2 font-medium">{t.engine}</th>
                <th className="text-start py-2 font-medium">{t.verdict}</th>
                <th className="text-start py-2 font-medium hidden sm:table-cell">{t.method}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {topEngines.map((e) => {
                const isBad = e.category === "malicious" || e.category === "suspicious";
                const Icon = isBad ? AlertTriangle : e.category === "harmless" ? ShieldCheck : CircleHelp;
                const color =
                  e.category === "malicious"
                    ? "text-destructive"
                    : e.category === "suspicious"
                    ? "text-warning"
                    : e.category === "harmless"
                    ? "text-success"
                    : "text-muted-foreground";
                return (
                  <tr key={e.name} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pe-3 text-foreground">{e.name}</td>
                    <td className={`py-3 pe-3 ${color}`}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {e.result || e.category}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs hidden sm:table-cell">
                      {e.method}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
