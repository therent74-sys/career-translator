// Netlify Function — 이 설치본이 무엇을 할 수 있는지 알려 줍니다.
export default async () =>
  new Response(JSON.stringify({
    work24: !!process.env.WORK24_KEY,
    ask: !!process.env.ANTHROPIC_API_KEY,
  }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export const config = { path: "/api/capabilities" };
