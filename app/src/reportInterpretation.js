export function analyserProfil(scoresAxes, global) {
  const sorted = [...scoresAxes].sort((a,b) => a.score-b.score);
  const faible = sorted[0], suivant = sorted[1], fort = sorted[sorted.length-1];
  const amplitude = fort.score-faible.score;
  const rupture = suivant.score-faible.score;
  if (rupture >= 15) return {type:"rupture", titre:"Profil globalement structuré avec un point de rupture net.", synthese:`${faible.axe.label} décroche à ${faible.score}/100, soit ${rupture} points sous l’axe immédiatement supérieur. Le reste du profil est plus homogène : la priorité est donc ciblée plutôt que diffuse.`, sorted, faible, fort};
  if (amplitude <= 15) return {type:"homogene", titre:"Profil homogène : les cinq dimensions évoluent à des niveaux proches.", synthese:`L’écart entre le meilleur et le moins bon axe n’est que de ${amplitude} points. Le plan de progrès doit donc être transversal, en commençant par ${faible.axe.label.toLowerCase()}.`, sorted, faible, fort};
  if (global >= 75) return {type:"mature", titre:"Profil mature avec quelques leviers de consolidation.", synthese:`Le socle GMS est solide. L’enjeu principal consiste à consolider ${faible.axe.label.toLowerCase()} tout en capitalisant sur ${fort.axe.label.toLowerCase()}, meilleur axe du diagnostic.`, sorted, faible, fort};
  if (global < 50) return {type:"fragile", titre:"Profil encore fragile : plusieurs fondamentaux doivent être sécurisés.", synthese:`Le score global de ${global}/100 appelle une priorisation stricte. ${faible.axe.label} constitue le premier chantier avant d’élargir progressivement aux autres dimensions.`, sorted, faible, fort};
  return {type:"contraste", titre:"Profil engagé, mais encore contrasté selon les dimensions.", synthese:`Le profil montre des acquis réels, avec ${fort.axe.label.toLowerCase()} comme point d’appui. ${faible.axe.label} reste le premier levier de progression.`, sorted, faible, fort};
}

export function prioriser(scoresAxes) {
  const s=[...scoresAxes].sort((a,b)=>a.score-b.score);
  return {consolider:[s[0]], renforcer:s.slice(1,3), capitaliser:s.slice(3).reverse()};
}
