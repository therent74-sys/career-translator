// Cloudflare Pages Function — 이 설치본이 무엇을 할 수 있는지 알려 줍니다.
export function onRequestGet({ env }) {
  const body = JSON.stringify({
    work24: !!env.WORK24_KEY,
    ask: !!env.ANTHROPIC_API_KEY,
  });
  return new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
