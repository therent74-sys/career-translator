// Cloudflare Pages Function — 2단계 매핑과 3단계 번역을 Claude에게 맡깁니다.
// API 키는 서버 환경변수 ANTHROPIC_API_KEY에만 둡니다.
const MAX_PROMPT = 60000;

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json(503, { error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." });

  let body;
  try { body = await request.json(); } catch (e) { return json(400, { error: "요청을 읽지 못했습니다." }); }
  const prompt = body && body.prompt;
  if (typeof prompt !== "string" || !prompt.trim()) return json(400, { error: "프롬프트가 비어 있습니다." });
  if (prompt.length > MAX_PROMPT) return json(413, { error: "요청이 너무 깁니다." });

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    return json(502, { error: "AI 서비스에 연결하지 못했습니다." });
  }

  let data;
  try { data = await r.json(); } catch (e) { return json(502, { error: "AI 응답을 읽지 못했습니다." }); }
  if (!r.ok) return json(r.status, { error: (data && data.error && data.error.message) || "AI 요청이 거부되었습니다." });

  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  return json(200, { text });
}
