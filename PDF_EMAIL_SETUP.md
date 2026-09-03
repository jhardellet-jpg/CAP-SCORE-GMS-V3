# CAP SCORE GMS V2 — Rapport PDF & double envoi email

## Statut
Cette copie de travail ajoute :
- génération d'un rapport PDF personnalisé après le questionnaire ;
- bouton de téléchargement du PDF sur l'écran résultats ;
- passage du PDF à EmailJS via le paramètre `report_pdf` ;
- adresse du participant disponible dans `to_email` et `email_participant`.

La V2 originale n'est pas modifiée.

## Configuration EmailJS indispensable
Dans le template EmailJS `template_32diigi` :

1. **Attachments** → ajouter une **Variable Attachment**.
   - Filename : `CAP-SCORE-{{societe}}.pdf`
   - Content type : `application/pdf`
   - Parameter name : `report_pdf`

2. Pour envoyer le même rapport au participant ET à Jérôme, deux options :
   - **Option recommandée :** mettre `{{to_email}}` dans **To Email**, puis renseigner l'adresse professionnelle de Jérôme dans **BCC**.
   - ou conserver le template principal envoyé à Jérôme et créer/lier un template **Auto-Reply** adressé à `{{email_participant}}` avec la même pièce jointe dynamique.

3. Tester depuis EmailJS avec une adresse de test avant publication.

## Important
Le code ne peut pas configurer à lui seul le destinataire/BCC et la pièce jointe du template EmailJS : ces paramètres sont gérés dans le tableau de bord EmailJS.

## Fichiers modifiés/ajoutés
- `app/src/App.jsx`
- `app/src/pdfReport.js` (nouveau)

## Validation locale
Installer les dépendances existantes puis lancer :

```bash
cd app
npm ci
npm run dev
```

Tester un questionnaire complet, vérifier :
- téléchargement du PDF ;
- accents et mise en page ;
- réception par le participant ;
- réception de la copie professionnelle ;
- présence de la pièce jointe dans les deux emails.

## Test technique effectué le 03/09/2026
- génération d'un PDF A4 : OK ;
- 2 pages ;
- fichier reconnu comme PDF 1.4 ;
- extraction texte : OK ;
- accents des données/recommandations : OK ;
- poids du rapport de test : environ 5,5 Ko.

## Architecture d'envoi recommandée
### Template principal (copie CAP NEGO)
- Destinataire : adresse professionnelle CAP NEGO configurée en dur dans EmailJS ;
- pièce jointe dynamique : `report_pdf` ;
- objet conseillé : `Nouveau CAP SCORE — {{societe}} — {{score_global}}/100`.

### Linked Template / Auto-Reply (répondant)
- Lier un second template au template principal depuis l'onglet Auto-Reply / Linked Template ;
- destinataire du template lié : `{{email_participant}}` ;
- réutiliser la pièce jointe dynamique `report_pdf` ;
- objet conseillé : `Votre rapport CAP SCORE GMS® — {{societe}}`.

Cette architecture permet de recevoir un exemplaire professionnel et d'envoyer automatiquement le même rapport au répondant lors d'un seul parcours utilisateur.
