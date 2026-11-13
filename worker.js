const ORIGIN = "https://majeedomran.github.io";
const OWNER = "Majeedomran";
const REPO = "majeedomran.github.io";
const PATH = "catalog.json";
const COOKIE = "majeed_admin_session";
const SESSION_SECONDS = 12 * 60 * 60;

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extra }
  });
}
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Vary": "Origin"
  };
}
function b64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  s += "=".repeat((4 - s.length % 4) % 4);
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}
async function makeSession(secret) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp: Math.floor(Date.now()/1000) + SESSION_SECONDS })));
  const data = "v1." + payload;
  return data + "." + await sign(data, secret);
}
async function validSession(request, secret) {
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1);
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expected = await sign(parts[0] + "." + parts[1], secret);
  if (expected !== parts[2]) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(parts[1])));
    return payload.exp > Math.floor(Date.now()/1000);
  } catch { return false; }
}
function cookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
async function githubRequest(env, method, body) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const headers = {
    "Authorization": `Bearer ${env.GH_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "MAJEED-PS4-HOST-Admin"
  };
  const response = await fetch(url, { method, headers: { ...headers, ...(body ? {"Content-Type":"application/json"} : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub API error ${response.status}`);
  return data;
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin && origin !== ORIGIN) return json({ error: "Origin not allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    const url = new URL(request.url);
    const headers = corsHeaders();
    if (!env.ADMIN_PASSWORD || !env.GH_TOKEN || !env.SESSION_SECRET) return json({ error: "Worker secrets are not configured" }, 500, headers);

    if (url.pathname === "/login" && request.method === "POST") {
      if (origin !== ORIGIN) return json({ error: "Invalid origin" }, 403, headers);
      const body = await request.json().catch(() => ({}));
      if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) return json({ error: "كلمة المرور غير صحيحة" }, 401, headers);
      const token = await makeSession(env.SESSION_SECRET);
      return json({ ok: true }, 200, { ...headers, "Set-Cookie": cookie(token, SESSION_SECONDS) });
    }
    if (url.pathname === "/logout" && request.method === "POST") {
      return json({ ok: true }, 200, { ...headers, "Set-Cookie": cookie("", 0) });
    }
    if (url.pathname === "/admin/catalog" && (request.method === "GET" || request.method === "PUT")) {
      if (!await validSession(request, env.SESSION_SECRET)) return json({ error: "يلزم تسجيل الدخول مجدداً" }, 401, headers);
      try {
        if (request.method === "GET") {
          const data = await githubRequest(env, "GET");
          const raw = Uint8Array.from(atob(data.content.replace(/\n/g, "")), c => c.charCodeAt(0));
          return new Response(new TextDecoder().decode(raw), { headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
        }
        if (origin !== ORIGIN) return json({ error: "Invalid origin" }, 403, headers);
        const catalog = await request.json();
        if (!catalog || !Array.isArray(catalog.firmware) || !Array.isArray(catalog.payloads) || !Array.isArray(catalog.apps)) {
          return json({ error: "صيغة الكتالوج غير صحيحة" }, 400, headers);
        }
        const current = await githubRequest(env, "GET");
        const content = JSON.stringify(catalog, null, 2);
        const bytes = new TextEncoder().encode(content);
        let binary = "";
        for (const b of bytes) binary += String.fromCharCode(b);
        const updated = await githubRequest(env, "PUT", {
          message: "Update PS4 catalogue from admin panel",
          sha: current.sha,
          content: btoa(binary)
        });
        return json({ ok: true, commit: updated.commit?.sha || "" }, 200, headers);
      } catch (error) {
        return json({ error: error.message || "حدث خطأ غير متوقع" }, 500, headers);
      }
    }
    return json({ error: "Not found" }, 404, headers);
  }
};
