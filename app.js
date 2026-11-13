// Public catalogue renderer. Data is read from catalog.json, which the admin panel updates.
const $ = s => document.querySelector(s);
const statusLabel = s => s==="verified"?"موثق":s==="experimental"?"تجريبي":s==="unsupported"?"غير مدعوم":"غير موثق";
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function card(item,type){
 const el=document.createElement("article"); el.className="item-card";
 const source = item.sourceUrl && /^https:\/\//i.test(item.sourceUrl) ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">صفحة المصدر الرسمي ↗</a>` : '<span class="meta">لم تتم إضافة مصدر رسمي بعد</span>';
 const download = item.downloadUrl && /^https:\/\//i.test(item.downloadUrl) ? `<a href="${escapeHtml(item.downloadUrl)}" target="_blank" rel="noopener noreferrer">تحميل مباشر ↗</a>` : "";
 el.innerHTML=`<div class="item-top"><span class="item-icon">${type==="payload"?"P":"A"}</span><span class="status ${item.status==="verified"?"verified":""}">${statusLabel(item.status||"unverified")}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description||"لا يوجد وصف مضاف.")}</p><div class="meta">الإصدار: ${escapeHtml(item.version||"غير محدد")} · التوافق: ${escapeHtml(item.firmware||"غير محدد")}</div>${source}${download}`;
 return el;
}
function render(list,target,type,query="",filter="all",category="all"){
 target.innerHTML="";
 const q=query.trim().toLowerCase();
 const items=list.filter(x=>(!q||((x.name||"")+" "+(x.description||"")).toLowerCase().includes(q))&&(filter==="all"||x.status===(filter==="verified"?"verified":"unverified"))&&(category==="all"||x.category===category));
 if(!items.length){target.innerHTML='<div class="empty">لا توجد عناصر مطابقة حالياً. ستظهر الملفات بعد إضافة بياناتها والتحقق من مصادرها.</div>';return;}
 items.forEach(x=>target.appendChild(card(x,type)));
}
async function init(){
 try {
  const response=await fetch("catalog.json?v="+Date.now(),{cache:"no-store"});
  if(!response.ok) throw new Error("تعذر تحميل الكتالوج");
  const catalog=await response.json();
  catalog.firmware.forEach(x=>{const o=document.createElement("option");o.value=x.version;o.textContent=x.version;$("#fwSelect").appendChild(o);});
  $("#fwSelect").addEventListener("change",e=>{const f=catalog.firmware.find(x=>x.version===e.target.value);$("#fwResult").textContent=f?`${statusLabel(f.status)} — ${f.note||"لا توجد ملاحظات إضافية."}`:"لم يتم اختيار إصدار بعد.";});
  function draw(){
   render(catalog.payloads||[],$("#payloadCards"),"payload",$("#payloadSearch").value,$("#payloadFilter").value);
   render(catalog.apps||[],$("#appCards"),"app",$("#appSearch").value,"all",$("#appCategory").value);
  }
  ["payloadSearch","payloadFilter","appSearch","appCategory"].forEach(id=>$("#"+id).addEventListener("input",draw));
  $("#langBtn").addEventListener("click",()=>alert("English interface will be added in the next build."));
  $("#year").textContent=new Date().getFullYear();
  draw();
 } catch(error) { console.error(error); $("#payloadCards").innerHTML='<div class="empty">تعذر تحميل بيانات الكتالوج حالياً.</div>'; }
}
init();
