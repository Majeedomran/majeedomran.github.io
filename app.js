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
  appsTitle:"تطبيقات PS4",appsDesc:"تطبيقات وأدوات وتعديلات ومكتبات تطوير ومراجع التعريب مرتبة حسب النوع.",appSearch:"ابحث عن تطبيق...",allCategories:"كل التصنيفات",
  catMedia:"وسائط",catUtilities:"أدوات مساعدة",catHomebrew:"هومبرو",catEmulators:"محاكيات",catMods:"تعديلات",catTranslations:"تعريبات",catDevelopment:"تطوير",
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
  appsTitle:"PS4 Applications",appsDesc:"Apps, tools, mods, development libraries and translation directories organized by type.",appSearch:"Search applications...",allCategories:"All categories",
  catMedia:"Media",catUtilities:"Utilities",catHomebrew:"Homebrew",catEmulators:"Emulators",catMods:"Mods",catTranslations:"Translations",catDevelopment:"Development",
  noticeTitle:"Important information before downloading",noticeDesc:"Compatibility varies by system software version and project. A version appearing in this list does not mean it is jailbreakable. This catalogue does not include unverified direct download links; use the official source after checking it.",
  footerNote:"Independent community project. Not affiliated with Sony.",
  experimental:"Experimental",unsupported:"Unsupported",unknown:"Unverified",noDesc:"No description provided.",noSource:"No official source has been added",source:"Official source page ↗",download:"Direct download ↗",
  version:"Version:",compatibility:"Compatibility:",notSelected:"No version selected yet.",noFirmwareNote:"No additional notes.",
  noItems:"No matching items found. Entries will appear after their details and sources are added and checked.",loadError:"The catalogue data could not be loaded."
 }
};
const t = key => words[currentLang][key] || words.ar[key] || key;
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
 const source=item.sourceUrl&&/^https:\/\//i.test(item.sourceUrl)?`<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t("source")}</a>`:`<span class="meta">${t("noSource")}</span>`;
 const download=item.downloadUrl&&/^https:\/\//i.test(item.downloadUrl)?`<a href="${escapeHtml(item.downloadUrl)}" target="_blank" rel="noopener noreferrer">${t("download")}</a>`:"";
 el.innerHTML=`<div class="item-top"><span class="item-icon">${type==="payload"?"P":"A"}</span><span class="status ${item.status==="verified"?"verified":""}">${statusLabel(item.status||"unverified")}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description||t("noDesc"))}</p><div class="meta">${t("version")} ${escapeHtml(item.version||"—")} · ${t("compatibility")} ${escapeHtml(item.firmware||"—")}</div>${source}${download}`;
 return el;
}
function render(list,target,type,query="",filter="all",category="all"){
 target.innerHTML="";
 const q=query.trim().toLowerCase();
 const items=list.filter(x=>(!q||((x.name||"")+" "+(x.description||"")).toLowerCase().includes(q))&&(filter==="all"||x.status===(filter==="verified"?"verified":"unverified"))&&(category==="all"||x.category===category));
 if(!items.length){target.innerHTML=`<div class="empty">${t("noItems")}</div>`;return;}
 items.forEach(x=>target.appendChild(card(x,type)));
}
async function init(){
 try{
  const response=await fetch("catalog.json?v="+Date.now(),{cache:"no-store"});
  if(!response.ok)throw new Error("Catalogue load failed");
  const catalog=await response.json();
  catalog.firmware.forEach(x=>{const o=document.createElement("option");o.value=x.version;o.textContent=x.version;$("#fwSelect").appendChild(o);});
  $("#fwSelect").addEventListener("change",e=>{const f=catalog.firmware.find(x=>x.version===e.target.value);$("#fwResult").textContent=f?`${statusLabel(f.status)} — ${f.note||t("noFirmwareNote")}`:t("notSelected");});
  function draw(){
   render(catalog.payloads||[],$("#payloadCards"),"payload",$("#payloadSearch").value,$("#payloadFilter").value);
   render(catalog.apps||[],$("#appCards"),"app",$("#appSearch").value,"all",$("#appCategory").value);
  }
  ["payloadSearch","payloadFilter","appSearch","appCategory"].forEach(id=>$("#"+id).addEventListener("input",draw));
  $("#langBtn").addEventListener("click",()=>{currentLang=currentLang==="ar"?"en":"ar";localStorage.setItem("majeedLang",currentLang);applyLanguage();draw();const fw=$("#fwSelect").value;if(fw){const f=catalog.firmware.find(x=>x.version===fw);$("#fwResult").textContent=f?`${statusLabel(f.status)} — ${f.note||t("noFirmwareNote")}`:t("notSelected");}else $("#fwResult").textContent=t("fwEmpty");});
  $("#year").textContent=new Date().getFullYear();
  applyLanguage();draw();
 }catch(error){console.error(error);$("#payloadCards").innerHTML=`<div class="empty">${t("loadError")}</div>`;}
}
init();
