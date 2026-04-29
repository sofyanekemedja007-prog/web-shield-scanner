// VirusTotal file scan edge function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VT_API_KEY = Deno.env.get("VIRUSTOTAL_API_KEY");
const MAX_SIZE = 32 * 1024 * 1024; // 32MB

async function pollAnalysis(id: string, attempts = 20): Promise<any> {
  for (let i = 0; i < attempts; i++) {
    const r = await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
      headers: { "x-apikey": VT_API_KEY! },
    });
    const j = await r.json();
    const status = j?.data?.attributes?.status;
    if (status === "completed") return j;
    await new Promise((res) => setTimeout(res, 2000));
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!VT_API_KEY) throw new Error("Missing VIRUSTOTAL_API_KEY");

    const inForm = await req.formData();
    const file = inForm.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: "File exceeds 32MB limit" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Submit file to VirusTotal
    const vtForm = new FormData();
    vtForm.append("file", file, file.name);
    const submit = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: { "x-apikey": VT_API_KEY },
      body: vtForm,
    });
    if (!submit.ok) {
      const t = await submit.text();
      throw new Error(`Submit failed: ${submit.status} ${t}`);
    }
    const submitJson = await submit.json();
    const analysisId = submitJson?.data?.id;
    if (!analysisId) throw new Error("No analysis id returned");

    const analysis = await pollAnalysis(analysisId);
    const attrs = analysis?.data?.attributes ?? {};
    const meta = analysis?.meta?.file_info ?? {};
    const stats = attrs.stats ?? {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      timeout: 0,
    };
    const results = attrs.results ?? {};
    const engines = Object.entries(results).map(([name, v]: any) => ({
      name,
      category: v.category,
      result: v.result,
      method: v.method,
    }));

    return new Response(
      JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        sha256: meta.sha256 ?? null,
        md5: meta.md5 ?? null,
        stats,
        engines,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("scan-file error:", e?.message, e?.stack);
    const msg = String(e?.message ?? "");
    let clientMsg = "Scan failed. Please try again later.";
    let status = 500;
    if (/exceeds 32MB/i.test(msg)) { clientMsg = "File exceeds 32MB limit."; status = 413; }
    else if (/Missing file/i.test(msg)) { clientMsg = "Missing file."; status = 400; }
    else if (/\b429\b/.test(msg)) clientMsg = "Service is busy, please retry shortly.";
    else if (/\b40[13]\b/.test(msg)) clientMsg = "Scan service is temporarily unavailable.";
    return new Response(JSON.stringify({ error: clientMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
