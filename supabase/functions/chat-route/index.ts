// Routes user intent to an MCP card + writes a short preamble using Lovable AI tool calling.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const CARDS = [
  { name: "selector", desc: "Project picker — browse, filter and OPEN an EXISTING project. Use ONLY when user wants to find/resume/list projects. Do NOT use for creating new projects." },
  { name: "newProject", desc: "Form to CREATE a NEW project — captures name, brand, BU, market, KPI. Use whenever the user wants to start/create/set up a new project or analysis." },
  { name: "project", desc: "Snapshot of the active project (stage, kpi, dates)." },
  { name: "upload", desc: "Upload datacube CSV, auto-detect columns, validate coverage." },
  { name: "groups", desc: "6-level variable hierarchy (Base/Incremental/Dependent/Dimension)." },
  { name: "properties", desc: "Variable properties: type, unit, aggregation, fill-method." },
  { name: "mapping", desc: "Map media spend to impressions/clicks." },
  { name: "transformations", desc: "Adstock, gamma, saturation curves per variable." },
  { name: "results", desc: "Model results: R², MAPE, contribution split, ROI per channel." },
  { name: "summary", desc: "AI-generated narrative insights about a fitted model." },
  { name: "optimisation", desc: "Reallocate spend with sliders, view forecast lift." },
  { name: "flighting", desc: "Monthly flighting / scheduling heatmap across channels." },
  { name: "workflow", desc: "Overall workflow tracker showing current stage." },
  { name: "classification", desc: "Variable classification review with flagged items." },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are DD Assistant — a conversational MMM (marketing mix modelling) co-pilot.
You help analysts move through a 9-stage MMM workflow inside a chat UI. Each step has a dedicated MCP card you can render.

Available cards:
${CARDS.map((c) => `- ${c.name}: ${c.desc}`).join("\n")}

For every user message:
1. Decide which ONE card (if any) best fits their intent. If none fit, set card to null.
2. Write a short conversational preamble (1-2 sentences, no markdown headings) to display above the card.
3. Be concise, expert and friendly. Reference MMM concepts naturally.

Always respond by calling the route_intent function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: [
          {
            type: "function",
            function: {
              name: "route_intent",
              description: "Pick the best MCP card and write a preamble.",
              parameters: {
                type: "object",
                properties: {
                  preamble: { type: "string", description: "Short conversational reply (1-2 sentences)." },
                  card: {
                    type: ["string", "null"],
                    enum: [...CARDS.map((c) => c.name), null],
                    description: "Card key to render, or null if no card is appropriate.",
                  },
                  prefill: {
                    type: ["object", "null"],
                    description: "Only when card is 'newProject'. Extract any project hints from the user's message. Normalise: brand to Title Case full word (e.g. 'choc' -> 'Chocolate'), market to one of [UK, US, France, Germany, Australia, Japan, India, Brazil], BU to one of [NorthAmerica, Europe, Asia-Pac, LATAM] inferred from market, KPI to one of [Sales Volume, Revenue, Market Share, Brand Awareness, Conversions]. Generate a sensible project name like '<MARKET>_<BRAND>_<YEAR>' if user didn't give one. Omit any field the user didn't hint at.",
                    properties: {
                      name: { type: "string" },
                      brand: { type: "string" },
                      market: { type: "string" },
                      bu: { type: "string" },
                      kpi: { type: "string" },
                    },
                    additionalProperties: false,
                  },
                },
                required: ["preamble", "card"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "route_intent" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited, please try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Lovable AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    let preamble = "Got it.";
    let card: string | null = null;
    let prefill: Record<string, string> | null = null;
    if (call?.function?.arguments) {
      try {
        const args = JSON.parse(call.function.arguments);
        preamble = args.preamble ?? preamble;
        card = args.card ?? null;
        prefill = args.prefill ?? null;
      } catch (e) {
        console.error("Failed to parse tool args", e);
      }
    }

    return new Response(JSON.stringify({ preamble, card, prefill }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-route error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
