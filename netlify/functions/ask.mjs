// Netlify Function — 매핑·번역을 Claude에게 맡깁니다. API 키는 ANTHROPIC_API_KEY에만 둡니다.
const MAX_PROMPT = 60000;
const json = (status, obj) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export default async (req) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." });
  if (req.method !== "POST") return json(405, { error: "POST로 요청하세요." });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "요청을 읽지 못했습니다." }); }
  const prompt = body && body.prompt;
  if (typeof prompt !== "string" || !prompt.trim()) return json(400, { error: "프롬프트가 비어 있습니다." });
  if (prompt.length > MAX_PROMPT) return json(413, { error: "요청이 너무 깁니다." });

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch { return json(502, { error: "AI 서비스에 연결하지 못했습니다." }); }

  let data;
  try { data = await r.json(); } catch { return json(502, { error: "AI 응답을 읽지 못했습니다." }); }
  if (!r.ok) return json(r.status, { error: data?.error?.message || "AI 요청이 거부되었습니다." });

  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  return json(200, { text });
};

export const config = { path: "/api/ask" };
