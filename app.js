// Catalogue data is intentionally empty until official sources and compatibility are verified.
const catalog = {
  firmware: [
    {version:"5.05",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"6.72",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"7.02",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"7.55",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"9.00",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"9.03",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"9.60",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"10.00",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"11.00",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"11.02",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."},
    {version:"12.00",status:"unverified",note:"لم تتم إضافة بيانات توافق موثقة بعد."}
  ],
  payloads: [],
  apps: []
};
const $ = s => document.querySelector(s);
const statusLabel = s => s==="verified"?"موثق":s==="experimental"?"تجريبي":s==="unsupported"?"غير مدعوم":"غير موثق";
function card(item,type){
 const el=document.createElement("article"); el.className="item-card";
 const source = item.sourceUrl && /^https:\/\//i.test(item.sourceUrl) ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">صفحة المصدر الرسمي ↗</a>` : `<span class="meta">لم تتم إضافة مصدر رسمي بعد</span>`;
 const download = item.downloadUrl && /^https:\/\//i.test(item.downloadUrl) ? `<a href="${item.downloadUrl}" target="_blank" rel="noopener noreferrer">تحميل مباشر ↗</a>` : "";
 el.innerHTML=`<div class="item-top"><span class="item-icon">${type==="payload"?"P":"A"}</span><span class="status ${item.status==="verified"?"verified":""}">${statusLabel(item.status||"unverified")}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description||"لا يوجد وصف مضاف.")}</p><div class="meta">الإصدار: ${escapeHtml(item.version||"غير محدد")} · التوافق: ${escapeHtml(item.firmware||"غير محدد")}</div>${source}${download}`;
 return el;
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(list, target, type, query="", filter="all", category="all"){
 target.innerHTML="";
 const q=query.trim().toLowerCase();
 const items=list.filter(x=>(!q||(x.name+" "+(x.description||"")).toLowerCase().includes(q))&&(filter==="all"||x.status===(filter==="verified"?"verified":"unverified"))&&(category==="all"||x.category===category));
 if(!items.length){target.innerHTML='<div class="empty">لا توجد عناصر مطابقة حالياً. ستظهر الملفات بعد إضافة بياناتها والتحقق من مصادرها.</div>';return;}
 items.forEach(x=>target.appendChild(card(x,type)));
}
catalog.firmware.forEach(x=>{const o=document.createElement("option");o.value=x.version;o.textContent=x.version;$("#fwSelect").appendChild(o)});
$("#fwSelect").addEventListener("change",e=>{
 const f=catalog.firmware.find(x=>x.version===e.target.value);
 $("#fwResult").textContent=f?`${statusLabel(f.status)} — ${f.note}`:"لم يتم اختيار إصدار بعد.";
});
function draw(){
 render(catalog.payloads,$("#payloadCards"),"payload",$("#payloadSearch").value,$("#payloadFilter").value);
 render(catalog.apps,$("#appCards"),"app",$("#appSearch").value,"all",$("#appCategory").value);
}
["payloadSearch","payloadFilter","appSearch","appCategory"].forEach(id=>$("#"+id).addEventListener("input",draw));
$("#langBtn").addEventListener("click",()=>alert("English interface will be added in the next build."));
$("#year").textContent=new Date().getFullYear();
draw();
