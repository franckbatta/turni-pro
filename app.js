let dati = [], mesi = [], mIdx = 0, cur = -1;

function isExpired() {
  if (localStorage.getItem("tpUnlocked") === "true") return false;
  let start = localStorage.getItem("tpTrialStart");
  if (!start) { start = Date.now(); localStorage.setItem("tpTrialStart", start); }
  const giorni = (Date.now() - Number(start)) / (1000 * 60 * 60 * 24);
  return giorni > 7;
}

function aggiornaBannerProva() {
  const b = document.getElementById("trialBanner");
  if (!b) return;
  if (localStorage.getItem("tpUnlocked") === "true") { b.style.display = "none"; return; }
  let start = Number(localStorage.getItem("tpTrialStart") || Date.now());
  let rimasti = Math.ceil(7 - (Date.now() - start) / (1000 * 60 * 60 * 24));
  b.style.display = "block";
  b.innerText = rimasti > 0 ? "Prova gratuita attiva: " + rimasti + " giorni rimasti" : "Prova scaduta: modalità sola lettura";
}

function avviaAcquisto() {
  // Qui collegheremo il pagamento nativo Google Play / Apple StoreKit
  alert("Collegamento allo Store per lo sblocco definitivo (2,99 €).");
}

function parseSchema(t) {
  let s = [];
  for (let p of t.toUpperCase().split(",")) {
    let parti = p.trim().split(/\s+/);
    if (parti.length !== 2) return null;
    let qta = parseInt(parti.shift(), 10);
    let tipo = parti.pop();
    if (isNaN(qta) || !["1T", "2T", "3T", "G", "R", "S", "F", "M"].includes(tipo)) return null;
    for (let i = 0; i < qta; i++) s.push(tipo);
  }
  return s.length ? s : null;
}

function getFest(d) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), g = String(d.getDate()).padStart(2,'0');
  const f = {"01-01":"Capodanno","01-06":"Epifania","04-25":"Liberazione","05-01":"Lavoratori","06-02":"Repubblica","08-15":"Ferragosto","11-01":"Ognissanti","12-08":"Immacolata","12-25":"Natale","12-26":"S.Stefano"};
  if (f[m+"-"+g]) return f[m+"-"+g];
  const a=y%19, b=Math.floor(y/100), c=y%100, d1=Math.floor(b/4), e=b%4, f1=Math.floor((b+8)/25), g1=Math.floor((b-f1+1)/3), h=(19*a+b-d1-g1+15)%30, i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m1=Math.floor((a+11*h+22*l)/451);
  const mp=Math.floor((h+l-7*m1+114)/31), gp=((h+l-7*m1+114)%31)+1;
  if (d.getTime() === new Date(y, mp-1, gp).getTime()) return "Pasqua";
  if (d.getTime() === new Date(y, mp-1, gp+1).getTime()) return "Pasquetta";
  return "";
}

function getColorMap() {
  return {
    "1T": document.getElementById("c1").value,
    "2T": document.getElementById("c2").value,
    "3T": document.getElementById("c3").value,
    "G":  document.getElementById("cG").value,
    "R":  document.getElementById("cR").value,
    "S":  document.getElementById("cS").value,
    "F":  document.getElementById("cF").value,
    "M":  document.getElementById("cM").value
  };
}


function aggiornaColori() {
  saveDB();
  if (dati.length) draw();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  document.getElementById("themeBtn").innerText = isDark ? "☀️" : "🌙";
  localStorage.setItem("tpTheme", isDark ? "dark" : "light");
}

function roundOre(val) {
  return Math.round(val * 100) / 100;
}

window.onload = () => {
  isExpired();
  aggiornaBannerProva();
  if (localStorage.getItem("tpTheme") === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").innerText = "☀️";
  }
  const s = localStorage.getItem("tpDB");
  if (s) {
    const p = JSON.parse(s);
    if (p.sc) document.getElementById("sc").value = p.sc;
    if (p.sd) document.getElementById("sd").value = p.sd;
    if (p.cS) document.getElementById("cS").value = p.cS;
    if (p.dur) document.getElementById("durata").value = p.dur;
    if (p.o1) document.getElementById("o1").value = p.o1;
    if (p.o2) document.getElementById("o2").value = p.o2;
    if (p.o3) document.getElementById("o3").value = p.o3;
    if (p.c1) document.getElementById("c1").value = p.c1;
    if (p.c2) document.getElementById("c2").value = p.c2;
    if (p.c3) document.getElementById("c3").value = p.c3;
    if (p.cR) document.getElementById("cR").value = p.cR;
	if (p.oG) document.getElementById("oG").value = p.oG; 
    if (p.cG) document.getElementById("cG").value = p.cG; 
    if (p.cF) document.getElementById("cF").value = p.cF; 
    if (p.cM) document.getElementById("cM").value = p.cM;
    dati = p.dati || [];
    if (dati.length) startView(true);
  }
};

function saveDB() {
  localStorage.setItem("tpDB", JSON.stringify({
    sc: document.getElementById("sc").value, sd: document.getElementById("sd").value, dur: document.getElementById("durata").value,
    o1: document.getElementById("o1").value, o2: document.getElementById("o2").value, o3: document.getElementById("o3").value, oG: document.getElementById("oG").value,
    c1: document.getElementById("c1").value, c2: document.getElementById("c2").value, c3: document.getElementById("c3").value, cG: document.getElementById("cG").value,
    cR: document.getElementById("cR").value, cS: document.getElementById("cS").value, cF: document.getElementById("cF").value, cM: document.getElementById("cM").value,
    dati
  }));
}


function toggleSet() {
  if (!dati.length) return;
  const b = document.getElementById("setBox");
  b.style.display = b.style.display === "none" ? "block" : "none";
}

function genera() {
  if (isExpired()) { document.getElementById("lockBg").style.display = "flex"; return; }
  const ciclo = parseSchema(document.getElementById("sc").value);
  if (!ciclo) return alert("Schema non valido! Usa il formato: 6 1T, 1 R, 4 3T...");
  const [y, m, g] = document.getElementById("sd").value.split("-").map(Number);
  if (!y) return alert("Data mancante!");
  const start = new Date(y, m-1, g);
  dati = [];
  const giorniTotali = parseInt(document.getElementById("durata").value, 10) || 365;
  for (let i = 0; i < giorniTotali; i++) {
    let dt = new Date(start); dt.setDate(start.getDate() + i);
    let yy = dt.getFullYear(), mm = String(dt.getMonth()+1).padStart(2,'0'), dd = String(dt.getDate()).padStart(2,'0');
    dati.push({ idx: i, y: yy, m: dt.getMonth(), d: dt.getDate(), dow: (dt.getDay()+6)%7, iso: yy+"-"+mm+"-"+dd, mese: yy+"-"+mm, tipo: ciclo[i%ciclo.length], fest: getFest(dt), ext: 0 });
  }
  saveDB();
  startView(true);
}

function startView(hide) {
  mesi = [...new Set(dati.map(x => x.mese))];
  mIdx = 0;
  document.getElementById("mainView").style.display = "block";
  if (hide) document.getElementById("setBox").style.display = "none";
  draw();
}

function step(dir) {
  if (mIdx + dir >= 0 && mIdx + dir < mesi.length) { mIdx += dir; draw(); }
}

function draw() {
  const mk = mesi[mIdx], [y, mo] = mk.split("-").map(Number);
  const colori = getColorMap();
  document.getElementById("mTitle").innerText = new Date(y, mo-1, 1).toLocaleDateString("it-IT", {month:"long", year:"numeric"});
  const list = dati.filter(x => x.mese === mk);
  const gr = document.getElementById("grid");
  gr.innerHTML = "";
  const off = (new Date(y, mo-1, 1).getDay() + 6) % 7;
  for (let i = 0; i < off; i++) gr.innerHTML += '<div class="cell empty"></div>';
  let ord = 0, ext = 0, fest = 0;
  list.forEach(t => {
    let oreGiorno = getMinutiTurno(t.tipo) / 60;
    if (t.tipo === "S") { ext += 8; if (t.fest || t.dow === 6) fest += 8; }
    else if (!["R", "F", "M"].includes(t.tipo)) { ord += oreGiorno; if (t.fest || t.dow === 6) fest += oreGiorno; }
    ext += t.ext;
    let bg = colori[t.tipo] || "#64748b";
    gr.innerHTML += '<div class="cell '+(t.fest?'fest':'')+'" onclick="openMod('+t.idx+')"><div style="font-size:12px;font-weight:bold;">'+t.d+'</div><div class="pill" style="background:'+bg+'">'+t.tipo+'</div>'+(t.ext>0?'<div class="ext">+'+t.ext+'h S</div>':'<div></div>')+'</div>';
  });

  document.getElementById("sOrd").innerHTML = roundOre(ord) + "h<span>Ordinarie</span>";
  document.getElementById("sExt").innerHTML = roundOre(ext) + "h<span>Extra</span>";
  document.getElementById("sFest").innerHTML = roundOre(fest) + "h<span>Festive</span>";
}

function openMod(i) {
  if (isExpired()) { document.getElementById("lockBg").style.display = "flex"; return; }
  cur = i;
  const t = dati[i];
  document.getElementById("mData").innerText = t.d + "/" + (t.m+1) + "/" + t.y;
  document.getElementById("mFest").innerText = t.fest;
  document.getElementById("mTipo").value = t.tipo;
  document.getElementById("mExt").value = t.ext;
  document.getElementById("mBg").style.display = "flex";
}

function salvaMod() {
  dati[cur].tipo = document.getElementById("mTipo").value;
  dati[cur].ext = Math.max(0, parseFloat(document.getElementById("mExt").value) || 0);
  saveDB();
  document.getElementById("mBg").style.display = "none";
  draw();
}

function getMinutiTurno(tipo) {
  if (["R", "F", "M"].includes(tipo)) return 0;
  let idEl = tipo === "G" ? "oG" : "o" + tipo.charAt(0);
  let el = document.getElementById(idEl);
  if (!el) return 480;
  let parti = el.value.split("-");
  if (parti.length !== 2) return 480;
  let [h1, m1] = parti[0].trim().split(":").map(Number);
  let [h2, m2] = parti[1].trim().split(":").map(Number);
  if (isNaN(h1) || isNaN(h2)) return 480;
  return ((h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0)) + 1440) % 1440 || 480;
}


function esporta() {
  if (localStorage.getItem("tpUnlocked") !== "true") {
    document.getElementById("lockBg").style.display = "flex";
    return;
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TurniPro//IT\n";
  dati.forEach((t, idx) => {
    let d = t.iso.replace(/-/g, ""), nf = t.fest ? " ["+t.fest+"]" : "";
    let uid = "turnipro-" + d + "-" + idx + "@turnipro.local";
    if (["R", "F", "M"].includes(t.tipo)) {
      let nomeEv = t.tipo === "F" ? "Ferie (F)" : (t.tipo === "M" ? "Malattia (M)" : "Riposo (R)");
      ics += "BEGIN:VEVENT\nUID:"+uid+"\nDTSTAMP:"+stamp+"\nDTSTART;VALUE=DATE:"+d+"\nSUMMARY:"+nomeEv+(t.ext>0?" (Extra "+t.ext+"h)":"")+nf+"\nEND:VEVENT\n";
    } else if (t.tipo === "S") {
      let dur = Math.round((8 + t.ext) * 60);
      ics += "BEGIN:VEVENT\nUID:"+uid+"\nDTSTAMP:"+stamp+"\nDTSTART:"+d+"T070000\nDURATION:PT"+dur+"M\nSUMMARY:Straordinario (S)"+(t.ext>0?" + "+t.ext+"h":"")+nf+"\nEND:VEVENT\n";
    } else {
      let idEl = t.tipo === "G" ? "oG" : "o" + t.tipo.charAt(0);
      let orarioStr = document.getElementById(idEl).value;
      let ini = orarioStr.split("-")[0].trim().replace(":", "") + "00";
      let dur = Math.round(getMinutiTurno(t.tipo) + (t.ext * 60));
      ics += "BEGIN:VEVENT\nUID:"+uid+"\nDTSTAMP:"+stamp+"\nDTSTART:"+d+"T"+ini+"\nDURATION:PT"+dur+"M\nSUMMARY:Turno "+t.tipo+(t.ext>0?" + "+t.ext+"h Extra":"")+nf+"\nEND:VEVENT\n";
    }

  });
  ics += "END:VCALENDAR";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], {type:"text/calendar"}));
  a.download = "turni_pro.ics";
  a.click();
}