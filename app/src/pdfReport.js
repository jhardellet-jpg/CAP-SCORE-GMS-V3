// Générateur PDF autonome (sans dépendance) pour CAP SCORE GMS®.
// Copie de travail uniquement — la V2 originale reste intacte.

import { analyserProfil, prioriser } from "./reportInterpretation.js";

const A4 = { w: 595.28, h: 841.89 };
const M = 46;

function winAnsiOctal(text = "") {
  const map = {"€":128,"‚":130,"ƒ":131,"„":132,"…":133,"†":134,"‡":135,"ˆ":136,"‰":137,"Š":138,"‹":139,"Œ":140,"Ž":142,"‘":145,"’":146,"“":147,"”":148,"•":149,"–":150,"—":151,"˜":152,"™":153,"š":154,"›":155,"œ":156,"ž":158,"Ÿ":159};
  let out = "";
  for (const ch of String(text)) {
    let code = map[ch] ?? ch.charCodeAt(0);
    if (code > 255) code = 63;
    if (code === 40 || code === 41 || code === 92 || code < 32 || code > 126) out += "\\" + code.toString(8).padStart(3, "0");
    else out += ch;
  }
  return out;
}

function wrap(text, max = 88) {
  const words = String(text).split(/\s+/);
  const lines = []; let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) { lines.push(line); line = w; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function rgb(hex) {
  const h = hex.replace("#", "");
  return [0,2,4].map(i => (parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(" ");
}

function lectureAxe(item, rang, total) {
  const { axe, score, label } = item;
  if (rang === 0) return `${axe.label} est l'axe le plus fragile du diagnostic (${score}/100 — ${label}). Il doit être traité en premier car il limite aujourd'hui la capacité globale de l'entreprise à aborder la GMS avec un dispositif complet.`;
  if (rang === total - 1) return `${axe.label} est le meilleur score du diagnostic (${score}/100 — ${label}). Cet acquis constitue un point d'appui à mobiliser pour faire progresser les axes moins matures.`;
  if (score < 50) return `${axe.label} reste fragile (${score}/100). Les pratiques existent partiellement mais doivent être davantage formalisées et sécurisées.`;
  if (score < 75) return `${axe.label} atteint un niveau engagé (${score}/100). Les fondamentaux sont présents ; l'enjeu est maintenant de les rendre plus systématiques, mesurables et mobilisables en négociation.`;
  return `${axe.label} atteint un niveau maîtrisé (${score}/100). Il s'agit d'un acquis à entretenir et à utiliser comme levier sur les autres dimensions.`;
}

function buildPdf({ participant, global, globalLabel, scoresAxes, recommendations, benchmark = 52 }) {
  const analyse = analyserProfil(scoresAxes, global);
  const priorites = prioriser(scoresAxes);
  const recoById = new Map(recommendations.map(r => [r.axe.id, r]));

  const pages = []; let c = ""; let y = A4.h - M;
  const newPage = () => {
    if (c) pages.push(c);
    c = ""; y = A4.h - M;
    c += `BT /F2 9 Tf ${rgb("#244563")} rg ${M.toFixed(1)} ${y.toFixed(1)} Td (${winAnsiOctal("CAP NEGO® — CAP Score Maturité GMS®")}) Tj ET\n`;
    y -= 16;
    c += `${rgb("#D1D5DB")} RG 0.8 w ${M} ${y} m ${A4.w-M} ${y} l S\n`;
    y -= 14;
  };
  const ensure = (need=70) => { if (y < M + need) newPage(); };
  const text = (s, x=M, size=10, bold=false, color="#1E293B") => {
    c += `BT /${bold?"F2":"F1"} ${size} Tf ${rgb(color)} rg ${x.toFixed(1)} ${y.toFixed(1)} Td (${winAnsiOctal(s)}) Tj ET\n`;
  };
  const para = (s, opts={}) => {
    const {size=9.2, bold=false, color="#334155", indent=0, gap=3, max=92} = opts;
    const lines = wrap(s,max); ensure(lines.length*(size+3)+12);
    lines.forEach(line => { text(line, M+indent, size, bold, color); y -= size+3; }); y -= gap;
  };
  const rule = (color="#D6B56C") => { c += `${rgb(color)} RG 0.8 w ${M} ${y} m ${A4.w-M} ${y} l S\n`; y -= 13; };
  const section = title => { ensure(36); text(title, M, 11, true, "#244563"); y -= 12; rule(); };

  // PAGE 1
  text("CAP NEGO® — CAP Score Maturité GMS®", M, 9, true, "#244563"); y -= 16;
  rule("#D1D5DB");
  text("FICHE DE DIAGNOSTIC", M, 18, true, "#244563"); y -= 23;
  text("CAP Score Maturité GMS® — Restitution individuelle", M, 11, false, "#B38B3D"); y -= 27;

  section("IDENTITÉ");
  const identity = [
    ["Société", participant?.societe || "—"],
    ["Contact", `${participant?.prenom || ""} ${participant?.nom || ""}${participant?.fonction ? " — "+participant.fonction : ""}`.trim() || "—"],
    ["Email", participant?.email || "—"],
    ["Chiffre d'affaires", participant?.ca || participant?.chiffreAffaires || "Non renseigné"]
  ];
  identity.forEach(([k,v]) => { text(k, M, 9, true, "#244563"); text(v, 170, 9, false, "#334155"); y -= 18; });
  y -= 6;

  section("SCORE GLOBAL");
  text(`${global}`, M+22, 31, true, "#244563"); text("/ 100", M+78, 11, false, "#64748B");
  text(`Statut : ${String(globalLabel).toUpperCase()}`, 240, 11, true, global<50?"#B23A2B":"#2F7D5A"); y -= 19;
  para(analyse.titre, {indent:194, max:52, bold:true});
  para(analyse.synthese, {indent:194, max:52});
  y -= 3;

  section("SCORES PAR AXE");
  scoresAxes.forEach(({axe,score,label}) => {
    ensure(27);
    text(axe.label, M, 8.7, true, "#244563");
    text(`${score}/100`, 306, 8.7, true, "#334155");
    text(label, 365, 8.7, true, score<50?"#B23A2B":score<75?"#B38B3D":"#2F7D5A");
    const bx=438, bw=100, fill=bw*score/100;
    c += `${rgb("#E5E7EB")} rg ${bx} ${y-2} ${bw} 7 re f\n${rgb(score<50?"#B23A2B":"#2F7D5A")} rg ${bx} ${y-2} ${fill.toFixed(1)} 7 re f\n`;
    y -= 19;
  });
  y -= 5;

  section("LECTURE PAR AXE");
  para("Lecture factuelle des cinq axes, des plus fragiles aux plus solides, pour aller directement à ce qui mérite l'attention en premier.", {max:91});
  analyse.sorted.forEach((item,idx) => {
    ensure(59);
    text(`${item.axe.label} — ${item.score}/100 — ${String(item.label).toUpperCase()}`, M, 9.1, true, item.score<50?"#B23A2B":"#244563"); y -= 14;
    para(lectureAxe(item,idx,analyse.sorted.length), {max:91, gap:6});
  });

  // RECOMMANDATIONS — la pagination est gérée automatiquement pour rester compacte.
  section("RECOMMANDATIONS PRIORISÉES");
  para("Ces pistes de travail sont volontairement concrètes et actionnables ; elles pourront être affinées lors d'un échange de restitution.", {max:91});

  const groups = [
    ["Priorité 1 — Consolider", priorites.consolider],
    ["Priorité 2 — Renforcer", priorites.renforcer],
    ["Priorité 3 — Capitaliser", priorites.capitaliser]
  ];
  groups.forEach(([title, items]) => {
    ensure(82);
    const label = items.map(i => `${i.axe.label} (${i.score})`).join(" et ");
    text(`${title} — ${label}`, M, 9.7, true, "#244563"); y -= 16;
    items.forEach(item => {
      const r = recoById.get(item.axe.id);
      if (r?.texte) {
        const chunks = String(r.texte).split(/(?<=[.!?])\s+/).filter(Boolean).slice(0,2);
        chunks.forEach(t => para(`— ${t}`, {indent:5, max:89, gap:2}));
      }
    });
    y -= 5;
  });

  section("BENCHMARK INDICATIF");
  para(`Votre CAP Score est de ${global}/100. Le repère actuellement affiché dans l'application est de ${benchmark}/100, soit un écart de ${global-benchmark>=0?"+":""}${global-benchmark} points. Ce benchmark reste indicatif tant que sa base statistique n'est pas documentée et consolidée.`, {max:91});

  section("PROCHAINE ÉTAPE");
  const next = analyse.faible.score < 50
    ? `Concentrer en priorité le travail sur ${analyse.faible.axe.label.toLowerCase()}, aujourd'hui à ${analyse.faible.score}/100. C'est le levier le plus ciblé pour réduire le principal écart du profil.`
    : `Consolider ${analyse.faible.axe.label.toLowerCase()}, axe le moins avancé du profil (${analyse.faible.score}/100), puis capitaliser sur ${analyse.fort.axe.label.toLowerCase()} pour renforcer l'ensemble de la démarche GMS.`;
  para(next, {max:91});
  y -= 8;
  rule("#D1D5DB");
  para("CAP NEGO® — Conseil Action Performance | Les meilleures négociations commencent bien avant le rendez-vous.", {size:8,color:"#64748B",max:96});

  if (c) pages.push(c);

  const objects = [];
  const add = s => { objects.push(s); return objects.length; };
  const font1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const font2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const contentIds = pages.map(p => add(`<< /Length ${p.length} >>\nstream\n${p}endstream`));
  const pageIds = contentIds.map(() => add(""));
  const pagesId = add("");
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pageIds.forEach((pid,i) => { objects[pid-1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`; });
  objects[pagesId-1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id=>`${id} 0 R`).join(" ")}] >>`;

  let pdf = "%PDF-1.4\n%CAPSCORE\n"; const offsets=[0];
  objects.forEach((obj,i)=>{ offsets.push(pdf.length); pdf += `${i+1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<=objects.length;i++) pdf += `${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function toBase64(binary) {
  const bytes = new TextEncoder().encode(binary);
  let s=""; const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk) s += String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(s);
}

export function createReportPdfBase64(data) { return `data:application/pdf;base64,${toBase64(buildPdf(data))}`; }

export function downloadReportPdf(data) {
  const pdf = buildPdf(data);
  const bytes = new TextEncoder().encode(pdf);
  const blob = new Blob([bytes], {type:"application/pdf"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = (data.participant?.societe || "entreprise").replace(/[^a-z0-9_-]+/gi,"-");
  a.href=url; a.download=`CAP-SCORE-${safe}.pdf`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
