// VirusTotal URL scan edge function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VT_API_KEY = Deno.env.get("VIRUSTOTAL_API_KEY");

function b64url(input: string) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function pollAnalysis(id: string, attempts = 10): Promise<any> {
  for (let i = 0; i < attempts; i++) {
    const r = await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
      headers: { "x-apikey": VT_API_KEY! },
    });
    const j = await r.json();
    const status = j?.data?.attributes?.status;
    if (status === "completed") return j;
    await new Promise((res) => setTimeout(res, 1500));
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!VT_API_KEY) throw new Error("Missing VIRUSTOTAL_API_KEY");
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to fetch existing report first via URL identifier
    const urlId = b64url(url);
    let report: any = null;

    const existing = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { "x-apikey": VT_API_KEY },
    });

    if (existing.ok) {
      report = await existing.json();
    } else {
      // Submit URL for scanning
      const form = new URLSearchParams();
      form.append("url", url);
      const submit = await fetch("https://www.virustotal.com/api/v3/urls", {
        method: "POST",
        headers: {
          "x-apikey": VT_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      if (!submit.ok) {
        const t = await submit.text();
        throw new Error(`Submit failed: ${submit.status} ${t}`);
      }
      const submitJson = await submit.json();
      const analysisId = submitJson?.data?.id;
      if (!analysisId) throw new Error("No analysis id returned");
      await pollAnalysis(analysisId);
      const final = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
        headers: { "x-apikey": VT_API_KEY },
      });
      report = await final.json();
    }

    const attrs = report?.data?.attributes ?? {};
    const stats = attrs.last_analysis_stats ?? {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      timeout: 0,
    };
    const results = attrs.last_analysis_results ?? {};
    const engines = Object.entries(results).map(([name, v]: any) => ({
      name,
      category: v.category,
      result: v.result,
      method: v.method,
    }));

    return new Response(
      JSON.stringify({
        url,
        stats,
        engines,
        reputation: attrs.reputation ?? 0,
        lastAnalysisDate: attrs.last_analysis_date ?? null,
        title: attrs.title ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("scan-url error:", e?.message, e?.stack);
    const msg = String(e?.message ?? "");
    let clientMsg = "Scan failed. Please try again later.";
    if (/\b429\b/.test(msg)) clientMsg = "Service is busy, please retry shortly.";
    else if (/\b40[13]\b/.test(msg)) clientMsg = "Scan service is temporarily unavailable.";
    else if (/Invalid URL/i.test(msg)) clientMsg = "Invalid URL.";
    return new Response(JSON.stringify({ error: clientMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
