const $=s=>document.querySelector(s);
const state={role:localStorage.getItem("forgeRole")||null, receipt:JSON.parse(localStorage.getItem("forgeReceipt")||"{}"), draft:localStorage.getItem("forgeDraft")||""};

const roles={
 calculator:{title:"🧮 Calculatrice",hint:"Calculs simples, pourcentages et mémoire locale.",render:renderCalculator},
 receipt:{title:"🧾 Bloc reçu",hint:"Crée, imprime et conserve tes reçus sur cet appareil.",render:renderReceipt},
 notebook:{title:"📒 Cahier de préparation",hint:"Organise une préparation avec objectifs, matériel et déroulement.",render:renderNotebook},
 writer:{title:"✍️ Générateur / éditeur de texte",hint:"Rédige, transforme et conserve ton brouillon localement.",render:renderWriter},
 teacher:{title:"👨‍🏫 Professeur de mathématiques",hint:"Entraînement sur les opérations fondamentales.",render:renderTeacher}
};

function identify(text){
 const t=text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 if(/calcul|calculatrice|calculette/.test(t))return"calculator";
 if(/recu|bloc.*recu|facture.*recu|ticket/.test(t))return"receipt";
 if(/cahier|preparation|prepa/.test(t))return"notebook";
 if(/generateur.*texte|generate.*texte|redacteur|redaction|editeur.*texte|ecris.*texte/.test(t))return"writer";
 if(/prof.*math|professeur.*math|enseign.*math|mathematique|maths/.test(t))return"teacher";
 return null;
}
function forge(text){
 const role=identify(text);
 if(!role){alert("Cette identité n'est pas encore disponible dans FORGE V1. Essaie un des rôles proposés.");return}
 state.role=role;localStorage.setItem("forgeRole",role);showRole();
}
function showRole(){
 $("#home").classList.remove("active");$("#forgeView").classList.add("active");
 const r=roles[state.role];$("#roleTitle").textContent=r.title;$("#roleHint").textContent=r.hint;r.render($("#roleContent"));
 window.scrollTo(0,0);
}
function home(){$("#forgeView").classList.remove("active");$("#home").classList.add("active");}
$("#forgeForm").addEventListener("submit",e=>{e.preventDefault();forge($("#command").value.trim())});
document.querySelectorAll(".chips button").forEach(b=>b.addEventListener("click",()=>forge(b.dataset.command)));
$("#backBtn").onclick=home;$("#changeRoleBtn").onclick=home;

function renderCalculator(c){
 c.innerHTML=`<div class="panel"><h2>Calculatrice</h2>
 <div class="field"><label>Expression</label><input id="calcInput" inputmode="decimal" placeholder="Ex. 25 × 4 + 10"></div>
 <div class="actions"><button class="primary" id="calcBtn">Calculer</button><button id="clearCalc">Effacer</button></div>
 <div id="calcResult" class="result">Le résultat apparaîtra ici.</div></div>
 <div class="panel"><h2>Opérations rapides</h2><div class="grid">
 ${["+","−","×","÷"].map((x,i)=>`<button class="secondary op" data-op="${["+","-","*","/"][i]}">${x}</button>`).join("")}</div>
 <p class="muted">Tu peux écrire une expression simple avec +, -, *, /, ×, ÷, parenthèses et pourcentage.</p></div>`;
 $("#calcBtn").onclick=calc;$("#clearCalc").onclick=()=>{$("#calcInput").value="";$("#calcResult").textContent="Le résultat apparaîtra ici."};
 c.querySelectorAll(".op").forEach(b=>b.onclick=()=>{$("#calcInput").value+` ${b.dataset.op} `;$("#calcInput").focus()});
}
function calc(){
 let s=$("#calcInput").value.trim().replace(/,/g,".").replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-");
 if(!s)return;
 if(!/^[0-9+\-*/().%\s]+$/.test(s)){ $("#calcResult").textContent="Expression non reconnue.";return}
 try{
  s=s.replace(/(\d+(?:\.\d+)?)%/g,"($1/100)");
  const result=Function('"use strict";return ('+s+')')();
  if(!Number.isFinite(result))throw Error();
  $("#calcResult").innerHTML="<strong>Résultat :</strong> "+result;
 }catch(e){$("#calcResult").textContent="Calcul impossible. Vérifie l'expression."}
}

function renderReceipt(c){
 const r=state.receipt;
 c.innerHTML=`<div class="panel"><h2>Nouveau reçu</h2><div class="grid">
 <div class="field"><label>Nom du client</label><input id="rcClient" value="${esc(r.client||"")}"></div>
 <div class="field"><label>N° du reçu</label><input id="rcNo" value="${esc(r.no||("R-"+Date.now().toString().slice(-6)))}"></div>
 <div class="field"><label>Description</label><input id="rcDesc" value="${esc(r.desc||"")}"></div>
 <div class="field"><label>Montant</label><input id="rcAmount" inputmode="decimal" value="${esc(r.amount||"")}"></div>
 <div class="field"><label>Mode de paiement</label><select id="rcPay"><option ${r.pay==="Espèces"?"selected":""}>Espèces</option><option ${r.pay==="MonCash"?"selected":""}>MonCash</option><option ${r.pay==="NatCash"?"selected":""}>NatCash</option><option ${r.pay==="Autre"?"selected":""}>Autre</option></select></div>
 <div class="field"><label>Date</label><input id="rcDate" type="date" value="${r.date||new Date().toISOString().slice(0,10)}"></div>
 </div><div class="actions"><button class="primary" id="makeReceipt">Créer le reçu</button><button id="printReceipt">Imprimer</button></div></div>
 <div id="receiptPreview" class="panel"><div class="receipt"><h2>REÇU</h2><small>N° ${esc(r.no||"—")} · ${esc(r.date||"—")}</small><div class="line"></div><p><strong>Client :</strong> ${esc(r.client||"—")}</p><p><strong>Motif :</strong> ${esc(r.desc||"—")}</p><p><strong>Paiement :</strong> ${esc(r.pay||"—")}</p><div class="line"></div><p class="total">Total : ${esc(r.amount||"—")}</p></div></div>`;
 $("#makeReceipt").onclick=saveReceipt;$("#printReceipt").onclick=()=>window.print();
}
function saveReceipt(){
 state.receipt={client:$("#rcClient").value,no:$("#rcNo").value,desc:$("#rcDesc").value,amount:$("#rcAmount").value,pay:$("#rcPay").value,date:$("#rcDate").value};
 localStorage.setItem("forgeReceipt",JSON.stringify(state.receipt));renderReceipt($("#roleContent"));
}

function renderNotebook(c){
 c.innerHTML=`<div class="panel"><h2>Préparation</h2><div class="grid">
 <div class="field"><label>Titre</label><input id="nbTitle" placeholder="Ex. Leçon sur les fractions"></div>
 <div class="field"><label>Matière</label><input id="nbSubject" placeholder="Mathématiques"></div>
 <div class="field"><label>Classe</label><input id="nbClass" placeholder="9e AF"></div>
 <div class="field"><label>Durée</label><input id="nbTime" placeholder="45 minutes"></div>
 </div><div class="field" style="margin-top:12px"><label>Objectif</label><textarea id="nbGoal" placeholder="À la fin de la séance, l'élève pourra..."></textarea></div>
 <div class="field" style="margin-top:12px"><label>Déroulement / notes</label><textarea id="nbBody" style="min-height:230px" placeholder="Introduction&#10;Développement&#10;Exercices&#10;Évaluation"></textarea></div>
 <div class="actions"><button class="primary" id="nbSave">Enregistrer le brouillon</button><button id="nbPrint">Imprimer</button></div></div>
 <div class="panel"><h2>Idée de structure</h2><p class="muted">Titre → objectif → prérequis → matériel → activité → exercices → évaluation → devoir.</p></div>`;
 $("#nbSave").onclick=()=>{const data={title:$("#nbTitle").value,subject:$("#nbSubject").value,cls:$("#nbClass").value,time:$("#nbTime").value,goal:$("#nbGoal").value,body:$("#nbBody").value};localStorage.setItem("forgeNotebook",JSON.stringify(data));alert("Brouillon enregistré sur cet appareil.")};
 $("#nbPrint").onclick=()=>window.print();
 const d=JSON.parse(localStorage.getItem("forgeNotebook")||"null");if(d){["Title","Subject","Class","Time","Goal","Body"].forEach((x,i)=>{const id=["nbTitle","nbSubject","nbClass","nbTime","nbGoal","nbBody"][i];if(d[Object.keys(d)[i]])$("#"+id).value=d[Object.keys(d)[i]]})}
}

function renderWriter(c){
 c.innerHTML=`<div class="panel"><h2>Générateur / éditeur</h2><div class="grid">
 <div class="field"><label>Type de texte</label><select id="wtType"><option>Lettre</option><option>Annonce</option><option>Paragraphe</option><option>Discours</option><option>Message</option></select></div>
 <div class="field"><label>Ton</label><select id="wtTone"><option>Professionnel</option><option>Simple</option><option>Amical</option><option>Administratif</option></select></div>
 </div><div class="field" style="margin-top:12px"><label>Idée / consigne</label><input id="wtPrompt" placeholder="Ex. annonce de réunion des parents"></div>
 <div class="actions"><button class="primary" id="wtGenerate">Créer un modèle</button><button id="wtSave">Enregistrer</button><button id="wtPrint">Imprimer</button></div></div>
 <div class="panel"><textarea id="wtEditor" class="text-editor" placeholder="Ton texte apparaîtra ici..."></textarea></div>`;
 $("#wtGenerate").onclick=generateText;$("#wtSave").onclick=()=>{localStorage.setItem("forgeDraft",$("#wtEditor").value);alert("Texte enregistré.")};$("#wtPrint").onclick=()=>window.print();
 $("#wtEditor").value=state.draft;
}
function generateText(){
 const type=$("#wtType").value,tone=$("#wtTone").value,p=$("#wtPrompt").value.trim()||"un sujet général";
 const intro=tone==="Amical"?"Bonjour,":"Objet : "+p;
 let text="";
 if(type==="Lettre") text=`${intro}\n\nJe vous écris au sujet de ${p}.\n\nNous souhaitons vous communiquer les informations importantes concernant ce sujet. Merci de prendre connaissance de ce message et de nous contacter si nécessaire.\n\nCordialement,\n`;
 else if(type==="Annonce") text=`ANNONCE\n\n${p.toUpperCase()}\n\nNous informons les personnes concernées que ${p}. Merci de prendre les dispositions nécessaires.\n\nLa Direction`;
 else if(type==="Discours") text=`Mesdames, Messieurs,\n\nAujourd'hui, nous sommes réunis pour parler de ${p}.\n\nCe sujet mérite notre attention. Je vous remercie pour votre écoute et votre participation.\n\nMerci.`;
 else if(type==="Message") text=`${intro}\n\nJe voulais vous informer de ${p}. Merci de prendre connaissance de cette information.\n\nBonne journée.`;
 else text=`${p}\n\nVoici un texte de travail à développer autour de ce sujet. Ajoute ici les informations, exemples et arguments nécessaires.`;
 $("#wtEditor").value=text;
}

function renderTeacher(c){
 c.innerHTML=`<div class="panel"><h2>Opérations fondamentales</h2><p class="muted">Choisis une opération, puis réponds. La correction est immédiate.</p>
 <div class="actions"><button data-kind="addition">Addition</button><button data-kind="soustraction">Soustraction</button><button data-kind="multiplication">Multiplication</button><button data-kind="division">Division</button></div>
 <div id="lesson" class="result" style="margin-top:16px">Choisis une opération pour commencer.</div></div>`;
 c.querySelectorAll("[data-kind]").forEach(b=>b.onclick=()=>newExercise(b.dataset.kind));
}
let currentAnswer=null;
function newExercise(kind){
 const a=Math.floor(Math.random()*90)+10,b=Math.floor(Math.random()*20)+2;let q="",ans;
 if(kind==="addition"){q=`${a} + ${b} = ?`;ans=a+b}
 if(kind==="soustraction"){const x=Math.max(a,b),y=Math.min(a,b);q=`${x} − ${y} = ?`;ans=x-y}
 if(kind==="multiplication"){q=`${a} × ${b} = ?`;ans=a*b}
 if(kind==="division"){const divisor=Math.floor(Math.random()*9)+2,quot=Math.floor(Math.random()*12)+2;const dividend=divisor*quot;q=`${dividend} ÷ ${divisor} = ?`;ans=quot}
 currentAnswer=ans;
 $("#lesson").innerHTML=`<div class="teacher-q"><strong>Exercice :</strong> ${q}</div><div class="field" style="margin-top:12px"><label>Ta réponse</label><input id="teachAnswer" inputmode="decimal"></div><div class="actions"><button class="primary" id="checkAnswer">Corriger</button><button id="nextAnswer">Nouvel exercice</button></div><div id="teachResult" class="answer"></div>`;
 $("#checkAnswer").onclick=()=>{const v=Number($("#teachAnswer").value);$("#teachResult").innerHTML=v===currentAnswer?"✅ <strong>Correct.</strong> Bonne réponse.":`❌ Pas encore. La bonne réponse est <strong>${currentAnswer}</strong>.`};
 $("#nextAnswer").onclick=()=>newExercise(kind);
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

$("#aboutBtn").onclick=()=>$("#aboutModal").classList.remove("hidden");
$("#closeAbout").onclick=()=>$("#aboutModal").classList.add("hidden");
$("#aboutModal").addEventListener("click",e=>{if(e.target.id==="aboutModal")$("#aboutModal").classList.add("hidden")});
if(state.role && roles[state.role])showRole();

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
