const ORIGIN = "https://majeedomran.github.io";
const OWNER = "Majeedomran";
const REPO = "majeedomran.github.io";
const PATH = "catalog.json";
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
async function validSessionToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expected = await sign(parts[0] + "." + parts[1], secret);
  if (expected !== parts[2]) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(parts[1])));
    return payload.exp > Math.floor(Date.now()/1000);
  } catch { return false; }
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
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "MAJEED PS4 HOST checker" }, 200, headers);
    }
    if (!env.ADMIN_PASSWORD || !env.GH_TOKEN || !env.SESSION_SECRET) return json({ error: "Worker secrets are not configured" }, 500, headers);
    if (url.pathname === "/login" && request.method === "POST") {
      if (origin !== ORIGIN) return json({ error: "Invalid origin" }, 403, headers);
      const body = await request.json().catch(() => ({}));
      if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) return json({ error: "كلمة المرور غير صحيحة" }, 401, headers);
      const token = await makeSession(env.SESSION_SECRET);
      return json({ ok: true, token }, 200, headers);
    }

    if (url.pathname === "/link-check" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const allowed = new Set(["github.com","www.github.com","ta3reb.com","www.ta3reb.com","muarrab.com","www.muarrab.com","prx0.com","orbispatches.com","www.orbispatches.com","consolemods.org","www.consolemods.org","store.brewology.com"]);
      const urls = Array.isArray(body.urls) ? body.urls.slice(0, 30) : [];
      const results = await Promise.all(urls.map(async value => {
        try {
          const parsed = new URL(value);
          if (parsed.protocol !== "https:" || !allowed.has(parsed.hostname)) return { url: value, ok: false, status: "blocked" };
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 7000);
          try {
            let response = await fetch(parsed.toString(), { method: "HEAD", redirect: "manual", signal: controller.signal });
            if (response.status === 405 || response.status === 403) response = await fetch(parsed.toString(), { method: "GET", headers: { "Range": "bytes=0-0" }, redirect: "manual", signal: controller.signal });
            const location = response.headers.get("Location");
            if (location) {
              const redirected = new URL(location, parsed);
              if (redirected.protocol !== "https:" || !allowed.has(redirected.hostname)) return { url: value, ok: false, status: "external redirect blocked" };
            }
            return { url: value, ok: response.status >= 200 && response.status < 400, status: response.status };
          } finally { clearTimeout(timer); }
        } catch (error) { return { url: value, ok: false, status: error.name === "AbortError" ? "timeout" : "error" }; }
      }));
      return json({ results }, 200, headers);
    }
    if (url.pathname === "/logout" && request.method === "POST") {
      return json({ ok: true }, 200, headers);
    }
    if (url.pathname === "/admin/catalog" && (request.method === "GET" || request.method === "PUT")) {
      const auth = request.headers.get("Authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (!token || !await validSessionToken(token, env.SESSION_SECRET)) return json({ error: "يلزم تسجيل الدخول مجدداً" }, 401, headers);
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
