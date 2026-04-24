// Generates AI-driven insights for specific MCP cards (model summary, optimisation narration).
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface InsightRequest {
  kind: "model_summary" | "optimisation_narration";
  context: Record<string, unknown>;
}

const PROMPTS: Record<InsightRequest["kind"], { system: string; tool: any }> = {
  model_summary: {
    system: `You are an MMM analyst. Given model fit + ROI data, return 4 concise insights covering:
- the strongest channel (positive),
- the weakest / wasted spend (negative),
- a diagnostic concern (warning),
- an opportunity (idea).
Keep each insight body to 1-2 sentences, grounded in the supplied numbers.`,
    tool: {
      type: "function",
      function: {
        name: "emit_insights",
        parameters: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tone: { type: "string", enum: ["success", "destructive", "warning", "primary"] },
                  title: { type: "string" },
                  body: { type: "string" },
                },
                required: ["tone", "title", "body"],
                additionalProperties: false,
              },
            },
          },
          required: ["insights"],
          additionalProperties: false,
        },
      },
    },
  },
  optimisation_narration: {
    system: `You are an MMM analyst. Given current vs proposed spend per channel, write a single short paragraph (max 2 sentences) explaining the headline tradeoff and expected lift. Be specific about £ amounts and % shifts.`,
    tool: {
      type: "function",
      function: {
        name: "emit_narration",
        parameters: {
          type: "object",
          properties: { narration: { type: "string" } },
          required: ["narration"],
          additionalProperties: false,
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { kind, context } = (await req.json()) as InsightRequest;
    const cfg = PROMPTS[kind];
    if (!cfg) {
      return new Response(JSON.stringify({ error: "Unknown insight kind" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: cfg.system },
          { role: "user", content: `Context:\n${JSON.stringify(context, null, 2)}` },
        ],
        tools: [cfg.tool],
        tool_choice: { type: "function", function: { name: cfg.tool.function.name } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Credits exhausted" }), {
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
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : {};

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("card-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
