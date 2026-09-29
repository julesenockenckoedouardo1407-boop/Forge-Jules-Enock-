const $ = (s) => document.querySelector(s);
const app = $("#app");

const roles = {
  calculatrice: ["calculatrice","calculator","calcul"],
  reçu: ["reçu","recu","bloc reçu","bloc recu","facture","quittance"],
  préparation: ["cahier de préparation","cahier","préparation","preparation"],
  texte: ["générateur de texte","generateur de texte","éditeur de texte","éditeur","texte"],
  math: ["professeur de mathématiques","professeur de maths","mathématiques","mathematiques","math","opérations","operations"]
};

function normalize(s){return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();}
function money(n){return Number(n||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function gdes(n){return `${money(n)} Gdes`;}
function dollars(n){return `${money(Number(n||0)/5)} dollars haïtiens`;}
function today(){return new Date().toLocaleDateString("fr-FR");}
function matchRole(q){
  const n=normalize(q);
  for(const [role,keys] of Object.entries(roles)) if(keys.some(k=>n.includes(normalize(k)))) return role;
  return null;
}
function shell(title,body){
  app.innerHTML=`<section class="panel"><button class="back" onclick="home()">← Accueil</button><h2>${title}</h2>${body}</section>`;
}
function home(){
 app.innerHTML=`
 <section class="hero"><div class="brand">FORGE</div><h1>Que veux-tu que je sois ?</h1>
 <p>Décris simplement ce dont tu as besoin.</p>
 <div class="forge-input"><input id="command" placeholder="Ex. Sois une calculatrice"><button onclick="forge()">Créer</button></div>
 <div class="examples"><button onclick="setCmd('Sois une calculatrice')">Calculatrice</button><button onclick="setCmd('Sois un bloc reçu')">Bloc reçu</button><button onclick="setCmd('Sois un cahier de préparation')">Préparation</button><button onclick="setCmd('Sois un générateur de texte')">Texte</button><button onclick="setCmd('Sois mon professeur de mathématiques')">Maths</button></div>
 </section>
 <section class="about"><h3>À propos</h3><p><b>FORGE Jules Enock</b><br>Créé par maître Jules Enock<br>Contact : +509 40409680</p></section>`;
}
function setCmd(v){$("#command").value=v; forge();}
function forge(){
 const q=$("#command").value, r=matchRole(q);
 if(!r){app.innerHTML=`<section class="panel"><button class="back" onclick="home()">← Accueil</button><h2>Je ne peux pas encore être cela</h2><p>Cette demande n'est pas encore prise en charge. Essaie une calculatrice, un bloc reçu, un cahier de préparation, un générateur de texte ou un professeur de mathématiques.</p></section>`;return;}
 ({calculatrice:calculator,reçu:receipt,préparation:prep,texte:textTool,math:mathTeacher})[r]();
}

function calculator(){
 shell("Calculatrice",`<div class="calc"><input id="display" class="calc-display" inputmode="text" placeholder="0" readonly>
 <div class="keys">${["C","⌫","(",")","%","7","8","9","÷","4","5","6","×","1","2","3","−","0",".","+","="].map(x=>`<button class="${x==="="? "equal":""}" onclick="calcKey('${x}')">${x}</button>`).join("")}</div>
 <p class="hint">Les signes peuvent être saisis avec les touches de la calculatrice.</p></div>`);
}
let expr="";
function calcKey(k){
 const d=$("#display");
 if(k==="C"){expr="";d.value="";return;}
 if(k==="⌫"){expr=expr.slice(0,-1);d.value=expr;return;}
 if(k==="="){try{let e=expr.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/%/g,"/100"); if(!/^[0-9+\-*/().\s]+$/.test(e)) throw 0; const v=Function('"use strict";return ('+e+')')(); expr=String(v); d.value=expr;}catch{d.value="Erreur";expr="";}return;}
 expr+=k; d.value=expr;
}

function receipt(){
 shell("Bloc reçu",`
 <div class="form-grid">
 <label>Nom du client<input id="r-client"></label>
 <label>Numéro du reçu<input id="r-num" value="R-${Date.now().toString().slice(-6)}"></label>
 <label>Date<input id="r-date" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
 <label>Nom de l'agent / caissier<input id="r-agent"></label>
 <label class="wide">Description / motif<input id="r-desc"></label>
 <label>Total dû (gourdes)<input id="r-total" type="number" min="0" step="0.01" oninput="updateReceipt()"></label>
 <label>Montant payé (gourdes)<input id="r-paid" type="number" min="0" step="0.01" oninput="updateReceipt()"></label>
 <label>Mode de paiement<select id="r-mode"><option>Espèces</option><option>MonCash</option><option>NatCash</option><option>Autre</option></select></label>
 <label>Logo IMDS sur le reçu<select id="r-logo"><option value="non">Non</option><option value="oui">Oui</option></select></label>
 <label class="wide">Observation<textarea id="r-obs"></textarea></label>
 </div>
 <div class="receipt-live" id="receipt-live"></div>
 <div class="actions"><button onclick="saveReceipt()">Enregistrer</button><button onclick="printReceipt()">Imprimer le reçu</button></div>`);
 updateReceipt();
}
function updateReceipt(){
 const total=+($("#r-total")?.value||0), paid=+($("#r-paid")?.value||0), bal=Math.max(0,total-paid);
 const p=+($("#r-paid")?.value||0);
 $("#receipt-live").innerHTML=`<div class="receipt-card">
 ${$("#r-logo")?.value==="oui" ? '<img src="logo-imds.png" class="receipt-logo" alt="Logo IMDS">' : ""}
 <h3>REÇU</h3><div class="receipt-line"><span>Client</span><b>${$("#r-client")?.value||"—"}</b></div>
 <div class="receipt-line"><span>N°</span><b>${$("#r-num")?.value||"—"}</b></div>
 <div class="receipt-line"><span>Date</span><b>${$("#r-date")?.value ? new Date($("#r-date").value+"T00:00:00").toLocaleDateString("fr-FR") : today()}</b></div>
 <div class="receipt-line"><span>Description</span><b>${$("#r-desc")?.value||"—"}</b></div>
 <hr><div class="receipt-line"><span>Total dû</span><b>${gdes(total)} / ${dollars(total)}</b></div>
 <div class="receipt-line"><span>Payé</span><b>${gdes(p)} / ${dollars(p)}</b></div>
 <div class="receipt-line balance"><span>Balance</span><b>${gdes(bal)} / ${dollars(bal)}</b></div>
 <div class="receipt-line"><span>Paiement</span><b>${$("#r-mode")?.value||"—"}</b></div>
 <div class="receipt-line"><span>Agent</span><b>${$("#r-agent")?.value||"—"}</b></div>
 <div class="receipt-note">${$("#r-obs")?.value||""}</div><div class="signature">Signature : __________________</div></div>`;
}
function saveReceipt(){
 updateReceipt();
 localStorage.setItem("forge_receipt", $("#receipt-live").innerHTML);
 alert("Reçu enregistré sur cet appareil.");
}
function printReceipt(){
 updateReceipt();
 const html=$("#receipt-live").innerHTML;
 const w=window.open("","_blank");
 if(!w){alert("Autorise les fenêtres d'impression dans Chrome.");return;}
 w.document.write(`<html><head><title>Reçu</title><style>body{font-family:Arial;margin:24px}.receipt-card{max-width:500px;margin:auto;border:2px solid #111;padding:24px}.receipt-logo{max-width:150px;max-height:80px;display:block;margin:0 auto 10px}.receipt-line{display:flex;justify-content:space-between;gap:20px;padding:8px 0}.balance{font-size:1.1em;border-top:1px solid #111;border-bottom:1px solid #111}.signature{margin-top:35px}</style></head><body>${html}</body></html>`);
 w.document.close(); w.focus(); w.print();
}

function prep(){
 shell("Cahier de préparation",`<div class="form-grid"><label>Titre<input id="p-title"></label><label>Matière<input id="p-subject"></label><label>Classe<input id="p-class"></label><label>Durée<input id="p-duration"></label><label class="wide">Objectif<textarea id="p-objective"></textarea></label><label class="wide">Déroulement / notes<textarea id="p-notes" rows="10"></textarea></label></div><div class="actions"><button onclick="savePrep()">Enregistrer</button><button onclick="window.print()">Imprimer</button></div>`);
}
function savePrep(){localStorage.setItem("forge_prep",JSON.stringify({title:$("#p-title").value,subject:$("#p-subject").value,className:$("#p-class").value,duration:$("#p-duration").value,objective:$("#p-objective").value,notes:$("#p-notes").value}));alert("Préparation enregistrée.");}

function textTool(){
 shell("Générateur / éditeur de texte",`<div class="form-grid"><label>Type<select id="t-type"><option>Texte libre</option><option>Lettre</option><option>Annonce</option><option>Paragraphe</option></select></label><label>Ton<select id="t-tone"><option>Simple</option><option>Professionnel</option><option>Amical</option></select></label><label class="wide">Sujet / consigne<textarea id="t-prompt" rows="4"></textarea></label><label class="wide">Texte<textarea id="t-output" rows="12" placeholder="Ton texte apparaîtra ici..."></textarea></label></div><div class="actions"><button onclick="generateText()">Générer</button><button onclick="localStorage.setItem('forge_text',$('#t-output').value);alert('Texte enregistré.')">Enregistrer</button></div>`);
}
function generateText(){
 const s=$("#t-prompt").value.trim(), type=$("#t-type").value, tone=$("#t-tone").value;
 if(!s){$("#t-output").value="Écris d'abord un sujet ou une consigne.";return;}
 $("#t-output").value=`${type} — ${tone}\n\n${s}\n\nDéveloppe cette idée avec une introduction, des éléments clairement organisés et une conclusion adaptée au sujet.`;
}

function mathTeacher(){
 shell("Professeur de mathématiques",`<div class="mathbox"><p>Choisis une opération puis réponds.</p><div class="actions"><button onclick="newMath('addition')">Addition</button><button onclick="newMath('soustraction')">Soustraction</button><button onclick="newMath('multiplication')">Multiplication</button><button onclick="newMath('division')">Division</button></div><div id="math-question"></div></div>`);
 newMath("addition");
}
function newMath(op){
 let a=Math.floor(Math.random()*90)+10,b=Math.floor(Math.random()*20)+2,q,ans;
 if(op==="addition"){q=`${a} + ${b}`;ans=a+b}
 if(op==="soustraction"){q=`${a} − ${b}`;ans=a-b}
 if(op==="multiplication"){q=`${a} × ${b}`;ans=a*b}
 if(op==="division"){a=a-a%b;q=`${a} ÷ ${b}`;ans=a/b}
 $("#math-question").innerHTML=`<h3>${q} = ?</h3><input id="m-answer" type="number"><button onclick="checkMath(${ans})">Corriger</button><p id="m-result"></p>`;
}
function checkMath(ans){const v=Number($("#m-answer").value);$("#m-result").textContent=v===ans?"Correct !":"Ce n'est pas la bonne réponse. Essaie encore.";}

home();
