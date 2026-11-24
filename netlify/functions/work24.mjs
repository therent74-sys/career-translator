// Netlify Function — 고용24 채용정보 Open API 중계. 인증키는 WORK24_KEY에만 둡니다.
const LIST = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do";
const DTL  = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210D01.do";
const ALLOW = new Set([
  "callTp", "startPage", "display", "sortOrderBy",
  "region", "occupation", "salTp", "minPay", "maxPay", "keyword",
  "wantedAuthNo", "infoSvc",
]);

export default async (req) => {
  const key = process.env.WORK24_KEY;
  if (!key) return new Response("WORK24_KEY 환경변수가 설정되지 않았습니다.", {
    status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });

  const incoming = new URL(req.url).searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of incoming) {
    if (ALLOW.has(k) && v !== "" && v != null) p.set(k, String(v).slice(0, 200));
  }
  const callTp = p.get("callTp") === "D" ? "D" : "L";
  p.set("callTp", callTp);
  p.set("returnType", "XML");
  if (callTp === "L") {
    if (!p.get("startPage")) p.set("startPage", "1");
    if (!p.get("display")) p.set("display", "30");
  }
  p.set("authKey", key);

  let upstream;
  try {
    upstream = await fetch((callTp === "D" ? DTL : LIST) + "?" + p.toString(), {
      headers: { accept: "application/xml, text/xml, */*" } });
  } catch {
    return new Response("고용24에 연결하지 못했습니다.", {
      status: 502, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.ok ? 200 : 502,
    headers: { "content-type": "text/xml; charset=utf-8", "cache-control": "no-store" } });
};

export const config = { path: "/api/work24" };
