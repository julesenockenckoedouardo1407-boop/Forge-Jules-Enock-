const $=s=>document.querySelector(s);
const app=document.querySelector("#app");
const money=n=>Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:2});
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

function shell(title,body){
 app.innerHTML=`<header class="topbar"><button id="back">← FORGE</button><strong>${title}</strong><button id="about">À propos</button></header><main class="workspace">${body}</main>`;
 $("#back").onclick=home;
 $("#about").onclick=()=>alert("Créé par maître Jules Enock\nContact : +509 40409680");
}
function home(){
 app.innerHTML=`<section class="hero"><div class="eyebrow">FORGE • Jules Enock</div><h1>Que veux-tu que je sois ?</h1><p>Donne-moi un rôle et FORGE construit l'outil correspondant.</p><div class="command-row"><input id="command" placeholder="Ex. Sois une calculatrice"><button id="go">FORGER</button></div><div class="chips"><button data-role="calculator">Calculatrice</button><button data-role="receipt">Bloc reçu</button><button data-role="notebook">Préparation</button><button data-role="text">Texte</button><button data-role="math">Maths</button></div><button id="aboutHome">À propos</button></section>`;
 $("#go").onclick=()=>route($("#command").value);
 $("#command").onkeydown=e=>{if(e.key==="Enter")route($("#command").value)};
 document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>render(b.dataset.role));
 $("#aboutHome").onclick=()=>alert("Créé par maître Jules Enock\nContact : +509 40409680");
}
function route(x){
 const t=(x||"").toLowerCase();
 if(t.includes("calcul"))render("calculator");
 else if(t.includes("reçu")||t.includes("recu"))render("receipt");
 else if(t.includes("préparation")||t.includes("preparation")||t.includes("cahier"))render("notebook");
 else if(t.includes("texte"))render("text");
 else if(t.includes("math")||t.includes("opération")||t.includes("operation"))render("math");
 else alert("FORGE ne reconnaît pas encore ce rôle dans cette version.");
}
function render(r){({calculator,receipt,notebook,text,math}[r]||home)();}

function calculator(){
 shell("Calculatrice",`<section class="card calculator"><input id="display" class="calc-display" readonly><div class="calc-grid">${["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","%","+","(",")","⌫","C","="].map(k=>`<button class="calc-key" data-k="${k}">${k}</button>`).join("")}</div><div id="calcResult" class="result">Prêt.</div></section>`);
 let e="";const d=$("#display"),r=$("#calcResult");const upd=()=>d.value=e;
 function calc(){
  if(!e){r.textContent="Entre une opération.";return}
  let x=e.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replace(/(\d+(?:\.\d+)?)%/g,"($1/100)");
  if(!/^[0-9+\-*/().%\s]+$/.test(x)){r.textContent="Expression non reconnue.";return}
  try{let n=Function('"use strict";return ('+x+')')();if(!Number.isFinite(n))throw 0;e=Number.isInteger(n)?String(n):String(Number(n.toFixed(10)));upd();r.textContent="Résultat : "+e}catch{r.textContent="Calcul impossible."}
 }
 document.querySelectorAll(".calc-key").forEach(b=>b.onclick=()=>{let k=b.dataset.k;if(k==="C"){e="";r.textContent="Prêt."}else if(k==="⌫")e=e.slice(0,-1);else if(k==="=")return calc();else e+=k;upd()});
}

function receipt(){
 shell("Bloc reçu",`<section class="card"><h2>Nouveau reçu</h2><div class="form-grid">
 <label>Nom du client<input id="client"></label><label>Numéro du reçu<input id="number"></label>
 <label>Date<input id="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Agent / caissier<input id="agent"></label>
 <label class="full">Description / motif<textarea id="desc"></textarea></label>
 <label>Total dû (Gdes)<input id="due" type="number" min="0" step="0.01" value="0"></label>
 <label>Montant payé (Gdes)<input id="paid" type="number" min="0" step="0.01" value="0"></label>
 <label>Mode de paiement<select id="method"><option>Espèces</option><option>MonCash</option><option>NatCash</option><option>Autre</option></select></label>
 <label>Logo sur le reçu<select id="showLogo"><option value="yes">Oui</option><option value="no">Non</option></select></label>
 <label class="full">Observation<textarea id="note"></textarea></label></div>
 <div class="conversion"><div><b>Montant payé</b><span id="gdes">0 Gdes</span></div><div><b>Équivalent</b><span id="usd">0 $ haïtien</span></div><div><b>Balance</b><span id="bal">0 Gdes</span></div></div>
 <p>Conversion automatique : <b>5 Gdes = 1 dollar haïtien</b>.</p><div class="actions"><button id="preview">Aperçu</button><button id="save">Enregistrer</button></div><div id="previewBox"></div></section>`);
 const p=$("#paid"),d=$("#due");function upd(){let a=+p.value||0,b=+d.value||0;$("#gdes").textContent=money(a)+" Gdes";$("#usd").textContent=money(a/5)+" $ haïtien";$("#bal").textContent=money(Math.max(b-a,0))+" Gdes"}p.oninput=upd;d.oninput=upd;upd();
 $("#preview").onclick=()=>{let a=+p.value||0,b=+d.value||0;$("#previewBox").innerHTML=`<div class="receipt-preview" id="receiptPrint">${$("#showLogo").value==="yes"?'<div class="logo-image"><img src="logo-imds.png" alt="Logo IMDS"></div>':""}<h2>REÇU DE PAIEMENT</h2><p><b>N° :</b> ${esc($("#number").value)}</p><p><b>Date :</b> ${esc($("#date").value)}</p><p><b>Client :</b> ${esc($("#client").value)}</p><hr><p><b>Description :</b> ${esc($("#desc").value)}</p><p><b>Total dû :</b> ${money(b)} Gdes</p><p><b>Payé :</b> ${money(a)} Gdes</p><p><b>Équivalent :</b> ${money(a/5)} $ haïtien</p><p><b>Balance :</b> ${money(Math.max(b-a,0))} Gdes</p><p><b>Paiement :</b> ${esc($("#method").value)}</p><p><b>Agent :</b> ${esc($("#agent").value)}</p><p><b>Observation :</b> ${esc($("#note").value)}</p><div class="signatures"><span>Signature client</span><span>Signature agent</span></div></div><button id="print">Imprimer</button>`;$("#print").onclick=()=>window.print()};
 $("#save").onclick=()=>{localStorage.setItem("forgeReceipt",JSON.stringify({client:$("#client").value,number:$("#number").value,date:$("#date").value,agent:$("#agent").value,desc:$("#desc").value,due:$("#due").value,paid:$("#paid").value,method:$("#method").value,logo:$("#showLogo").value,note:$("#note").value}));alert("Reçu enregistré sur cet appareil.")};
}
function notebook(){shell("Cahier de préparation",`<section class="card"><h2>Cahier de préparation</h2><label>Titre<input></label><label>Matière<input></label><label>Classe<input></label><label>Objectif<textarea></textarea><label>Déroulement<textarea rows="8"></textarea></section>`)}
function text(){shell("Générateur de texte",`<section class="card"><h2>Générateur de texte</h2><textarea id="prompt" rows="5" placeholder="Ton idée"></textarea><button onclick="document.querySelector('#output').value='Texte préparé : '+document.querySelector('#prompt').value">Générer</button><textarea id="output" rows="10"></textarea></section>`)}
function math(){shell("Professeur de mathématiques",`<section class="card"><h2>Opérations</h2><p>Cette partie permet de générer et corriger des exercices d'opérations.</p></section>`)}
home();
