// Générateur PDF Premium CAP SCORE GMS® — V3 uniquement.
// Deux pages fixes : diagnostic puis plan d'action. Aucun changement du scoring.

import { analyserProfil, prioriser } from "./reportInterpretation.js";

const A4 = { w: 595.28, h: 841.89 };
const C = {
  navy: "#172435",
  navy2: "#243B53",
  orange: "#E97800",
  orangeLight: "#FFF3E6",
  red: "#C0392B",
  gold: "#B8862B",
  green: "#2E7D5B",
  text: "#27364A",
  muted: "#6F7C8D",
  light: "#F4F3F1",
  line: "#E5E1DC",
  white: "#FFFFFF",
  softWhite: "#DCE3EA",
};

const CONTACT = {
  name: "Jérôme Hardellet",
  role: "Conseil & accompagnement GMS — Négociation & performance commerciale",
  phone: "06 60 57 41 97",
  email: "jerome.hardellet@conseil-action-performance.fr",
};

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

function rgb(hex) {
  const h = hex.replace("#", "");
  return [0,2,4].map(i => (parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(" ");
}

function esc(s) { return winAnsiOctal(String(s ?? "")); }
function fmt(n) { return Number(n).toFixed(1).replace(/\.0$/, ""); }

function wrap(text, maxChars = 58, maxLines = Infinity) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else line = next;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const i = lines.length - 1;
    lines[i] = `${lines[i].replace(/[.,;:]?$/, "").slice(0, Math.max(0, maxChars - 2))}…`;
  }
  return lines;
}

function pdfText(x, y, text, size=9, color=C.text, bold=false) {
  return `BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${fmt(x)} ${fmt(y)} Td (${esc(text)}) Tj ET\n`;
}

function rect(x,y,w,h,fill,stroke=null,lineWidth=.7,radius=0) {
  // PDF natif sans opérateur round-rect : les cartes restent nettes avec angles sobres.
  let s = `${rgb(fill)} rg `;
  if (stroke) s += `${rgb(stroke)} RG ${lineWidth} w `;
  s += `${fmt(x)} ${fmt(y)} ${fmt(w)} ${fmt(h)} re ${stroke ? "B" : "f"}\n`;
  return s;
}

function line(x1,y1,x2,y2,color=C.line,width=.7) {
  return `${rgb(color)} RG ${width} w ${fmt(x1)} ${fmt(y1)} m ${fmt(x2)} ${fmt(y2)} l S\n`;
}

function circle(cx,cy,r,stroke,fill=null,width=1) {
  // Approximation Bézier d'un cercle.
  const k = 0.5522847498 * r;
  let s = `${rgb(stroke)} RG ${width} w `;
  if (fill) s += `${rgb(fill)} rg `;
  s += `${fmt(cx+r)} ${fmt(cy)} m `;
  s += `${fmt(cx+r)} ${fmt(cy+k)} ${fmt(cx+k)} ${fmt(cy+r)} ${fmt(cx)} ${fmt(cy+r)} c `;
  s += `${fmt(cx-k)} ${fmt(cy+r)} ${fmt(cx-r)} ${fmt(cy+k)} ${fmt(cx-r)} ${fmt(cy)} c `;
  s += `${fmt(cx-r)} ${fmt(cy-k)} ${fmt(cx-k)} ${fmt(cy-r)} ${fmt(cx)} ${fmt(cy-r)} c `;
  s += `${fmt(cx+k)} ${fmt(cy-r)} ${fmt(cx+r)} ${fmt(cy-k)} ${fmt(cx+r)} ${fmt(cy)} c `;
  s += fill ? "B\n" : "S\n";
  return s;
}

function polygon(points, stroke, fill=null, width=1) {
  if (!points.length) return "";
  let s = `${rgb(stroke)} RG ${width} w `;
  if (fill) s += `${rgb(fill)} rg `;
  s += `${fmt(points[0][0])} ${fmt(points[0][1])} m `;
  for (let i=1;i<points.length;i++) s += `${fmt(points[i][0])} ${fmt(points[i][1])} l `;
  s += "h ";
  s += fill ? "B\n" : "S\n";
  return s;
}

function textBlock(x,y,text,size=8.5,color=C.text,bold=false,maxChars=58,leading=11,maxLines=3) {
  const lines = wrap(text,maxChars,maxLines);
  let s="";
  lines.forEach((ln,i)=>{ s += pdfText(x,y-i*leading,ln,size,color,bold); });
  return { stream:s, height:lines.length*leading, lines };
}

function header(title) {
  let s="";
  s += rect(0,A4.h-92,A4.w,92,C.navy);
  s += rect(0,A4.h-92,9,92,C.orange);
  s += pdfText(38,A4.h-35,"CAP NEGO®  |  CAP Score Maturité GMS®",8.5,C.orange,true);
  s += pdfText(38,A4.h-62,title,18,C.white,true);
  s += pdfText(38,A4.h-78,"Restitution individuelle — Conseil Action Performance",8.5,"#C8D0DA");
  return s;
}

function footer(page) {
  let s = line(38,35,A4.w-38,35,C.line,.7);
  if (page === 1) s += pdfText(38,20,"CAP NEGO® — Les meilleures négociations commencent bien avant le rendez-vous.",7.3,C.muted);
  s += pdfText(A4.w-58,20,`${page}/2`,7.3,C.muted);
  return s;
}

function scoreColor(score) {
  if (score < 50) return C.orange;
  if (score < 75) return C.gold;
  return C.green;
}

function radar(scoresAxes, cx=140, cy=360, radius=65) {
  let s="";
  const n=scoresAxes.length;
  const angle = i => Math.PI/2 - 2*Math.PI*i/n;
  const pt = (i,ratio) => [cx + Math.cos(angle(i))*radius*ratio, cy + Math.sin(angle(i))*radius*ratio];
  for (const ratio of [.25,.5,.75,1]) s += polygon(scoresAxes.map((_,i)=>pt(i,ratio)),"#D9DEE5",null,.45);
  scoresAxes.forEach((_,i)=>{ const p=pt(i,1); s += line(cx,cy,p[0],p[1],"#E2E5E9",.45); });
  const data=scoresAxes.map((v,i)=>pt(i,Math.max(0,Math.min(100,v.score))/100));
  s += polygon(data,C.orange,"#FCE4CF",1.2);
  data.forEach(([x,y])=>{ s += circle(x,y,2.2,C.orange,C.orange,.5); });
  const labels=["Attractivité","Crédibilité","Maîtrise éco.","Influence & négo.","Pilotage"];
  labels.forEach((lab,i)=>{ const [x,y]=pt(i,1.35); s += pdfText(x-lab.length*1.65,y,lab,6.5,C.text,true); });
  return s;
}

function normalizeRecommendations(recommendations=[]) {
  const map = new Map(recommendations.map(r=>[r.axe?.id,r]));
  return map;
}

function recommendationBullets(items,recoMap,limit=3) {
  const out=[];
  for (const item of items) {
    const text = recoMap.get(item.axe.id)?.texte || "";
    const sentences = String(text).split(/(?<=[.!?])\s+/).filter(Boolean);
    for (const sentence of sentences) {
      if (out.length >= limit) break;
      out.push(sentence.trim());
    }
    if (out.length >= limit) break;
  }
  if (!out.length) {
    out.push(`Structurer les pratiques liées à ${items[0]?.axe?.label?.toLowerCase() || "cet axe"}.`);
  }
  return out.slice(0,limit);
}

function priorityCard(y, number, action, items, recoMap) {
  const x=38,w=A4.w-76,h=154;
  let s=rect(x,y,w,h,C.white,C.line,.7);
  s += rect(52,y+92,48,48,C.navy);
  s += pdfText(67,y+108,String(number).padStart(2,"0"),17,C.white,true);
  s += pdfText(116,y+124,`PRIORITÉ ${number} — ${action}`,8,C.orange,true);
  const title=items.map(i=>i.axe.label).join(" + ");
  const titleBlock=textBlock(116,y+103,title,10.5,C.navy,true,45,11,2);
  s += titleBlock.stream;
  const scoreLabel=items.map(i=>`${i.score}/100`).join(" — ");
  s += pdfText(A4.w-142,y+105,scoreLabel,10.5,C.orange,true);
  const bullets=recommendationBullets(items,recoMap,3);
  let yy=y+76;
  bullets.forEach(b=>{
    s += circle(119,yy+2,1.8,C.orange,C.orange,.5);
    const block=textBlock(130,yy,b,8.1,C.text,false,67,10.2,2);
    s += block.stream;
    yy -= Math.max(17,block.height+3);
  });
  return s;
}

function buildPremiumPdf({ participant={}, global=0, globalLabel="", scoresAxes=[], recommendations=[], benchmark=52 }) {
  if (!Array.isArray(scoresAxes) || scoresAxes.length !== 5) throw new Error("CAP SCORE PDF requires exactly 5 axis scores");
  const analyse=analyserProfil(scoresAxes,global);
  const priorites=prioriser(scoresAxes);
  const recoMap=normalizeRecommendations(recommendations);
  const pages=[];

  // PAGE 1 — DIAGNOSTIC
  let p1=header("VOTRE DIAGNOSTIC GMS");
  p1 += rect(38,A4.h-154,A4.w-76,43,C.light);
  p1 += pdfText(52,A4.h-128,String(participant.societe || "Entreprise").toUpperCase(),9,C.navy,true);
  const ident=[participant.prenom,participant.nom].filter(Boolean).join(" ") || "Participant";
  const details=[`${ident}${participant.fonction ? ` — ${participant.fonction}` : ""}`,participant.email,participant.ca || participant.chiffreAffaires].filter(Boolean).join("  |  ");
  const identBlock=textBlock(52,A4.h-143,details,7.7,C.muted,false,92,9,1); p1+=identBlock.stream;

  p1 += rect(38,A4.h-325,A4.w-76,150,C.white,C.line,.7);
  p1 += circle(105,A4.h-246,42,C.orange,null,8);
  p1 += circle(105,A4.h-246,34,C.white,C.white,.5);
  p1 += pdfText(88,A4.h-250,String(global),27,C.orange,true);
  p1 += pdfText(94,A4.h-264,"/100",8,C.muted);
  p1 += pdfText(166,A4.h-210,"SCORE GLOBAL",8,C.muted,true);
  p1 += pdfText(166,A4.h-237,String(globalLabel).toUpperCase(),22,global<50?C.red:global<75?C.gold:C.green,true);
  const titleBlock=textBlock(166,A4.h-260,analyse.titre,10.5,C.navy,true,43,12,2); p1+=titleBlock.stream;
  const synthBlock=textBlock(166,A4.h-290,analyse.synthese,8.2,C.muted,false,50,10,3); p1+=synthBlock.stream;
  p1 += rect(420,A4.h-291,128,76,C.orangeLight);
  p1 += pdfText(434,A4.h-235,"PRIORITÉ IMMÉDIATE",7.2,C.orange,true);
  const weakTitle=textBlock(434,A4.h-255,analyse.faible.axe.label,9.4,C.navy,true,22,10,2); p1+=weakTitle.stream;
  p1 += pdfText(434,A4.h-282,`${analyse.faible.score}/100`,16,C.orange,true);

  p1 += pdfText(38,A4.h-355,"LES 5 AXES EN UN COUP D'ŒIL",11,C.navy,true);
  p1 += rect(38,A4.h-585,205,205,C.white,C.line,.7);
  p1 += radar(scoresAxes,140,A4.h-482,65);
  const x0=263,y0=A4.h-402;
  scoresAxes.forEach(({axe,score},i)=>{
    const y=y0-i*39;
    p1 += rect(x0,y-25,294,32,C.white,C.line,.6);
    const label=axe.label.length>28?`${axe.label.slice(0,27)}…`:axe.label;
    p1 += pdfText(x0+12,y-7,label,8.1,C.navy,true);
    p1 += rect(x0+168,y-12,88,5,C.light);
    p1 += rect(x0+168,y-12,88*Math.max(0,Math.min(100,score))/100,5,scoreColor(score));
    p1 += pdfText(x0+262,y-8,`${score}/100`,8.8,scoreColor(score),true);
  });

  p1 += rect(38,75,A4.w-76,83,C.navy);
  p1 += pdfText(54,133,"CE QU'IL FAUT RETENIR",8,C.orange,true);
  const take1=textBlock(54,111,analyse.titre,9,C.white,true,82,11,2); p1+=take1.stream;
  const take2=textBlock(54,87,analyse.synthese,7.8,C.softWhite,false,94,9.4,2); p1+=take2.stream;
  p1 += footer(1);
  pages.push(p1);

  // PAGE 2 — PLAN D'ACTION
  let p2=header("VOTRE PLAN D'ACTION PRIORISÉ");
  p2 += pdfText(38,A4.h-122,"3 PRIORITÉS POUR PASSER DU DIAGNOSTIC À L'ACTION",11,C.navy,true);
  p2 += pdfText(38,A4.h-140,"Les recommandations sont classées pour concentrer l'effort là où il produira le plus d'effet.",8.5,C.muted);
  p2 += priorityCard(A4.h-300,1,"CONSOLIDER",priorites.consolider,recoMap);
  p2 += priorityCard(A4.h-485,2,"RENFORCER",priorites.renforcer,recoMap);
  p2 += priorityCard(A4.h-670,3,"CAPITALISER",priorites.capitaliser,recoMap);

  p2 += rect(38,128,180,65,C.light);
  p2 += pdfText(50,173,"REPÈRE INDICATIF",7.2,C.muted,true);
  p2 += pdfText(50,151,String(global),20,C.orange,true);
  p2 += pdfText(80,154,`vs ${benchmark}`,10.5,C.navy,true);
  const delta=global-benchmark;
  p2 += pdfText(50,137,`${delta>=0?"+":""}${delta} pts — base à consolider`,7,C.muted);

  p2 += rect(230,128,A4.w-268,65,C.orangeLight);
  p2 += pdfText(244,173,"PROCHAINE ÉTAPE",7.2,C.orange,true);
  const next = analyse.faible.score < 50
    ? `Concentrer le travail sur ${analyse.faible.axe.label.toLowerCase()}, aujourd'hui à ${analyse.faible.score}/100.`
    : `Consolider ${analyse.faible.axe.label.toLowerCase()} puis capitaliser sur ${analyse.fort.axe.label.toLowerCase()}.`;
  const nextBlock=textBlock(244,153,next,8.5,C.navy,true,48,10,2); p2+=nextBlock.stream;
  p2 += pdfText(244,134,"Levier prioritaire pour faire progresser durablement le profil GMS.",7.2,C.text);

  // Coordonnées CAP NEGO en fin de document
  p2 += rect(38,48,A4.w-76,66,C.navy);
  p2 += pdfText(52,94,"CAP NEGO® — CONSEIL ACTION PERFORMANCE",7.5,C.orange,true);
  p2 += pdfText(52,76,CONTACT.name,10,C.white,true);
  p2 += pdfText(52,60,CONTACT.role,7.3,C.softWhite);
  p2 += pdfText(355,78,`Tél. ${CONTACT.phone}`,8.4,C.white,true);
  p2 += pdfText(355,61,CONTACT.email,7,C.softWhite);
  p2 += pdfText(A4.w-58,20,"2/2",7.3,C.muted);
  pages.push(p2);

  return assemblePdf(pages);
}

function assemblePdf(pages) {
  const objects=[];
  const add=s=>{objects.push(s);return objects.length;};
  const font1=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const font2=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const contentIds=pages.map(p=>add(`<< /Length ${p.length} >>\nstream\n${p}endstream`));
  const pageIds=contentIds.map(()=>add(""));
  const pagesId=add("");
  const catalogId=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pageIds.forEach((pid,i)=>{objects[pid-1]=`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;});
  objects[pagesId-1]=`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id=>`${id} 0 R`).join(" ")}] >>`;
  let pdf="%PDF-1.4\n%CAPSCORE-PREMIUM\n";
  const offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
  const xref=pdf.length;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<=objects.length;i++) pdf+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function toBase64(binary) {
  const bytes=new TextEncoder().encode(binary);
  let s=""; const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk) s+=String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(s);
}

export function createReportPdfBase64(data) {
  return `data:application/pdf;base64,${toBase64(buildPremiumPdf(data))}`;
}

export function downloadReportPdf(data) {
  const pdf=buildPremiumPdf(data);
  const bytes=new TextEncoder().encode(pdf);
  const blob=new Blob([bytes],{type:"application/pdf"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const safe=(data.participant?.societe || "entreprise").replace(/[^a-z0-9_-]+/gi,"-");
  a.href=url;
  a.download=`CAP-SCORE-${safe}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
