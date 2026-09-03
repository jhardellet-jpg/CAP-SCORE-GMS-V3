# CAP SCORE GMS® V2 — Livrable Rapport PDF automatique

Cette version est une copie de développement distincte : la V2 originale reste inchangée.

## Fonctionnalités livrées
- rapport PDF personnalisé A4 sur 2 pages ;
- identité entreprise / répondant ;
- score global, statut et scores des 5 axes ;
- interprétation automatique du profil ;
- lecture des axes du plus fragile au plus solide ;
- recommandations priorisées : Consolider / Renforcer / Capitaliser ;
- benchmark présenté comme indicatif ;
- prochaine étape personnalisée ;
- téléchargement direct ;
- envoi du PDF via EmailJS ;
- statut d'envoi visible et relance en cas d'échec.

## Validation réalisée
- syntaxe des modules PDF/interprétation : OK ;
- génération PDF : OK ;
- PDF 1.4 A4 : OK ;
- 2 pages : OK ;
- extraction texte et accents : OK ;
- rendu visuel des deux pages : contrôlé ;
- scénario de validation Ferme de Grignon : 57/100, axes 55/72/57/33/67.

## Configuration EmailJS à faire une seule fois
Template principal `template_32diigi` :
1. conserver l'adresse CAP NEGO comme destinataire principal ;
2. Attachments > Variable Attachment :
   - Filename : `CAP-SCORE-{{societe}}.pdf`
   - Content type : `application/pdf`
   - Parameter name : `report_pdf`
3. créer un template participant :
   - To Email : `{{email_participant}}`
   - pièce jointe dynamique : `report_pdf`
4. lier ce template au principal via Linked Template / Auto-Reply.

Un seul envoi depuis CAP SCORE déclenche alors l'exemplaire CAP NEGO et l'exemplaire répondant avec le même PDF.

## Avant publication
```bash
cd app
npm ci
npm run build
npm run lint
```
Puis effectuer un test réel avec deux boîtes email.

## Hors périmètre volontaire
Le mot de passe et le mécanisme commercial de déblocage de la V2 n'ont pas été refondus afin de ne pas modifier le modèle existant. Leur sécurisation reste un chantier séparé.
