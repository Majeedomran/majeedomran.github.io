// Public catalogue renderer with Arabic/English interface switching.
const $ = s => document.querySelector(s);
let currentLang = localStorage.getItem("majeedLang") === "en" ? "en" : "ar";
const words = {
 ar: {
  navFirmware:"الفيرموير",navPayloads:"Payloads",navApps:"التطبيقات",navAbout:"حول الموقع",
  heroTitle:'كل أدوات PS4<br><em>بمكان واحد.</em>',heroDesc:"كتالوج منظم للتطبيقات والـPayloads والأدوات والتعديلات ومكتبات التطوير ومراجع التعريب، مع روابط المصادر الأصلية.",
  explore:'استكشف الملفات <span>←</span>',checkVersion:"تحقق من إصدارك",trust1:"● مصادر رسمية",trust2:"● معلومات توافق واضحة",trust3:"● تحديثات موثقة",
  fwTitle:"ما إصدار نظام جهازك؟",fwDesc:"اختر الإصدار يدوياً لعرض حالة المعلومات المسجلة في الكتالوج.",fwLabel:"إصدار النظام",chooseVersion:"اختر إصداراً",fwEmpty:"لم يتم اختيار إصدار بعد.",
  payloadDesc:"ملفات ومشاريع من مصادرها الأصلية.",showAll:"عرض الكل ←",payloadSearch:"ابحث عن Payload...",allStatuses:"كل الحالات",verified:"موثق",unverified:"غير موثق",
  appsTitle:"تطبيقات PS4",appsDesc:"كل فئة في قسم مستقل، مع تقديم الأدوات الأساسية للتعديل والمحاكيات أولاً.",appSearch:"ابحث عن تطبيق...",allCategories:"كل التصنيفات",
  catEssentials:"البرامج الأساسية للتعديل",catMedia:"وسائط",catUtilities:"أدوات مساعدة",catHomebrew:"هومبرو",catEmulators:"محاكيات على PS4",catDesktop:"محاكيات PS4 على الكمبيوتر",catMods:"تعديلات وغش",catTranslations:"التعريبات والألعاب العربية",catDevelopment:"التطوير",
  noticeTitle:"معلومات مهمة قبل التحميل",noticeDesc:"حالة التوافق تختلف حسب إصدار النظام والمشروع. لا يعني ظهور إصدار في القائمة أنه قابل لكسر الحماية. لا توجد روابط تحميل تجريبية في هذه النسخة؛ أضف روابط المصدر الرسمي بعد التحقق منها.",
  footerNote:"مشروع مجتمعي مستقل، غير تابع لشركة Sony.",
  experimental:"تجريبي",unsupported:"غير مدعوم",unknown:"غير موثق",noDesc:"لا يوجد وصف مضاف.",noSource:"لم تتم إضافة مصدر رسمي بعد",source:"صفحة المصدر الرسمي ↗",download:"تحميل مباشر ↗",
  version:"الإصدار:",compatibility:"التوافق:",notSelected:"لم يتم اختيار إصدار بعد.",noFirmwareNote:"لا توجد ملاحظات إضافية.",
  noItems:"لا توجد عناصر مطابقة حالياً. ستظهر الملفات بعد إضافة بياناتها والتحقق من مصادرها.",loadError:"تعذر تحميل بيانات الكتالوج حالياً."
 },
 en: {
  navFirmware:"Firmware",navPayloads:"Payloads",navApps:"Apps",navAbout:"About",
  heroTitle:'All PS4 tools<br><em>in one place.</em>',heroDesc:"An organized catalogue of apps, payloads, tools, mods, development libraries and Arabic translation directories, with links to original sources.",
  explore:'Explore files <span>→</span>',checkVersion:"Check your firmware",trust1:"● Original sources",trust2:"● Clear compatibility details",trust3:"● Documented updates",
  fwTitle:"Which system software version do you use?",fwDesc:"Select your version to view the information recorded in the catalogue.",fwLabel:"System version",chooseVersion:"Choose a version",fwEmpty:"No version selected yet.",
  payloadDesc:"Files and projects linked to their original sources.",showAll:"View all →",payloadSearch:"Search payloads...",allStatuses:"All statuses",verified:"Verified",unverified:"Unverified",
  appsTitle:"PS4 Applications",appsDesc:"Separate sections for each category, with essential modding tools and emulators shown first.",appSearch:"Search applications...",allCategories:"All categories",
  catEssentials:"Essential Modding Tools",catMedia:"Media",catUtilities:"Utilities",catHomebrew:"Homebrew",catEmulators:"PS4 Emulators",catDesktop:"PS4 Emulators for PC",catMods:"Mods & Cheats",catTranslations:"Translations & Arabic Games",catDevelopment:"Development",
  noticeTitle:"Important information before downloading",noticeDesc:"Compatibility varies by system software version and project. A version appearing in this list does not mean it is jailbreakable. This catalogue does not include unverified direct download links; use the official source after checking it.",
  footerNote:"Independent community project. Not affiliated with Sony.",
  experimental:"Experimental",unsupported:"Unsupported",unknown:"Unverified",noDesc:"No description provided.",noSource:"No official source has been added",source:"Official source page ↗",download:"Direct download ↗",
  version:"Version:",compatibility:"Compatibility:",notSelected:"No version selected yet.",noFirmwareNote:"No additional notes.",
  noItems:"No matching items found. Entries will appear after their details and sources are added and checked.",loadError:"The catalogue data could not be loaded."
 }
};
const t = key => words[currentLang][key] || words.ar[key] || key;

const itemEnglish = {
 "GoldHEN": {
  description:"A community homebrew enabler with Debug Settings, FTP, BinLoader, plugin support and a cheats menu. BinLoader and cheat-menu features are described as experimental; check device compatibility before use.",
  firmware:"Check the official release page for each firmware version."
 },
 "PS4 HEN (Scene-Collective)": {
  description:"An open-source HEN project. This is a pre-release build; review release notes and compatibility before running it.",
  firmware:"Not specified; consult the source."
 },
 "ps4debug": {
  description:"A PS4 debugging payload with support for trainer and modification tools. The release notes mention support up to 12.02; do not assume compatibility with newer versions.",
  firmware:"Up to 12.02 according to the release notes."
 },
 "PS4 FTP Server": {
  description:"An enhanced FTP server for transferring files between PS4 and a computer. Version 1.09 is marked as pre-release and the developer reports support up to 13.02.",
  firmware:"Up to 13.02 according to the developer."
 },
 "App2USB": {
  description:"A payload for moving and running supported applications from external storage; requires a suitable build of the SDK.",
  firmware:"Depends on the Scene Collective Payload SDK build."
 },
 "Payload Guest": {
  description:"An application for managing and loading payload files from internal storage or USB and sending them to BinLoader.",
  firmware:"Not specified."
 },
 "Apollo Save Tool": {
  description:"Manage, edit, back up and restore save files, manage trophies, and use patch/cheat tools. Version 2.4.0 is officially published; support for each feature depends on the system and game.",
  firmware:"Version 2.0+ states support for all system software versions; some features may require GoldHEN/ps4debug."
 },
 "Itemzflow": {
  description:"A game-library manager, launcher and content-management tool. The release notes mention FUSE support for selected versions up to 13.02; check the notes before use.",
  firmware:"FUSE support is documented for selected versions up to 13.02; this is not a blanket compatibility claim."
 },
 "ezRemote Client": {
  description:"A file and connection manager for FTP/SFTP/SMB/NFS/WebDAV and Google Drive, with remote PKG downloading and installation. Stores may list newer builds than the GitHub Releases page; check the source.",
  firmware:"Check the requirements for the selected release."
 },
 "PS4-Xplorer": {
  description:"A PS4 file manager with FTP, file browsing and management tools. The source GitHub page currently has no Releases section.",
  firmware:"Not specified."
 },
 "PS4 Homebrew Store": {
  description:"A store/interface for browsing and installing homebrew applications. Verify the package source and update method before installation.",
  firmware:"Not specified."
 },
 "PS4 Player": {
  description:"A media player for PS4 built with Unity; see the project source page.",
  firmware:"Not specified."
 },
 "Orbis Toolbox": {
  description:"A collection of tools and interface modifications for PS4. The repository has been archived since 2023; this is a legacy project and compatibility with modern system versions is not guaranteed.",
  firmware:"The repository lists 5.05, 6.72, 7.02, 7.55 and 9.00."
 },
 "OpenOrbis PS4 Toolchain": {
  description:"An open-source PS4 application development toolchain, including headers, library stubs, build tools and examples.",
  firmware:"For developers; requirements vary by project."
 },
 "LibOrbisPkg": {
  description:"A library and GUI/CLI tools for creating, inspecting and modifying PS4 PKG, SFO, PFS and related file formats.",
  firmware:"Desktop development tool."
 },
 "PS4 PKG Manager": {
  description:"A desktop program for managing collections of PS4 PKG files.",
  firmware:"Desktop application."
 },
 "PS4 FTP Server (Linux/PC companion)": {
  description:"An FTP server project that includes the PS4 build and companion tools/source for file transfer and testing.",
  firmware:"Payload support up to 13.02 according to the developer."
 },
 "PS4 Patch Installer": {
  description:"A tool for installing game updates from the ORBIS Patches database. Check disc-update limitations and system requirements before use.",
  firmware:"Varies by game update."
 },
 "PS4 Native Ports / Emulators / Apps Directory": {
  description:"A community index of game-port, emulator and application projects. It is not a translation library; review each project's source and licence.",
  firmware:"Depends on the project."
 },
 "Dolphin for PS4": {
  description:"A Nintendo GameCube and Wii emulator for PS4. The latest release shown on its Releases page is 04.19; performance and compatibility vary by game.",
  firmware:"Check the release page and runtime requirements."
 },
 "GoldHEN Cheats Manager": {
  description:"A homebrew application for managing cheat files compatible with GoldHEN. A listed cheat file is not guaranteed to work with every game update.",
  firmware:"Requires a compatible GoldHEN environment."
 },
 "GoldHEN Cheat Repository": {
  description:"A database of cheat files in JSON, SHN and MC4 formats. Cheats are experimental and may not match every game version; keep a backup.",
  firmware:"Depends on GoldHEN and the game version."
 },
 "PS4 Store": {
  description:"An online-updating homebrew store. The developer directs users to download the application package from PKG-Zone only; the GitHub repository contains project files and server components.",
  firmware:"Not specified."
 },
 "Ta3reb – مكتبة تعريبات PS4": {
  name:"Ta3reb – PS4 Arabic Translation Library",
  description:"A community index of Arabic translations with pages showing the game CUSA ID, game version and translation type. Manually verify the source, game version and compatibility before applying any file; this is not an official Sony repository.",
  firmware:"Depends on the game and its update version."
 },
 "Muarrab – دليل الألعاب العربية": {
  name:"Muarrab – Arabic Games Directory",
  description:"A directory for finding PS4 games available in Arabic, distinguishing official localization from community projects. Use it as an information index; do not assume every result is an installable PS4 file.",
  firmware:"Depends on the game."
 }
};
const firmwareNoteEnglish = "This system version is listed in the catalogue; jailbreak compatibility has not been documented for this version.";

const statusLabel = s => s==="verified"?t("verified"):s==="experimental"?t("experimental"):s==="unsupported"?t("unsupported"):t("unknown");
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function applyLanguage(){
 document.documentElement.lang=currentLang;
 document.documentElement.dir=currentLang==="ar"?"rtl":"ltr";
 document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(words[currentLang][key])el.innerHTML=words[currentLang][key];});
 document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
 document.querySelectorAll("[data-i18n-aria]").forEach(el=>el.setAttribute("aria-label",t(el.dataset.i18nAria)));
 $("#langBtn").textContent=currentLang==="ar"?"EN":"AR";
 $("#langBtn").setAttribute("aria-label",currentLang==="ar"?"Switch to English":"التبديل إلى العربية");
}
function card(item,type){
 const el=document.createElement("article");el.className="item-card";
 const translated=currentLang==="en"?(itemEnglish[item.name]||{}):{};
 const displayName=(currentLang==="en"?(item.name_en||translated.name):item.name)||item.name;
 const displayDescription=(currentLang==="en"?(item.description_en||translated.description):item.description)||t("noDesc");
 const displayFirmware=(currentLang==="en"?(item.firmware_en||translated.firmware):item.firmware)||"—";
 const source=item.sourceUrl&&/^https:\/\//i.test(item.sourceUrl)?`<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t("source")}</a>`:`<span class="meta">${t("noSource")}</span>`;
 const download=item.downloadUrl&&/^https:\/\//i.test(item.downloadUrl)?`<a href="${escapeHtml(item.downloadUrl)}" target="_blank" rel="noopener noreferrer">${t("download")}</a>`:"";
 el.innerHTML=`<div class="item-top"><span class="item-icon">${type==="payload"?"P":"A"}</span><span class="status ${item.status==="verified"?"verified":""}">${statusLabel(item.status||"unverified")}</span></div><h3>${escapeHtml(displayName)}</h3><p>${escapeHtml(displayDescription||t("noDesc"))}</p><div class="meta">${t("version")} ${escapeHtml(item.version||"—")} · ${t("compatibility")} ${escapeHtml(displayFirmware||"—")}</div>${source}${download}`;
 return el;
}
function render(list,target,type,query="",filter="all",category="all"){
 target.innerHTML="";
 const q=query.trim().toLowerCase();
 const items=list.filter(x=>(!q||((x.name||"")+" "+(x.name_en||"")+" "+(x.description||"")+" "+(x.description_en||"")).toLowerCase().includes(q))&&(filter==="all"||x.status===(filter==="verified"?"verified":"unverified"))&&(category==="all"||x.category===category));
 if(!items.length){target.innerHTML=`<div class="empty">${t("noItems")}</div>`;return;}
 items.forEach(x=>target.appendChild(card(x,type)));
}
const categoryOrder=["Essentials","Utilities","Homebrew","Emulators","Desktop","Media","Mods","Development","Translations"];
const categoryLabels={Essentials:["البرامج الأساسية","Essential tools"],Utilities:["أدوات مساعدة","Utilities"],Homebrew:["هومبرو","Homebrew"],Emulators:["محاكيات PS4","PS4 emulators"],Desktop:["محاكيات الكمبيوتر","PC emulators"],Media:["الوسائط","Media"],Mods:["التعديلات والغش","Mods & cheats"],Development:["التطوير","Development"],Translations:["التعريبات","Translations"]};
let activeView="apps";
function showView(view){activeView=view;document.querySelectorAll(".view-panel").forEach(el=>el.classList.toggle("is-hidden",el.id!==view));document.querySelectorAll(".library-menu button").forEach(b=>b.classList.toggle("active",b.dataset.view===view||(view==="apps"&&b.dataset.category===$("#appCategory").value)));}
function buildMenu(draw){const host=$("#libraryMenu");host.innerHTML="";const add=(label,view,category=null)=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.view=view;if(category)b.dataset.category=category;b.addEventListener("click",()=>{if(category){$("#appCategory").value=category;showView("apps");draw();}else showView(view);});host.appendChild(b);};categoryOrder.forEach(cat=>add(categoryLabels[cat][currentLang==="en"?1:0],"apps",cat));add(currentLang==="en"?"Payloads":"البايلودات","payloads");add(currentLang==="en"?"Firmware":"إصدارات النظام","firmware");}
async function init(){
 try{
  const response=await fetch("catalog.json?v="+Date.now(),{cache:"no-store"});
  if(!response.ok)throw new Error("Catalogue load failed");
  const catalog=await response.json();
  catalog.firmware.forEach(x=>{const o=document.createElement("option");o.value=x.version;o.textContent=x.version;$("#fwSelect").appendChild(o);});
  $("#fwSelect").addEventListener("change",e=>{const f=catalog.firmware.find(x=>x.version===e.target.value);$("#fwResult").textContent=f?`${statusLabel(f.status)} — ${(currentLang==="en"?(f.note_en||firmwareNoteEnglish):f.note)||t("noFirmwareNote")}`:t("notSelected");});
  function draw(){
   render(catalog.payloads||[],$("#payloadCards"),"payload",$("#payloadSearch").value,$("#payloadFilter").value);
   const selected=$("#appCategory").value;
   const matches=(catalog.apps||[]).filter(x=>x.category===selected);
   const host=$("#appGroups");host.innerHTML="";
   const cards=document.createElement("div");cards.className="cards";host.appendChild(cards);
   render(matches,cards,"app",$("#appSearch").value,"all",selected);
   document.querySelectorAll(".library-menu button").forEach(b=>b.classList.toggle("active",b.dataset.category===selected&&activeView==="apps"));
  }
  ["payloadSearch","payloadFilter","appSearch"].forEach(id=>$("#"+id).addEventListener("input",draw));
  $("#langBtn").addEventListener("click",()=>{currentLang=currentLang==="ar"?"en":"ar";localStorage.setItem("majeedLang",currentLang);applyLanguage();buildMenu(draw);draw();const fw=$("#fwSelect").value;if(fw){const f=catalog.firmware.find(x=>x.version===fw);$("#fwResult").textContent=f?`${statusLabel(f.status)} — ${(currentLang==="en"?(f.note_en||f.note):f.note)||t("noFirmwareNote")}`:t("notSelected");}else $("#fwResult").textContent=t("fwEmpty");});
  $("#year").textContent=new Date().getFullYear();
  $("#appCategory").value="Essentials";buildMenu(draw);showView("apps");applyLanguage();draw();
 }catch(error){console.error(error);$("#payloadCards").innerHTML=`<div class="empty">${t("loadError")}</div>`;}
}
init();
