// Public catalogue renderer with Arabic/English interface switching.
const $ = s => document.querySelector(s);
const savedLang = localStorage.getItem("majeedLang");
let currentLang = savedLang === "ar" ? "ar" : "en";
const words = {
 ar: {
  navFirmware:"الفيرموير",navPayloads:"Payloads",navApps:"التطبيقات",navAbout:"حول الموقع",navHome:"الرئيسية",startJailbreak:"ابدأ دليل الجيلبريك <span>←</span>",quickStartEyebrow:"بداية جيلبريك PS4",quickStartTitle:"ابدأ من إصدار جهازك",quickStartDesc:"اختر إصدار النظام المثبت فعلياً على جهازك.",fullFirmwareDetails:"تفاصيل الإصدار كاملة",goldhenLinkDesc:"الإصدارات والملاحظات الرسمية ↗",exploitChart:"مرجع ثغرات الجيلبريك",exploitChartDesc:"راجع طرق الدخول وملاحظات الإصدارات ↗",launchHost:"افتح مستضيف الجيلبريك <span>←</span>",quickWarning:"مستضيف الجيلبريك يعمل من متصفح PS4 للإصدارات المدعومة من 4.50–5.07 و6.70–14.02. عند أول زيارة والإنترنت متصل، اترك كاش إصدار جهازك يكتمل؛ يمكن استخدام الملفات المحفوظة لاحقاً دون إنترنت ما دام المتصفح محتفظاً بها. قد يمسح النظام الكاش.",payloadShortcut:"Payloads",payloadShortcutDesc:"افتحها عند الحاجة فقط",libraryShortcut:"مكتبة الهومبرو",libraryShortcutDesc:"التطبيقات والأدوات والمحاكيات",homeFwEmpty:"اختر إصدار جهازك لعرض ملاحظات الجيلبريك المسجلة.",gettingStarted:"دليل البدء",gettingStartedDesc:"شرح الإعداد خطوة بخطوة ↗",
  heroTitle:'جيلبريك PS4<br><em>بخطوات واضحة.</em>',heroDesc:"اختر إصدار جهازك، راجع معلومات الجيلبريك الموثقة، ثم افتح الأدوات التي تحتاجها فقط.",
  explore:'استكشف الملفات <span>←</span>',checkVersion:"تحقق من إصدارك",trust1:"● مصادر رسمية",trust2:"● معلومات توافق واضحة",trust3:"● تحديثات موثقة",
  fwTitle:"ما إصدار نظام جهازك؟",fwDesc:"اختر الإصدار يدوياً لعرض حالة المعلومات المسجلة في الكتالوج.",fwLabel:"إصدار النظام",chooseVersion:"اختر إصداراً",fwEmpty:"لم يتم اختيار إصدار بعد.",
  payloadDesc:"ملفات ومشاريع من مصادرها الأصلية.",showAll:"عرض الكل ←",payloadSearch:"ابحث عن Payload...",allStatuses:"كل الحالات",verified:"موثق",unverified:"غير موثق",
  appsTitle:"تطبيقات PS4",appsDesc:"كل فئة في قسم مستقل، مع تقديم الأدوات الأساسية للتعديل والمحاكيات أولاً.",appSearch:"ابحث عن تطبيق...",allCategories:"كل التصنيفات",
  catEssentials:"البرامج الأساسية للتعديل",catMedia:"وسائط",catUtilities:"أدوات مساعدة",catHomebrew:"هومبرو",catEmulators:"محاكيات على PS4",catDesktop:"محاكيات PS4 على الكمبيوتر",catMods:"تعديلات وغش",catTranslations:"التعريبات والألعاب العربية",catDevelopment:"التطوير",
  noticeTitle:"معلومات مهمة قبل التحميل",noticeDesc:"حالة التوافق تختلف حسب إصدار النظام والمشروع. لا يعني ظهور إصدار في القائمة أنه قابل لكسر الحماية. لا توجد روابط تحميل تجريبية في هذه النسخة؛ أضف روابط المصدر الرسمي بعد التحقق منها.",
  footerNote:"مشروع مجتمعي مستقل، غير تابع لشركة Sony.",
  experimental:"تجريبي",unsupported:"غير مدعوم",unknown:"غير موثق",noDesc:"لا يوجد وصف مضاف.",noSource:"لم تتم إضافة مصدر رسمي بعد",source:"صفحة المصدر الرسمي ↗",download:"تحميل مباشر ↗",
  version:"الإصدار:",compatibility:"التوافق:",notSelected:"لم يتم اختيار إصدار بعد.",noFirmwareNote:"لا توجد ملاحظات إضافية.",
  assistantTitle:"مساعد MAJEED الذكي",assistantDesc:"اختر إصدار جهازك كسياق مساعد، واكتب ما تبحث عنه. راجع ملاحظات التوافق لكل عنصر.",assistantQueryLabel:"شو بدك تلاقي؟",assistantPlaceholder:"مثلاً: مدير ملفات، محاكي، تعريب...",assistantRun:"ابحث في الكتالوج",assistantDisclaimer:"المساعد يبحث في بيانات الموقع ولا يستخدم نموذج ذكاء اصطناعي خارجي. النتائج ومعلومات التوافق تحتاج مراجعة المصدر.",assistantEmpty:"اكتب كلمة أو اختر نوع الأداة لعرض النتائج.",updatesTitle:"آخر تحديثات الموقع",updatesDesc:"سجل تغييرات الموقع والميزات المضافة.",linkTitle:"فاحص الروابط",linkDesc:"افحص روابط المصادر المسجلة في الكتالوج عند الطلب.",linkDisclaimer:"الفحص يختبر استجابة صفحات المصدر فقط؛ لا يضمن سلامة الملفات أو توافقها. قد تمنع بعض المواقع الفحص الآلي.",checkLinks:"ابدأ فحص الروابط",checkingLinks:"جارٍ فحص الروابط...",statusTitle:"حالة الموقع والمصادر",statusDesc:"معلومات فورية عن تحميل الكتالوج وخدمات الموقع.",catalogStatus:"الكتالوج",workerStatus:"خدمة الفحص",catalogCount:"عناصر الكتالوج",lastCheck:"آخر تحديث لهذه الصفحة",refreshStatus:"تحديث الحالة",statusOnline:"يعمل",statusOffline:"غير متاح",statusUnknown:"غير مفحوص",linkOk:"يستجيب",linkBad:"تعذر التحقق",linkSummary:"نتيجة الفحص",noItems:"لا توجد عناصر مطابقة حالياً. ستظهر الملفات بعد إضافة بياناتها والتحقق من مصادرها.",loadError:"تعذر تحميل بيانات الكتالوج حالياً."
 },
 en: {
  navFirmware:"Firmware",navPayloads:"Payloads",navApps:"Apps",navAbout:"About",navHome:"Home",startJailbreak:"Start jailbreak guide <span>→</span>",quickStartEyebrow:"PS4 JAILBREAK QUICK START",quickStartTitle:"Start with your firmware",quickStartDesc:"Choose the exact system software version installed on your console.",fullFirmwareDetails:"Full firmware details",goldhenLinkDesc:"Official releases and notes ↗",exploitChart:"Exploit reference chart",exploitChartDesc:"Review entry points and firmware notes ↗",launchHost:"Launch Exploit Host <span>→</span>",quickWarning:"The Exploit Host runs in the PS4 browser on supported firmware 4.50–5.07 and 6.70–14.02. On the first visit while online, let the firmware-specific cache finish; saved files can be reused offline while the browser retains them. The system may clear the cache.",payloadShortcut:"Payloads",payloadShortcutDesc:"Open only when needed",libraryShortcut:"Homebrew library",libraryShortcutDesc:"Apps, tools and emulators",homeFwEmpty:"Choose your firmware to view the recorded jailbreak notes.",gettingStarted:"Getting started",gettingStartedDesc:"Step-by-step setup guide ↗",
  heroTitle:'PS4 Jailbreak<br><em>Quick Start.</em>',heroDesc:"Find your PS4 firmware, check the documented jailbreak notes, then open only the tools you need.",
  explore:'Explore files <span>→</span>',checkVersion:"Check your firmware",trust1:"● Original sources",trust2:"● Clear compatibility details",trust3:"● Documented updates",
  fwTitle:"Which system software version do you use?",fwDesc:"Select your version to view the information recorded in the catalogue.",fwLabel:"System version",chooseVersion:"Choose a version",fwEmpty:"No version selected yet.",
  payloadDesc:"Files and projects linked to their original sources.",showAll:"View all →",payloadSearch:"Search payloads...",allStatuses:"All statuses",verified:"Verified",unverified:"Unverified",
  appsTitle:"PS4 Applications",appsDesc:"Separate sections for each category, with essential modding tools and emulators shown first.",appSearch:"Search applications...",allCategories:"All categories",
  catEssentials:"Essential Modding Tools",catMedia:"Media",catUtilities:"Utilities",catHomebrew:"Homebrew",catEmulators:"PS4 Emulators",catDesktop:"PS4 Emulators for PC",catMods:"Mods & Cheats",catTranslations:"Translations & Arabic Games",catDevelopment:"Development",
  noticeTitle:"Important information before downloading",noticeDesc:"Compatibility varies by system software version and project. A version appearing in this list does not mean it is jailbreakable. This catalogue does not include unverified direct download links; use the official source after checking it.",
  footerNote:"Independent community project. Not affiliated with Sony.",
  experimental:"Experimental",unsupported:"Unsupported",unknown:"Unverified",noDesc:"No description provided.",noSource:"No official source has been added",source:"Official source page ↗",download:"Direct download ↗",
  version:"Version:",compatibility:"Compatibility:",notSelected:"No version selected yet.",noFirmwareNote:"No additional notes.",
  assistantTitle:"MAJEED Smart Assistant",assistantDesc:"Choose a firmware version as context, then search the catalogue. Review each item’s compatibility notes.",assistantQueryLabel:"What are you looking for?",assistantPlaceholder:"e.g. file manager, emulator, Arabic translation...",assistantRun:"Search catalogue",assistantDisclaimer:"This assistant searches the site's catalogue and does not use an external AI model. Review each source; compatibility information is not a guarantee.",assistantEmpty:"Enter a keyword to see matching entries.",updatesTitle:"Latest site updates",updatesDesc:"A record of site changes and added features.",linkTitle:"Link checker",linkDesc:"Check the source links listed in the catalogue on demand.",linkDisclaimer:"This checks source-page responses only; it does not verify file safety or compatibility. Some sites may block automated checks.",checkLinks:"Check source links",checkingLinks:"Checking links...",statusTitle:"Site and source status",statusDesc:"Live information about catalogue loading and site services.",catalogStatus:"Catalogue",workerStatus:"Checking service",catalogCount:"Catalogue entries",lastCheck:"Page last refreshed",refreshStatus:"Refresh status",statusOnline:"Online",statusOffline:"Unavailable",statusUnknown:"Not checked",linkOk:"Responding",linkBad:"Could not verify",linkSummary:"Check result",noItems:"No matching items found. Entries will appear after their details and sources are added and checked.",loadError:"The catalogue data could not be loaded."
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
const firmwareNoteEnglish = "This catalogue entry does not yet contain a verified, firmware-specific compatibility assessment. Check the exploit chart and the exact project release notes.";

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
 const items=list.filter(x=>(!q||((x.name||"")+" "+(x.name_en||"")+" "+(x.description||"")+" "+(x.description_en||"")).toLowerCase().includes(q))&&(filter==="all"||(filter==="verified"?x.status==="verified":x.status!=="verified"))&&(category==="all"||x.category===category));
 if(!items.length){target.innerHTML=`<div class="empty">${t("noItems")}</div>`;return;}
 items.forEach(x=>target.appendChild(card(x,type)));
}
const categoryOrder=["Essentials","Utilities","Homebrew","Emulators","Desktop","Media","Mods","Development","Translations"];
const categoryLabels={Essentials:["البرامج الأساسية","Essential tools"],Utilities:["أدوات مساعدة","Utilities"],Homebrew:["هومبرو","Homebrew"],Emulators:["محاكيات PS4","PS4 emulators"],Desktop:["محاكيات الكمبيوتر","PC emulators"],Media:["الوسائط","Media"],Mods:["التعديلات والغش","Mods & cheats"],Development:["التطوير","Development"],Translations:["التعريبات","Translations"]};
let activeView="home";
let renderCatalogueView=()=>{};
let refreshStatusView=()=>{};
function showView(view){activeView=view;document.querySelectorAll(".view-panel").forEach(el=>el.classList.toggle("is-hidden",el.id!==view));document.querySelectorAll(".library-menu button").forEach(b=>b.classList.toggle("active",b.dataset.view===view||(view==="apps"&&b.dataset.category===$("#appCategory").value)));if(view==="apps"||view==="payloads")renderCatalogueView();if(view==="status")refreshStatusView();window.scrollTo({top:0,behavior:"auto"});}
function buildMenu(draw){const host=$("#libraryMenu");host.innerHTML="";const add=(label,view,category=null,glyph="✦")=>{const b=document.createElement("button");b.type="button";b.className="menu-tile";b.dataset.view=view;b.setAttribute("aria-label",label);const icon=document.createElement("span");icon.className="menu-tile-icon";icon.setAttribute("aria-hidden","true");icon.textContent=glyph;const title=document.createElement("span");title.className="menu-tile-label";title.textContent=label;b.append(icon,title);if(category)b.dataset.category=category;b.addEventListener("click",()=>{if(category){$("#appCategory").value=category;showView("apps");draw();}else showView(view);});host.appendChild(b);};const glyphs={Essentials:"✦",Utilities:"⚙",Homebrew:"⌂",Emulators:"◈",Desktop:"▣",Media:"▶",Mods:"✚",Development:"</>",Translations:"文"};categoryOrder.forEach(cat=>add(categoryLabels[cat][currentLang==="en"?1:0],"apps",cat,glyphs[cat]));add(currentLang==="en"?"Payloads":"البايلودات","payloads",null,"⚡");add(currentLang==="en"?"Firmware":"إصدارات النظام","firmware",null,"⬡");add(currentLang==="en"?"Smart Assistant":"المساعد الذكي","assistant",null,"✧");add(currentLang==="en"?"Updates":"التحديثات","updates",null,"↻");add(currentLang==="en"?"Link Checker":"فاحص الروابط","linkcheck",null,"↗");add(currentLang==="en"?"Site Status":"حالة الموقع","status",null,"●");}
async function init(){
 applyLanguage();
 try{
  const response=await fetch("catalog.json?v=20261116-quickstart1",{cache:"force-cache"});
  if(!response.ok)throw new Error("Catalogue load failed");
  const catalog=await response.json();
  const updateFirmwareInfo=(version,target)=>{const f=catalog.firmware.find(x=>x.version===version);target.textContent=f?statusLabel(f.status)+" — "+((currentLang==="en"?(f.note_en||firmwareNoteEnglish):f.note)||t("noFirmwareNote")):t("homeFwEmpty");};
  [$("#fwSelect"),$("#homeFwSelect")].forEach(select=>{catalog.firmware.forEach(x=>{const o=document.createElement("option");o.value=x.version;o.textContent=x.version;select.appendChild(o);});select.addEventListener("change",()=>updateFirmwareInfo(select.value,select.id==="homeFwSelect"?$("#homeFwResult"):$("#fwResult")));});
  function draw(){
   render(catalog.payloads||[],$("#payloadCards"),"payload",$("#payloadSearch").value,$("#payloadFilter").value);
   const selected=$("#appCategory").value;
   const matches=(catalog.apps||[]).filter(x=>x.category===selected);
   const host=$("#appGroups");host.innerHTML="";
   const cards=document.createElement("div");cards.className="cards";host.appendChild(cards);
   render(matches,cards,"app",$("#appSearch").value,"all",selected);
   document.querySelectorAll(".library-menu button").forEach(b=>b.classList.toggle("active",b.dataset.category===selected&&activeView==="apps"));
  }

  renderCatalogueView=draw;
  // Smart catalogue assistant: local keyword search, not an external AI service.
  const allItems=[...(catalog.apps||[]).map(x=>({...x,_type:"app"})),...(catalog.payloads||[]).map(x=>({...x,_type:"payload"}))];
  const af=$("#assistantFirmware");
  catalog.firmware.forEach(x=>{const o=document.createElement("option");o.value=x.version;o.textContent=x.version;af.appendChild(o);});
  const assistantRun=()=>{
   const q=$("#assistantQuery").value.trim().toLowerCase();
   const fw=af.value;
   const hits=allItems.filter(x=>!q||[x.name,x.name_en,x.description,x.description_en,x.category].join(" ").toLowerCase().includes(q));
   const target=$("#assistantResults");target.innerHTML="";
   if(!q){target.textContent=t("assistantEmpty");return;}
   if(!hits.length){target.textContent=t("noItems");return;}
   hits.slice(0,30).forEach(x=>{
    const row=document.createElement("article");row.className="tool-result";
    const title=document.createElement("strong");title.textContent=currentLang==="en"?(x.name_en||x.name):x.name;
    const desc=document.createElement("p");desc.textContent=currentLang==="en"?(x.description_en||x.description||""):(x.description||"");
    const meta=document.createElement("small");meta.textContent=(x.version||"—")+" · "+(x.firmware_en&&currentLang==="en"?x.firmware_en:(x.firmware||"—"))+(fw?" · "+(currentLang==="en"?"Selected firmware: ":"الإصدار المختار: ")+fw:"");
    row.append(title,desc,meta);
    if(x.sourceUrl&&/^https:\/\//i.test(x.sourceUrl)){const a=document.createElement("a");a.href=x.sourceUrl;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t("source");row.appendChild(a);}
    target.appendChild(row);
   });
  };
  $("#assistantRun").addEventListener("click",assistantRun);
  $("#assistantQuery").addEventListener("keydown",e=>{if(e.key==="Enter")assistantRun();});
  const updates=[["2026-11-16","توسيع الكتالوج إلى 74 عنصراً وإضافة أدوات Payload وإدارة الإضافات وملاحظات توافق Firmware، وتحسين لوحة الإدارة.","Expanded the catalogue to 74 entries with new payloads, plugin managers and firmware-specific notes; upgraded the admin manager."],["2026-11-16","تحديث فاحص الروابط ليفحص جميع المصادر على دفعات، وتحسين عرض اللغة الافتراضية.","Updated the link checker to process all sources in batches and polished the default language experience."],["2026-11-15","إضافة المساعد الذكي وفاحص الروابط ولوحة الحالة وسجل التحديثات.","Added the smart catalogue assistant, link checker, status panel and changelog."],["2026-11-15","تحسين واجهة القوائم وإصلاح عرض أزرار البداية على الشاشات الصغيرة.","Improved category navigation and hero button layout on small screens."]];
  $("#updatesList").innerHTML="";
  updates.forEach(u=>{const el=document.createElement("article");el.className="timeline-item";const date=document.createElement("time");date.textContent=u[0];const p=document.createElement("p");p.textContent=currentLang==="en"?u[2]:u[1];el.append(date,p);$("#updatesList").appendChild(el);});
  const refreshStatus=async()=>{
   $("#catalogStatus").textContent=t("statusOnline");$("#catalogCount").textContent=String(allItems.length+catalog.firmware.length);$("#lastCheck").textContent=new Date().toLocaleString(currentLang==="en"?"en":"ar");
   $("#workerStatus").textContent=t("statusUnknown");
   try{const r=await fetch("https://majeed-ps4-admin-api.majeedomran.workers.dev/health",{cache:"no-store"});$("#workerStatus").textContent=r.ok?t("statusOnline"):t("statusOffline");}catch{$("#workerStatus").textContent=t("statusOffline");}
  };
  $("#refreshStatus").addEventListener("click",refreshStatus);refreshStatusView=refreshStatus;
  $("#checkLinks").addEventListener("click",async()=>{
   const btn=$("#checkLinks"),out=$("#linkResults");btn.disabled=true;btn.textContent=t("checkingLinks");out.innerHTML="";
   try{
    const urls=[...new Set(allItems.map(x=>x.sourceUrl).filter(u=>u&&/^https:\/\//i.test(u)))];
    const batches=[];for(let i=0;i<urls.length;i+=30)batches.push(urls.slice(i,i+30));
    const checked=await Promise.all(batches.map(async batch=>{
     const r=await fetch("https://majeed-ps4-admin-api.majeedomran.workers.dev/link-check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({urls:batch})});
     if(!r.ok)throw new Error("HTTP "+r.status);
     const data=await r.json();return Array.isArray(data.results)?data.results:[];
    }));
    const results=checked.flat();
    results.forEach(x=>{const el=document.createElement("div");el.className="link-row";const linkWrap=document.createElement("div");linkWrap.className="link-result-link-wrap";const label=document.createElement("a");label.textContent=x.url;label.href=x.url;label.target="_blank";label.rel="noopener noreferrer";label.className="link-result-url";linkWrap.appendChild(label);const state=document.createElement("strong");state.textContent=x.ok?t("linkOk")+" ("+x.status+")":t("linkBad")+" ("+(x.status||"—")+")";state.className="link-result-status "+(x.ok?"good":"bad");el.append(linkWrap,state);out.appendChild(el);});
    const summary=document.createElement("p");summary.textContent=t("linkSummary")+": "+results.filter(x=>x.ok).length+" / "+results.length;out.prepend(summary);
   }catch(e){out.textContent=currentLang==="en"?"The checker service is unavailable.":"خدمة فحص الروابط غير متاحة حالياً. تأكد من تحديث Cloudflare Worker.";}
   finally{btn.disabled=false;btn.textContent=t("checkLinks");}
  });

  ["payloadSearch","payloadFilter","appSearch"].forEach(id=>$("#"+id).addEventListener("input",draw));
  document.querySelectorAll("[data-view]").forEach(control=>control.addEventListener("click",event=>{event.preventDefault();showView(control.dataset.view);if(control.dataset.view==="apps"&&control.dataset.category){$("#appCategory").value=control.dataset.category;draw();}if(control.dataset.view==="firmware"&&$("#homeFwSelect").value){$("#fwSelect").value=$("#homeFwSelect").value;$("#fwSelect").dispatchEvent(new Event("change"));}history.replaceState(null,"","#"+control.dataset.view);}));
  $("#langBtn").addEventListener("click",()=>{currentLang=currentLang==="ar"?"en":"ar";localStorage.setItem("majeedLang",currentLang);applyLanguage();buildMenu(draw);if(activeView==="apps"||activeView==="payloads")draw();$("#updatesList").querySelectorAll(".timeline-item p").forEach((p,i)=>p.textContent=currentLang==="en"?updates[i][2]:updates[i][1]);const fw=$("#fwSelect").value;if(fw)updateFirmwareInfo(fw,$("#fwResult"));else $("#fwResult").textContent=t("fwEmpty");const homeFw=$("#homeFwSelect").value;if(homeFw)updateFirmwareInfo(homeFw,$("#homeFwResult"));else $("#homeFwResult").textContent=t("homeFwEmpty");});
  $("#year").textContent=new Date().getFullYear();
  document.querySelectorAll(".view-panel").forEach(el=>el.classList.toggle("is-hidden",el.id!=="home"));
  $("#appCategory").value="Essentials";buildMenu(draw);showView("home");applyLanguage();
 }catch(error){console.error(error);$("#payloadCards").innerHTML=`<div class="empty">${t("loadError")}</div>`;}
}
init();
