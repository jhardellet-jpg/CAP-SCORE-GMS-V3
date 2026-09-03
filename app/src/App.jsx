import { useState } from "react";
import emailjs from "@emailjs/browser";
import { createReportPdfBase64, downloadReportPdf } from "./pdfReport.js";

const EMAILJS_SERVICE_ID  = "service_u2hv3no";
const EMAILJS_TEMPLATE_ID = "template_32diigi";
const EMAILJS_PUBLIC_KEY  = "HebR7hnW0FgEOS8Ts";

// ─── DONNÉES ────────────────────────────────────────────────────────────────

const AXES = [
  { id: 1, code: "attractivite_offre",     label: "Attractivité de l'offre" },
  { id: 2, code: "credibilite_fournisseur", label: "Crédibilité fournisseur" },
  { id: 3, code: "maitrise_economique",     label: "Maîtrise économique" },
  { id: 4, code: "influence_negociation",   label: "Influence & négociation" },
  { id: 5, code: "pilotage_strategie",      label: "Pilotage & stratégie" },
];

const QUESTIONS = [
  // AXE 1
  { id:"q1",  axe:1, type:"standard",    texte:"Je peux expliquer clairement pourquoi un consommateur choisirait mon produit plutôt qu'un concurrent." },
  { id:"q2",  axe:1, type:"standard",    texte:"Je peux démontrer que mon offre répond à une tendance de consommation durable ou émergente." },
  { id:"q3",  axe:1, type:"standard",    texte:"Je peux démontrer la valeur créée pour l'enseigne au-delà du simple prix." },
  { id:"q4",  axe:1, type:"standard",    texte:"Je peux démontrer l'impact positif de mon offre sur la croissance de la catégorie." },
  { id:"q5",  axe:1, type:"standard",    texte:"Je connais précisément les forces et faiblesses de mes principaux concurrents." },
  { id:"q6",  axe:1, type:"standard",    texte:"Mon argumentaire commercial repose sur des faits et des données plus que sur des convictions." },
  { id:"q7",  axe:1, type:"standard",    texte:"Je peux identifier la référence la plus susceptible d'être remplacée par mon offre." },
  { id:"s1",  axe:1, type:"synthese",    texte:"Par rapport à vos principaux concurrents, comment évaluez-vous votre offre ?",
    criteres:["Différenciation","Valeur pour l'enseigne","Potentiel de croissance","Connaissance du consommateur"],
    echelle:[{label:"Inférieure",val:0},{label:"Comparable",val:1},{label:"Supérieure",val:2},{label:"Je ne sais pas",val:0}] },
  // AXE 2
  { id:"q8",  axe:2, type:"standard",    texte:"Je maîtrise mon taux de service réel." },
  { id:"q9",  axe:2, type:"frequence",   texte:"Mon taux de service est suivi régulièrement." },
  { id:"q10", axe:2, type:"standard",    texte:"Je suis capable d'absorber une hausse importante des volumes sans dégrader mon niveau de service." },
  { id:"q11", axe:2, type:"standard",    texte:"Je maîtrise les contraintes logistiques nécessaires pour livrer durablement la GMS." },
  { id:"q12", axe:2, type:"standard",    texte:"Je suis capable de sécuriser une opération promotionnelle importante." },
  { id:"q13", axe:2, type:"standard",    texte:"Je dispose d'indicateurs logistiques fiables." },
  { id:"q14", axe:2, type:"standard",    texte:"Je peux identifier rapidement les principaux risques supply de mon activité." },
  { id:"s2",  axe:2, type:"synthese",    texte:"Comment évaluez-vous votre maîtrise des exigences GMS ?",
    criteres:["Taux de service","Gestion des promotions","Capacité industrielle","Conformité qualité"],
    echelle:[{label:"Faible",val:0},{label:"Moyen",val:1},{label:"Bon",val:2},{label:"Excellent",val:3}] },
  // AXE 3
  { id:"q15", axe:3, type:"standard",    texte:"Je connais précisément mes coûts de revient et mon point de rupture tarifaire." },
  { id:"q16", axe:3, type:"standard",    texte:"Je connais la rentabilité de mes principales références pour mon client." },
  { id:"q17", axe:3, type:"standard",    texte:"Je sais mesurer la rentabilité réelle d'une promotion." },
  { id:"q18", axe:3, type:"standard",    texte:"Je mesure l'impact à court et moyen terme de mes investissements promotionnels." },
  { id:"q19", axe:3, type:"standard",    texte:"Je suis capable de simuler l'impact financier d'une demande acheteur." },
  { id:"q20", axe:3, type:"standard",    texte:"Je sais identifier les produits qui créent ou détruisent de la valeur." },
  { id:"q21", axe:3, type:"situation",   texte:"Lorsqu'un acheteur demande une baisse tarifaire :",
    options:[
      {label:"Je négocie sans simulation économique préalable", val:0},
      {label:"Je réalise quelques estimations rapides", val:1},
      {label:"Je réalise une simulation financière structurée", val:2},
      {label:"Je dispose de scénarios financiers préétablis", val:3},
    ]},
  // AXE 4
  { id:"q22", axe:4, type:"standard",    texte:"Mes négociations sont préparées selon une méthode formalisée." },
  { id:"q23", axe:4, type:"standard",    texte:"J'anticipe les objections les plus probables avant un rendez-vous." },
  { id:"q24", axe:4, type:"standard",    texte:"Je prépare plusieurs scénarios de négociation." },
  { id:"q25", axe:4, type:"standard",    texte:"Je connais les véritables influenceurs de mon enseigne cible." },
  { id:"q26", axe:4, type:"standard",    texte:"J'entretiens des relations en dehors des périodes de négociation." },
  { id:"q27", axe:4, type:"standard",    texte:"Je connais précisément le calendrier réel des arbitrages de l'enseigne." },
  { id:"q28", axe:4, type:"standard",    texte:"Je suis capable d'identifier les leviers de décision avant le rendez-vous acheteur." },
  { id:"s4",  axe:4, type:"synthese",    texte:"Lors de vos négociations, votre niveau de préparation est :",
    criteres:["Connaissance de l'enseigne","Connaissance des décideurs","Préparation des objections","Scénarios alternatifs"],
    echelle:[{label:"Insuffisant",val:0},{label:"Correct",val:1},{label:"Bon",val:2},{label:"Excellent",val:3}] },
  // AXE 5
  { id:"q29", axe:5, type:"standard",    texte:"Je dispose d'une stratégie GMS formalisée." },
  { id:"q30", axe:5, type:"standard",    texte:"Je peux justifier objectivement les enseignes prioritaires pour mon développement." },
  { id:"q31", axe:5, type:"standard",    texte:"Je mesure mes performances par enseigne." },
  { id:"q32", axe:5, type:"standard",    texte:"Je mesure mes performances par produit ou gamme." },
  { id:"q33", axe:5, type:"standard",    texte:"Je transforme mes analyses en plans d'actions concrets." },
  { id:"q34", axe:5, type:"standard",    texte:"Je réalise régulièrement des revues de performance commerciale." },
  { id:"q35", axe:5, type:"situation",   texte:"Face à une opportunité commerciale qui détruit de la valeur :",
    options:[
      {label:"Je privilégie avant tout le développement du chiffre d'affaires", val:0},
      {label:"Je recherche un compromis entre croissance et rentabilité", val:1},
      {label:"J'analyse systématiquement la création de valeur avant de décider", val:2},
      {label:"Je refuse les opportunités incompatibles avec ma stratégie ou ma rentabilité", val:3},
    ]},
  { id:"s5",  axe:5, type:"synthese",    texte:"Comment évaluez-vous votre capacité à piloter votre développement GMS ?",
    criteres:["Vision stratégique","Pilotage des enseignes","Pilotage des gammes","Transformation des analyses en actions"],
    echelle:[{label:"Faible",val:0},{label:"Moyenne",val:1},{label:"Bonne",val:2},{label:"Excellente",val:3}] },
];

const ECHELLES = {
  standard:  [{label:"Pas du tout",val:0},{label:"Partiellement",val:1},{label:"En grande partie",val:2},{label:"Complètement",val:3}],
  frequence: [{label:"Jamais",val:0},{label:"Occasionnellement",val:1},{label:"Régulièrement",val:2},{label:"Systématiquement",val:3}],
};

const RECO = {
  critique:  { label:"Critique",   couleur:"#DC2626", fond:"#FEF2F2", textes:{
    attractivite_offre:"Votre offre ne se distingue pas encore clairement. Un acheteur GMS reçoit des dizaines de fiches produit par semaine — sans différenciation mesurable, la vôtre finit à la corbeille.",
    credibilite_fournisseur:"Vous ne maîtrisez pas les bases de votre fiabilité logistique. Un acheteur vous posera la question dès le premier rendez-vous — votre absence de réponse parlera plus fort que n'importe quel argument.",
    maitrise_economique:"Vous négociez sans connaître vos chiffres. C'est aller en duel sans munitions — l'acheteur en face, lui, a fait ses calculs.",
    influence_negociation:"Vos négociations ne sont pas préparées. Improviser face à un acheteur professionnel n'est pas une stratégie, c'est une capitulation programmée.",
    pilotage_strategie:"Vous n'avez pas de stratégie GMS formalisée. Sans cap défini, chaque opportunité ressemble à une priorité — et vous courez partout sauf là où ça compte.",
  }},
  fragile:   { label:"Fragile",    couleur:"#D97706", fond:"#FFFBEB", textes:{
    attractivite_offre:"Votre offre existe mais ne se défend pas encore seule en linéaire. Il manque des arguments factuels pour convaincre un category manager.",
    credibilite_fournisseur:"Vous avez des éléments de suivi logistique, mais ils restent ponctuels. C'est un strict minimum, pas un argument de négociation.",
    maitrise_economique:"Vous avez une idée de vos coûts, mais elle reste approximative. En négociation GMS, une approximation se transforme vite en concession.",
    influence_negociation:"Vous préparez vos négociations, mais sans méthode structurée. Vous laissez trop de place à l'improvisation face à des acheteurs qui, eux, sont rodés.",
    pilotage_strategie:"Vous avez des indicateurs, mais ils ne pilotent pas vraiment vos décisions. La donnée sans décision est un coût, pas un atout.",
  }},
  engagee:   { label:"Engagée",    couleur:"#CA8A04", fond:"#FEFCE8", textes:{
    attractivite_offre:"Votre positionnement est clair et tient la route. Pour passer à l'étape suivante, armez-vous de données consommateurs et de benchmarks catégorie.",
    credibilite_fournisseur:"Votre suivi logistique existe et fonctionne. Il manque encore la systématisation pour en faire un vrai levier de confiance.",
    maitrise_economique:"Vous connaissez vos économies et savez modéliser l'impact d'une décision. Affinez encore pour anticiper chaque demande acheteur avant qu'elle soit formulée.",
    influence_negociation:"Vos négociations sont préparées et structurées. Pour gagner en puissance, travaillez votre réseau d'influence en dehors des périodes de rendez-vous.",
    pilotage_strategie:"Votre pilotage est en place. La prochaine marche : transformer systématiquement vos analyses en plans d'actions avec des jalons mesurables.",
  }},
  maitrisee: { label:"Maîtrisée",  couleur:"#16A34A", fond:"#F0FDF4", textes:{
    attractivite_offre:"Vous savez pourquoi votre offre mérite sa place en linéaire et vous pouvez le démontrer avec des faits. C'est exactement ce niveau d'argumentation qui ouvre les portes des centrales.",
    credibilite_fournisseur:"Vous connaissez vos chiffres, vous les suivez, et vous pouvez les sortir en rendez-vous sans trembler. C'est ce niveau de rigueur qui rassure une centrale d'achat.",
    maitrise_economique:"Vous pilotez votre P&L GMS avec précision. Vous savez dire non à une demande qui détruit de la valeur — c'est rare, et ça se respecte.",
    influence_negociation:"Vos négociations sont préparées au centimètre. Vous connaissez vos interlocuteurs, leurs contraintes, leurs marges de manœuvre.",
    pilotage_strategie:"Vous avez une vraie vision stratégique GMS, outillée et opérationnelle. Concentrez-vous sur l'exécution et l'anticipation des prochaines batailles.",
  }},
};

// ─── CALCULS ─────────────────────────────────────────────────────────────────

function valeurItem(q, reponses) {
  if (q.type === "synthese") {
    const vals = q.criteres.map((_, i) => reponses[`${q.id}_${i}`] ?? null);
    if (vals.some(v => v === null)) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return reponses[q.id] ?? null;
}

function calculerScores(reponses) {
  const scoresAxes = AXES.map(axe => {
    const items = QUESTIONS.filter(q => q.axe === axe.id);
    const vals = items.map(q => valeurItem(q, reponses)).filter(v => v !== null);
    const somme = vals.reduce((a, b) => a + b, 0);
    const max = items.length * 3;
    return { axe, score: Math.round((somme / max) * 100), repondus: vals.length, total: items.length };
  });
  const global = Math.round(scoresAxes.reduce((a, s) => a + s.score, 0) / 5);
  return { scoresAxes, global };
}

function tranche(score) {
  if (score < 25) return "critique";
  if (score < 50) return "fragile";
  if (score < 75) return "engagee";
  return "maitrisee";
}

function estRepondu(q, reponses) {
  if (q.type === "synthese") return q.criteres.every((_, i) => reponses[`${q.id}_${i}`] !== undefined);
  return reponses[q.id] !== undefined;
}

function progression(reponses) {
  return QUESTIONS.filter(q => estRepondu(q, reponses)).length;
}

// ─── COULEURS ─────────────────────────────────────────────────────────────────

const C = { primaire:"#1A2332", accent:"#E8541A", fond:"#F7F5F2", gris:"#6B7280", bordure:"#E5E0D8" };

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────

function BtnReponse({ label, selectionne, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: selectionne ? C.accent : "#fff",
      color: selectionne ? "#fff" : C.primaire,
      border: `2px solid ${selectionne ? C.accent : C.bordure}`,
      borderRadius:8, padding:"12px 16px",
      display:"flex", alignItems:"center", gap:12,
      cursor:"pointer", textAlign:"left", width:"100%",
      fontSize:14, fontWeight:600, transition:"all 0.15s",
    }}>
      <span style={{
        width:22, height:22, borderRadius:"50%", flexShrink:0,
        background: selectionne ? "rgba(255,255,255,0.25)" : C.fond,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:800, color: selectionne ? "#fff" : C.gris,
      }}>{selectionne ? "✓" : ""}</span>
      {label}
    </button>
  );
}

function QuestionStandard({ q, reponses, onRepondre }) {
  const echelle = q.type === "frequence" ? ECHELLES.frequence : ECHELLES.standard;
  return (
    <div style={{display:"flex", flexDirection:"column", gap:8}}>
      {echelle.map(({label, val}) => (
        <BtnReponse key={val} label={label} selectionne={reponses[q.id] === val}
          onClick={() => onRepondre(q.id, val)} />
      ))}
    </div>
  );
}

function QuestionSituation({ q, reponses, onRepondre }) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap:8}}>
      {q.options.map(({label, val}) => (
        <BtnReponse key={val} label={label} selectionne={reponses[q.id] === val}
          onClick={() => onRepondre(q.id, val)} />
      ))}
    </div>
  );
}

function QuestionSynthese({ q, reponses, onRepondre }) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap:12}}>
      {q.criteres.map((critere, i) => (
        <div key={i} style={{background:"#fff", borderRadius:8, padding:"14px 16px", border:`1px solid ${C.bordure}`}}>
          <div style={{fontSize:13, fontWeight:700, color:C.primaire, marginBottom:10}}>{critere}</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {q.echelle.map(({label, val}, j) => {
              const key = `${q.id}_${i}`;
              const sel = reponses[key] === val && reponses[`${q.id}_${i}_idx`] === j;
              return (
                <button key={j} onClick={() => { onRepondre(key, val); onRepondre(`${q.id}_${i}_idx`, j); }}
                  style={{
                    padding:"8px 14px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
                    background: sel ? C.accent : C.fond,
                    color: sel ? "#fff" : C.gris,
                    border: `1.5px solid ${sel ? C.accent : C.bordure}`,
                    transition:"all 0.15s",
                  }}>{label}</button>
              );
            })}
          </div>
        </div>
      ))}
      <p style={{fontSize:11, color:C.gris, margin:0, fontStyle:"italic"}}>
        {q.criteres.length} critères à évaluer — la moyenne constituera votre score de synthèse pour cet axe.
      </p>
    </div>
  );
}

function Jauge({ score, label, taille="normal" }) {
  const t = tranche(score);
  const couleur = RECO[t].couleur;
  const grand = taille === "grand";
  return (
    <div style={{textAlign:"center"}}>
      <div style={{
        width:grand?120:80, height:grand?120:80, borderRadius:"50%",
        border:`${grand?6:4}px solid ${couleur}`,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        margin:"0 auto 8px", background:"#fff",
      }}>
        <span style={{fontSize:grand?28:20, fontWeight:900, color:couleur, lineHeight:1}}>{score}</span>
        <span style={{fontSize:grand?11:9, color:C.gris, lineHeight:1}}>/100</span>
      </div>
      {label && <div style={{fontSize:11, color:C.gris, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em"}}>{label}</div>}
      <div style={{fontSize:11, color:couleur, fontWeight:800, marginTop:2}}>{RECO[t].label}</div>
    </div>
  );
}

function RadarSVG({ scoresAxes }) {
  const cx=150, cy=150, r=108, n=scoresAxes.length;
  const angle = i => (Math.PI*2*i)/n - Math.PI/2;
  const pt = (i, v) => ({ x: cx+Math.cos(angle(i))*r*(v/100), y: cy+Math.sin(angle(i))*r*(v/100) });
  const grille = ratio => scoresAxes.map((_,i) => `${cx+Math.cos(angle(i))*r*ratio},${cy+Math.sin(angle(i))*r*ratio}`).join(" ");
  const poly = scoresAxes.map((s,i) => { const p=pt(i,s.score); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg viewBox="0 0 300 300" style={{width:"100%", maxWidth:280}}>
      {[0.25,0.5,0.75,1].map(r2 => <polygon key={r2} points={grille(r2)} fill="none" stroke={C.bordure} strokeWidth={1}/>)}
      {scoresAxes.map((_,i) => <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(angle(i))*r} y2={cy+Math.sin(angle(i))*r} stroke={C.bordure} strokeWidth={1}/>)}
      <polygon points={poly} fill={C.accent+"33"} stroke={C.accent} strokeWidth={2}/>
      {scoresAxes.map((s,i) => { const p=pt(i,s.score); return <circle key={i} cx={p.x} cy={p.y} r={4} fill={C.accent}/>; })}
      {scoresAxes.map((s,i) => {
        const lx=cx+Math.cos(angle(i))*(r+24), ly=cy+Math.sin(angle(i))*(r+24);
        const mots=s.axe.label.split(" ");
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={8.5} fill={C.primaire} fontWeight={700}>{mots.slice(0,2).join(" ")}</text>;
      })}
    </svg>
  );
}

// ─── ÉCRANS ──────────────────────────────────────────────────────────────────

const MOT_DE_PASSE = null; // V3: aucun secret d’accès n’est stocké côté navigateur.

function EcranMotDePasse({ onValider }) {
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState(false);

  const valider = () => {
    if (MOT_DE_PASSE === null || saisie === MOT_DE_PASSE) {
      onValider();
    } else {
      setErreur(true);
      setSaisie("");
    }
  };

  return (
    <div style={{minHeight:"100vh", background:C.primaire, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32}}>
      <div style={{maxWidth:400, width:"100%", textAlign:"center"}}>
        <div style={{display:"inline-block", background:C.accent, color:"#fff", fontSize:11, fontWeight:700, letterSpacing:"0.12em", padding:"6px 16px", borderRadius:2, marginBottom:32, textTransform:"uppercase"}}>
          Accès privé
        </div>
        <h1 style={{color:"#fff", fontSize:32, fontWeight:900, lineHeight:1.1, margin:"0 0 8px", letterSpacing:"-0.02em"}}>
          CAP Score<br/><span style={{color:C.accent}}>Maturité GMS®</span>
        </h1>
        <p style={{color:"#94A3B8", fontSize:14, marginBottom:36}}>Saisissez votre mot de passe pour accéder au diagnostic.</p>
        <input
          type="password"
          value={saisie}
          onChange={e => { setSaisie(e.target.value); setErreur(false); }}
          onKeyDown={e => e.key === "Enter" && valider()}
          placeholder="Mot de passe"
          style={{
            width:"100%", padding:"14px 16px", borderRadius:8, border:`2px solid ${erreur ? "#DC2626" : "rgba(255,255,255,0.15)"}`,
            background:"rgba(255,255,255,0.08)", color:"#fff", fontSize:15, fontWeight:600,
            outline:"none", boxSizing:"border-box", marginBottom:8,
          }}
        />
        {erreur && <p style={{color:"#F87171", fontSize:13, margin:"0 0 12px", fontWeight:600}}>Mot de passe incorrect. Réessayez.</p>}
        <button onClick={valider} style={{
          width:"100%", background:C.accent, color:"#fff", border:"none", borderRadius:8,
          padding:"14px", fontSize:15, fontWeight:800, cursor:"pointer",
          boxShadow:"0 4px 20px rgba(232,84,26,0.4)", marginTop: erreur ? 0 : 8,
        }}>
          Accéder →
        </button>
      </div>
    </div>
  );
}

const CA_OPTIONS = [
  "< 50 000 €",
  "50 000 € à 250 000 €",
  "250 000 € à 1 000 000 €",
  "1 000 000 € à 5 000 000 €",
  "5 000 000 € à 10 000 000 €",
  "> 10 000 000 €",
];

function EcranIdentite({ onValider }) {
  const [form, setForm] = useState({ societe:"", nom:"", prenom:"", fonction:"", email:"", ca:"" });
  const [erreurs, setErreurs] = useState({});
  const [rgpd, setRgpd] = useState(false);
  const [erreurRgpd, setErreurRgpd] = useState(false);

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErreurs(e => ({...e, [k]: false})); };

  const valider = () => {
    const e = {};
    if (!form.societe.trim()) e.societe = true;
    if (!form.nom.trim()) e.nom = true;
    if (!form.prenom.trim()) e.prenom = true;
    if (!form.fonction.trim()) e.fonction = true;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true;
    if (!form.ca) e.ca = true;
    if (!rgpd) { setErreurRgpd(true); }
    if (Object.keys(e).length > 0 || !rgpd) { setErreurs(e); return; }
    onValider(form);
  };

  const champ = (label, key, type="text", placeholder="") => (
    <div style={{display:"flex", flexDirection:"column", gap:4}}>
      <label style={{fontSize:12, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em"}}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        style={{
          padding:"12px 14px", borderRadius:8, fontSize:14, fontWeight:500,
          border:`2px solid ${erreurs[key] ? "#DC2626" : "rgba(255,255,255,0.15)"}`,
          background:"rgba(255,255,255,0.08)", color:"#fff", outline:"none",
        }}
      />
      {erreurs[key] && <span style={{fontSize:11, color:"#F87171", fontWeight:600}}>Champ requis</span>}
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:C.primaire, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32}}>
      <div style={{maxWidth:520, width:"100%"}}>
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{display:"inline-block", background:C.accent, color:"#fff", fontSize:11, fontWeight:700, letterSpacing:"0.12em", padding:"6px 16px", borderRadius:2, marginBottom:16, textTransform:"uppercase"}}>
            Vos coordonnées
          </div>
          <h2 style={{color:"#fff", fontSize:26, fontWeight:900, margin:0, letterSpacing:"-0.02em"}}>
            Avant de commencer
          </h2>
          <p style={{color:"#94A3B8", fontSize:14, marginTop:8}}>Ces informations permettent de personnaliser votre diagnostic.</p>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {champ("Nom de la société", "societe", "text", "Ex : Maison Martin")}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            {champ("Nom", "nom", "text", "Ex : Martin")}
            {champ("Prénom", "prenom", "text", "Ex : Jean")}
          </div>
          {champ("Fonction", "fonction", "text", "Ex : Directeur commercial")}
          {champ("Email", "email", "email", "Ex : jean@maison-martin.fr")}

          <div style={{display:"flex", flexDirection:"column", gap:4}}>
            <label style={{fontSize:12, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em"}}>CA Entreprise</label>
            <select
              value={form.ca}
              onChange={e => set("ca", e.target.value)}
              style={{
                padding:"12px 14px", borderRadius:8, fontSize:14, fontWeight:500,
                border:`2px solid ${erreurs.ca ? "#DC2626" : "rgba(255,255,255,0.15)"}`,
                background:"#1A2332", color: form.ca ? "#fff" : "#64748B", outline:"none", cursor:"pointer",
              }}
            >
              <option value="" disabled>Sélectionnez votre tranche de CA</option>
              {CA_OPTIONS.map(opt => <option key={opt} value={opt} style={{color:"#fff", background:"#1A2332"}}>{opt}</option>)}
            </select>
            {erreurs.ca && <span style={{fontSize:11, color:"#F87171", fontWeight:600}}>Champ requis</span>}
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            <label style={{display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer"}}>
              <input
                type="checkbox"
                checked={rgpd}
                onChange={e => { setRgpd(e.target.checked); setErreurRgpd(false); }}
                style={{marginTop:3, flexShrink:0, accentColor:C.accent, width:16, height:16, cursor:"pointer"}}
              />
              <span style={{fontSize:12, color:"#94A3B8", lineHeight:1.5}}>
                J'accepte que mes données personnelles (nom, email, société) soient utilisées par <strong style={{color:"#CBD5E1"}}>Conseil Action Performance</strong> pour me transmettre mon diagnostic et me contacter dans le cadre de ce service. Données conservées 12 mois maximum.
              </span>
            </label>
            {erreurRgpd && <span style={{fontSize:11, color:"#F87171", fontWeight:600}}>Vous devez accepter pour continuer</span>}
          </div>

          <button onClick={valider} style={{
            background:C.accent, color:"#fff", border:"none", borderRadius:8,
            padding:"14px", fontSize:15, fontWeight:800, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(232,84,26,0.4)", marginTop:4,
          }}>
            Démarrer le diagnostic →
          </button>
        </div>
      </div>
    </div>
  );
}

function EcranAccueil({ onDemarrer }) {
  return (
    <div style={{minHeight:"100vh", background:C.primaire, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32}}>
      <div style={{maxWidth:560, textAlign:"center"}}>
        <div style={{display:"inline-block", background:C.accent, color:"#fff", fontSize:11, fontWeight:700, letterSpacing:"0.12em", padding:"6px 16px", borderRadius:2, marginBottom:32, textTransform:"uppercase"}}>
          Diagnostic GMS
        </div>
        <h1 style={{color:"#fff", fontSize:42, fontWeight:900, lineHeight:1.1, margin:"0 0 16px", letterSpacing:"-0.02em"}}>
          CAP Score<br/><span style={{color:C.accent}}>Maturité GMS®</span>
        </h1>
        <p style={{color:"#94A3B8", fontSize:17, lineHeight:1.6, margin:"0 0 48px"}}>
          40 questions pour mesurer, sans complaisance, votre niveau de préparation à négocier avec la grande distribution.
        </p>
        <div style={{display:"flex", gap:12, justifyContent:"center", marginBottom:40, flexWrap:"wrap"}}>
          {["5 axes clés","40 questions","Score sur 100","Recommandations"].map(t => (
            <div key={t} style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:6, padding:"8px 16px", color:"#CBD5E1", fontSize:12, fontWeight:600}}>{t}</div>
          ))}
        </div>
        <button onClick={onDemarrer} style={{
          background:C.accent, color:"#fff", border:"none", borderRadius:6, padding:"16px 40px",
          fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px rgba(232,84,26,0.4)",
        }}>Démarrer le diagnostic →</button>
        <p style={{color:"#475569", fontSize:12, marginTop:20}}>Gratuit · Score indicatif immédiat · Rapport personnalisé inclus</p>
      </div>
    </div>
  );
}

function EcranQuestionnaire({ reponses, onRepondre, onTerminer }) {
  const [current, setCurrent] = useState(0);
  const q = QUESTIONS[current];
  const axe = AXES.find(a => a.id === q.axe);
  const prog = progression(reponses);
  const pct = Math.round((prog / QUESTIONS.length) * 100);
  const repondu = estRepondu(q, reponses);

  return (
    <div style={{minHeight:"100vh", background:C.fond, display:"flex", flexDirection:"column"}}>
      <div style={{background:"#fff", borderBottom:`1px solid ${C.bordure}`, padding:"12px 24px"}}>
        <div style={{maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", gap:16}}>
          <span style={{fontSize:12, fontWeight:800, color:C.accent, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap"}}>CAP Score®</span>
          <div style={{flex:1, height:4, background:C.bordure, borderRadius:2}}>
            <div style={{width:`${pct}%`, height:"100%", background:C.accent, borderRadius:2, transition:"width 0.3s"}}/>
          </div>
          <span style={{fontSize:12, color:C.gris, fontWeight:600, whiteSpace:"nowrap"}}>{prog}/{QUESTIONS.length}</span>
        </div>
      </div>

      <div style={{flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:24, paddingTop:32}}>
        <div style={{width:"100%", maxWidth:680}}>
          <div style={{marginBottom:10}}>
            <span style={{fontSize:11, fontWeight:800, color:C.accent, textTransform:"uppercase", letterSpacing:"0.1em"}}>
              Axe {q.axe} — {axe.label}
            </span>
            {q.type === "synthese" && <span style={{marginLeft:12, fontSize:11, background:"#EEF2FF", color:"#4338CA", padding:"2px 8px", borderRadius:4, fontWeight:700}}>Question de synthèse</span>}
          </div>

          <div style={{background:"#fff", borderRadius:12, padding:"24px 28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", marginBottom:20}}>
            <p style={{fontSize:18, fontWeight:700, color:C.primaire, lineHeight:1.5, margin:0}}>{q.texte}</p>
          </div>

          <div style={{marginBottom:28}}>
            {(q.type === "standard" || q.type === "frequence") && <QuestionStandard q={q} reponses={reponses} onRepondre={onRepondre}/>}
            {q.type === "situation" && <QuestionSituation q={q} reponses={reponses} onRepondre={onRepondre}/>}
            {q.type === "synthese" && <QuestionSynthese q={q} reponses={reponses} onRepondre={onRepondre}/>}
          </div>

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <button onClick={() => setCurrent(c => Math.max(0,c-1))} disabled={current===0} style={{
              background:"none", border:`1px solid ${C.bordure}`, borderRadius:6, padding:"10px 20px",
              cursor:current===0?"not-allowed":"pointer", color:current===0?C.bordure:C.gris, fontSize:14, fontWeight:600,
            }}>← Précédente</button>
            <button onClick={() => current < QUESTIONS.length-1 ? setCurrent(c=>c+1) : onTerminer()}
              disabled={!repondu} style={{
              background:repondu?C.primaire:C.bordure, color:"#fff", border:"none",
              borderRadius:6, padding:"10px 24px", cursor:repondu?"pointer":"not-allowed",
              fontSize:14, fontWeight:700,
            }}>
              {current===QUESTIONS.length-1 ? "Voir mes résultats →" : "Suivante →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EcranResultats({ reponses, complet, onRelancer, participant, emailStatus, onRenvoyer }) {
  const { scoresAxes, global } = calculerScores(reponses);
  const priorites = [...scoresAxes].sort((a,b) => a.score - b.score);

  return (
    <div style={{minHeight:"100vh", background:C.fond}}>
      <div style={{background:C.primaire, padding:"32px 24px"}}>
        <div style={{maxWidth:820, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:24}}>
          <div>
            <span style={{fontSize:11, fontWeight:800, color:C.accent, textTransform:"uppercase", letterSpacing:"0.1em"}}>CAP Score Maturité GMS®</span>
            <h2 style={{color:"#fff", fontSize:26, fontWeight:900, margin:"8px 0 4px", letterSpacing:"-0.02em"}}>
              Votre diagnostic complet
            </h2>
          </div>
          <Jauge score={global} label="Score global" taille="grand"/>
        </div>
      </div>

      <div style={{maxWidth:820, margin:"0 auto", padding:"28px 24px"}}>


        <div style={{display:"flex", gap:20, marginBottom:24, flexWrap:"wrap"}}>
          <div style={{background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <RadarSVG scoresAxes={scoresAxes}/>
          </div>
          <div style={{flex:1, minWidth:240, display:"flex", flexDirection:"column", gap:10}}>
            {scoresAxes.map(({axe, score}) => {
              const t = tranche(score);
              const col = RECO[t].couleur;
              return (
                <div key={axe.id} style={{background:"#fff", borderRadius:8, padding:"12px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                    <span style={{fontSize:12, fontWeight:700, color:C.primaire}}>{axe.label}</span>
                    <span style={{fontSize:15, fontWeight:900, color:col}}>{score}</span>
                  </div>
                  <div style={{height:5, background:C.fond, borderRadius:3}}>
                    <div style={{width:`${score}%`, height:"100%", background:col, borderRadius:3}}/>
                  </div>
                  <div style={{fontSize:11, color:col, fontWeight:700, marginTop:4}}>{RECO[t].label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {complet && (
          <>
            <h3 style={{fontSize:17, fontWeight:800, color:C.primaire, margin:"0 0 14px", letterSpacing:"-0.01em"}}>
              Actions prioritaires
            </h3>
            <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:24}}>
              {priorites.map(({axe, score}, idx) => {
                const t = tranche(score);
                const col = RECO[t].couleur;
                return (
                  <div key={axe.id} style={{background:"#fff", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", borderLeft:`4px solid ${col}`}}>
                    <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap"}}>
                      <span style={{background:C.fond, border:`1px solid ${C.bordure}`, borderRadius:"50%", width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:C.gris, flexShrink:0}}>{idx+1}</span>
                      <span style={{fontWeight:800, color:C.primaire, fontSize:14}}>{axe.label}</span>
                      <span style={{marginLeft:"auto", fontSize:13, fontWeight:900, color:col}}>{score}/100</span>
                      <span style={{fontSize:11, fontWeight:700, color:col, background:col+"18", padding:"2px 8px", borderRadius:4}}>{RECO[t].label}</span>
                    </div>
                    <p style={{margin:0, fontSize:13, color:"#374151", lineHeight:1.65}}>{RECO[t].textes[axe.code]}</p>
                  </div>
                );
              })}
            </div>

            <div style={{background:"#fff", borderRadius:12, padding:22, boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
              <h3 style={{fontSize:15, fontWeight:800, color:C.primaire, margin:"0 0 14px"}}>Repère indicatif</h3>
              <div style={{display:"flex", gap:24, alignItems:"center", flexWrap:"wrap"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:36, fontWeight:900, color:C.accent}}>{global}</div>
                  <div style={{fontSize:12, color:C.gris, fontWeight:600}}>Votre score</div>
                </div>
                <div style={{fontSize:20, color:C.bordure}}>vs</div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:36, fontWeight:900, color:C.gris}}>52</div>
                  <div style={{fontSize:12, color:C.gris, fontWeight:600}}>Repère actuel</div>
                </div>
                <div style={{flex:1, minWidth:180}}>
                  <div style={{fontSize:14, color:global>=52?"#16A34A":"#DC2626", fontWeight:800, marginBottom:4}}>
                    {global>=52?`+${global-52} pts au-dessus`:`${52-global} pts sous le repère`}
                  </div>
                  <div style={{fontSize:12, color:C.gris}}>Repère provisoire — base statistique à consolider</div>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{marginTop:20, background:"#fff", borderRadius:10, padding:"14px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:13, fontWeight:800, color:C.primaire, marginBottom:4}}>Envoi du rapport</div>
          <div style={{fontSize:12, color:emailStatus==="error"?"#DC2626":emailStatus==="sent"?"#16A34A":C.gris}}>
            {emailStatus==="sending" && "Envoi du rapport en cours…"}
            {emailStatus==="sent" && "Votre diagnostic a bien été transmis à CAP NEGO. Votre rapport personnalisé est disponible en téléchargement ci-dessous."}
            {emailStatus==="error" && "L’envoi a échoué. Vous pouvez télécharger le PDF immédiatement ou relancer l’envoi."}
            {emailStatus==="idle" && "Le rapport PDF est disponible au téléchargement."}
          </div>
          {emailStatus==="error" && <button onClick={onRenvoyer} style={{marginTop:10, background:"none", border:`1px solid ${C.bordure}`, borderRadius:6, padding:"8px 12px", cursor:"pointer", color:C.primaire, fontSize:12, fontWeight:700}}>Relancer l’envoi</button>}
        </div>

        <div style={{marginTop:20, display:"flex", gap:12, flexWrap:"wrap"}}>
          <button onClick={() => {
            const recommendations = scoresAxes.map(({axe, score}) => ({
              axe, score, texte: RECO[tranche(score)].textes[axe.code]
            }));
            downloadReportPdf({
              participant,
              global,
              globalLabel: RECO[tranche(global)].label,
              scoresAxes: scoresAxes.map(({axe, score}) => ({axe, score, label: RECO[tranche(score)].label})),
              recommendations
            });
          }} style={{background:C.primaire, border:"none", borderRadius:6, padding:"10px 20px", cursor:"pointer", color:"#fff", fontSize:14, fontWeight:700}}>
            Télécharger mon rapport PDF
          </button>
          <button onClick={onRelancer} style={{background:"none", border:`1px solid ${C.bordure}`, borderRadius:6, padding:"10px 20px", cursor:"pointer", color:C.gris, fontSize:14, fontWeight:600}}>
            ← Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function CAPScore() {
  const [ecran, setEcran] = useState("accueil");
  const [reponses, setReponses] = useState({});
  const [complet, setComplet] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [emailStatus, setEmailStatus] = useState("idle");

  const onRepondre = (id, val) => setReponses(r => ({...r, [id]: val}));
  const onRelancer = () => { setReponses({}); setComplet(true); setParticipant(null); setEmailStatus("idle"); setEcran("accueil"); };

  const envoyerEmail = async (reponsesFinal) => {
    setEmailStatus("sending");
    const { scoresAxes, global } = calculerScores(reponsesFinal);
    const params = {
      societe:        participant?.societe || "",
      nom:            participant?.nom || "",
      prenom:         participant?.prenom || "",
      fonction:       participant?.fonction || "",
      email_participant: participant?.email || "",
      ca:             participant?.ca || "",
      score_global:   global,
      tranche_globale: RECO[tranche(global)].label,
      score_axe1:     scoresAxes[0].score,
      tranche_axe1:   RECO[tranche(scoresAxes[0].score)].label,
      score_axe2:     scoresAxes[1].score,
      tranche_axe2:   RECO[tranche(scoresAxes[1].score)].label,
      score_axe3:     scoresAxes[2].score,
      tranche_axe3:   RECO[tranche(scoresAxes[2].score)].label,
      score_axe4:     scoresAxes[3].score,
      tranche_axe4:   RECO[tranche(scoresAxes[3].score)].label,
      score_axe5:     scoresAxes[4].score,
      tranche_axe5:   RECO[tranche(scoresAxes[4].score)].label,
    };

    try {
      const reportData = {
        participant,
        global,
        globalLabel: RECO[tranche(global)].label,
        scoresAxes: scoresAxes.map(({axe, score}) => ({
          axe, score, label: RECO[tranche(score)].label
        })),
        recommendations: scoresAxes.map(({axe, score}) => ({
          axe,
          score,
          texte: RECO[tranche(score)].textes[axe.code]
        }))
      };
      const dataUri = createReportPdfBase64(reportData);
      params.report_pdf = dataUri.split(",")[1];
      const safe = (participant?.societe || "entreprise").replace(/[^a-z0-9_-]+/gi, "-");
      params.report_filename = `CAP-SCORE-${safe}.pdf`;
    } catch (err) {
      console.error("PDF generation error:", err);
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY);
      setEmailStatus("sent");
    } catch (err) {
      console.error("EmailJS error:", err);
      setEmailStatus("error");
    }
  };

  const onTerminer = () => { setEcran("resultats"); envoyerEmail(reponses); };

  if (ecran === "accueil") return <EcranAccueil onDemarrer={() => setEcran("identite")}/>;
  if (ecran === "motdepasse") return <EcranMotDePasse onValider={() => setEcran("identite")}/>;
  if (ecran === "identite") return <EcranIdentite onValider={data => { setParticipant(data); setEcran("questionnaire"); }}/>;
  if (ecran === "questionnaire") return <EcranQuestionnaire reponses={reponses} onRepondre={onRepondre} onTerminer={onTerminer}/>;
  if (ecran === "resultats") return <EcranResultats reponses={reponses} complet={complet} onRelancer={onRelancer} participant={participant} emailStatus={emailStatus} onRenvoyer={() => envoyerEmail(reponses)}/>;
}
