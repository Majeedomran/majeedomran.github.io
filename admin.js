// ضع رابط Cloudflare Worker بعد نشره، مثال: https://majeed-admin.example.workers.dev
const API_BASE = "https://majeed-ps4-admin-api.majeedomran.workers.dev";
const $ = id => document.getElementById(id);
let sessionToken = "";
async function api(path, options = {}) {
  if (API_BASE.includes("YOUR-WORKER-NAME")) throw new Error("يجب ضبط رابط Cloudflare Worker أولاً داخل admin.js");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (sessionToken) headers.Authorization = "Bearer " + sessionToken;
  const response = await fetch(API_BASE + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالخادم");
  return data;
}
function status(id, message) { $(id).textContent = message; }
function showEditor(show) { $("loginPanel").classList.toggle("hidden", show); $("editorPanel").classList.toggle("hidden", !show); }
async function loadCatalog() {
  status("editorStatus", "جارٍ تحميل البيانات...");
  try {
    const data = await api("/admin/catalog");
    $("catalogEditor").value = JSON.stringify(data, null, 2);
    status("editorStatus", "تم تحميل الكتالوج.");
  } catch (e) { status("editorStatus", e.message); }
}
$("loginBtn").addEventListener("click", async () => {
  status("loginStatus", "جارٍ تسجيل الدخول...");
  try {
    const login = await api("/login", { method: "POST", body: JSON.stringify({ password: $("password").value }) });
    sessionToken = login.token;
    $("password").value = "";
    showEditor(true);
    await loadCatalog();
  } catch (e) { status("loginStatus", e.message); }
});
$("password").addEventListener("keydown", e => { if (e.key === "Enter") $("loginBtn").click(); });
$("loadBtn").addEventListener("click", loadCatalog);
$("saveBtn").addEventListener("click", async () => {
  let data;
  try { data = JSON.parse($("catalogEditor").value); }
  catch { status("editorStatus", "خطأ في JSON: راجع الأقواس والفواصل وعلامات الاقتباس."); return; }
  if (!data || !Array.isArray(data.firmware) || !Array.isArray(data.payloads) || !Array.isArray(data.apps)) {
    status("editorStatus", "يجب أن يحتوي الملف على firmware و payloads و apps كمصفوفات."); return;
  }
  if (!confirm("سيتم حفظ التعديلات مباشرة في الموقع. هل تريد المتابعة؟")) return;
  status("editorStatus", "جارٍ الحفظ في GitHub...");
  try {
    await api("/admin/catalog", { method: "PUT", body: JSON.stringify(data) });
    status("editorStatus", "تم الحفظ في GitHub. قد يستغرق ظهور التغييرات على الموقع دقيقة أو دقيقتين.");
  } catch (e) { status("editorStatus", e.message); }
});
$("logoutBtn").addEventListener("click", async () => {
  sessionToken = "";
  showEditor(false);
  status("loginStatus", "تم تسجيل الخروج.");
});
