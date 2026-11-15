const API_BASE = "https://majeed-ps4-admin-api.majeedomran.workers.dev";
const $ = id => document.getElementById(id);
let sessionToken = "";
let catalog = null;
let selectedIndex = -1;
let dirty = false;
const status = (id, message) => { $(id).textContent = message; };
async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (sessionToken) headers.Authorization = "Bearer " + sessionToken;
  const response = await fetch(API_BASE + path, { ...options, headers, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
function showEditor(show) {
  $("loginPanel").classList.toggle("hidden", show);
  $("editorPanel").classList.toggle("hidden", !show);
}
function typeKey() { return $("recordType").value; }
function listForType() { return catalog?.[typeKey()] || []; }
function field(id) { return $(id).value.trim(); }
function setField(id, value) { $(id).value = value ?? ""; }
function markDirty(message = "Draft changed. Save and publish when ready.") { dirty = true; status("editorStatus", message); }
function toggleFirmwareFields(isFirmware) {
  ["nameWrap","nameEnWrap","categoryWrap","descriptionWrap","descriptionEnWrap","firmwareEnWrap","sourceWrap","downloadWrap"].forEach(id => $(id).classList.toggle("hidden", isFirmware));
  ["noteWrap","noteEnWrap"].forEach(id => $(id).classList.toggle("hidden", !isFirmware));
  $("entryFirmware").parentElement.classList.toggle("hidden", isFirmware);
}
function fillSelect() {
  const select = $("recordSelect");
  select.innerHTML = "";
  listForType().forEach((item, i) => {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = typeKey() === "firmware" ? item.version : (item.name_en || item.name || "Unnamed") + " — " + (item.version || "No version");
    select.appendChild(option);
  });
  if (!listForType().length) {
    const option = document.createElement("option");
    option.value = "-1"; option.textContent = "No entries yet"; select.appendChild(option);
  }
  select.disabled = !listForType().length;
  $("deleteBtn").disabled = !listForType().length;
}
function loadEntry(index) {
  selectedIndex = Number(index);
  const item = listForType()[selectedIndex];
  const isFirmware = typeKey() === "firmware";
  toggleFirmwareFields(isFirmware);
  if (!item) {
    ["entryName","entryNameEn","entryVersion","entryFirmware","entryNote","entryNoteEn","entryDescription","entryDescriptionEn","entryFirmwareEn","entrySource","entryDownload"].forEach(id => setField(id,""));
    $("entryStatus").value = "unverified";
    $("entryCategory").value = "Essentials";
    $("applyEntryBtn").textContent = "Add entry to draft";
    return;
  }
  setField("entryName",item.name); setField("entryNameEn",item.name_en);
  setField("entryVersion",item.version); setField("entryFirmware",item.firmware);
  setField("entryNote",item.note); setField("entryNoteEn",item.note_en);
  setField("entryDescription",item.description); setField("entryDescriptionEn",item.description_en);
  setField("entryFirmwareEn",item.firmware_en); setField("entrySource",item.sourceUrl); setField("entryDownload",item.downloadUrl);
  $("entryStatus").value = item.status || "unverified";
  $("entryCategory").value = item.category || "Essentials";
  $("applyEntryBtn").textContent = "Update entry in draft";
}
function refreshList(index = selectedIndex) {
  fillSelect();
  if (index >= 0 && index < listForType().length) {
    $("recordSelect").value = String(index); loadEntry(index);
  } else loadEntry(-1);
}
async function loadCatalog() {
  status("editorStatus","Loading catalogue from GitHub...");
  const data = await api("/admin/catalog");
  if (!Array.isArray(data.apps) || !Array.isArray(data.payloads) || !Array.isArray(data.firmware)) throw new Error("Catalogue structure is invalid.");
  catalog = data; dirty = false;
  $("catalogEditor").value = JSON.stringify(catalog,null,2);
  refreshList(0);
  status("editorStatus","Catalogue loaded. Select a section and entry to edit.");
}
function validHttps(value, label, optional = false) {
  if (!value && optional) return true;
  try { const ok = new URL(value).protocol === "https:"; if(!ok) status("editorStatus",label+" must use HTTPS."); return ok; } catch { status("editorStatus",label+" must be a valid HTTPS URL."); return false; }
}
$("loginBtn").addEventListener("click",async()=>{
  status("loginStatus","Signing in...");
  try {
    const result=await api("/login",{method:"POST",body:JSON.stringify({password:$("password").value})});
    sessionToken=result.token; $("password").value=""; showEditor(true); await loadCatalog();
  } catch(e) { status("loginStatus",e.message); }
});
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click();});
$("recordType").addEventListener("change",()=>refreshList(0));
$("recordSelect").addEventListener("change",()=>loadEntry($("recordSelect").value));
$("newBtn").addEventListener("click",()=>{ $("recordSelect").value="-1"; loadEntry(-1); });
$("entryForm").addEventListener("submit",e=>{
  e.preventDefault(); if(!catalog)return;
  const isFirmware=typeKey()==="firmware";
  const item=isFirmware
    ? {version:field("entryVersion"),status:$("entryStatus").value,note:field("entryNote"),note_en:field("entryNoteEn")}
    : {name:field("entryName"),name_en:field("entryNameEn"),version:field("entryVersion"),status:$("entryStatus").value,category:$("entryCategory").value,description:field("entryDescription"),description_en:field("entryDescriptionEn"),firmware:field("entryFirmware"),firmware_en:field("entryFirmwareEn"),sourceUrl:field("entrySource"),downloadUrl:field("entryDownload")};
  if(isFirmware&&!item.version){status("editorStatus","Firmware version is required.");return;}
  if(!isFirmware&&!item.name){status("editorStatus","Entry name is required.");return;}
  if(!isFirmware&&!item.sourceUrl){status("editorStatus","An original source URL is required.");return;}\n  if(!isFirmware&&!validHttps(item.sourceUrl,"Source URL"))return;
  if(!isFirmware&&item.downloadUrl&&!validHttps(item.downloadUrl,"Download URL"))return;
  const arr=listForType();
  if(selectedIndex>=0&&selectedIndex<arr.length) arr[selectedIndex]=item;
  else {arr.push(item);selectedIndex=arr.length-1;}
  $("catalogEditor").value=JSON.stringify(catalog,null,2);
  refreshList(selectedIndex); markDirty("Entry updated in the local draft. Click Save and publish catalogue to commit it.");
});
$("deleteBtn").addEventListener("click",()=>{
  const arr=listForType(); if(selectedIndex<0||selectedIndex>=arr.length)return;
  const label=typeKey()==="firmware"?arr[selectedIndex].version:arr[selectedIndex].name;
  if(!confirm("Delete "+label+" from the draft?"))return;
  arr.splice(selectedIndex,1); selectedIndex=Math.min(selectedIndex,arr.length-1);
  $("catalogEditor").value=JSON.stringify(catalog,null,2);refreshList(selectedIndex);markDirty("Entry removed from the draft. Save and publish to commit the change.");
});
$("saveBtn").addEventListener("click",async()=>{
  if(!catalog)return;
  if(!confirm("Publish the current catalogue draft to the public GitHub Pages site?"))return;
  status("editorStatus","Saving catalogue to GitHub...");
  try { await api("/admin/catalog",{method:"PUT",body:JSON.stringify(catalog)});dirty=false;status("editorStatus","Published to GitHub. GitHub Pages may take a minute or two to update."); }
  catch(e){status("editorStatus",e.message);}
});
$("loadBtn").addEventListener("click",async()=>{
  if(dirty&&!confirm("Discard the current unsaved draft and reload from GitHub?"))return;
  try{await loadCatalog();}catch(e){status("editorStatus",e.message);}
});
$("toggleJsonBtn").addEventListener("click",()=>{$("jsonWrap").classList.toggle("hidden");$("toggleJsonBtn").textContent=$("jsonWrap").classList.contains("hidden")?"Advanced JSON editor":"Hide JSON editor";});
$("applyJsonBtn").addEventListener("click",()=>{
  try{
    const data=JSON.parse($("catalogEditor").value);
    if(!data||!Array.isArray(data.apps)||!Array.isArray(data.payloads)||!Array.isArray(data.firmware))throw new Error("JSON must contain apps, payloads and firmware arrays.");
    catalog=data;dirty=true;refreshList(0);status("editorStatus","JSON applied to the draft. Review it, then save and publish.");
  }catch(e){status("editorStatus","JSON error: "+e.message);}
});
$("logoutBtn").addEventListener("click",()=>{
  if(dirty&&!confirm("You have unsaved changes. Sign out and discard them?"))return;
  sessionToken="";catalog=null;dirty=false;showEditor(false);status("loginStatus","Signed out.");
});
