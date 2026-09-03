# CAP SCORE GMS® V3 — Release candidate

## Socle
V3 créée physiquement à partir d'une copie de la V2 originale. La V2 n'a pas été modifiée.

## Évolutions
- rapport PDF automatique personnalisé ;
- moteur d'interprétation du profil ;
- recommandations priorisées ;
- téléchargement du rapport ;
- préparation du double envoi CAP NEGO + répondant ;
- suppression du mot de passe codé en clair comme mécanisme d'accès ;
- suppression du principe de faux paiement comme sécurité ;
- architecture backend documentée pour paiement/licence/secrets ;
- documentation EmailJS et modèle d'email participant.

## Choix méthodologique
Les 40 questions et le scoring V2 sont conservés pour ne pas mélanger sécurisation technique et refonte méthodologique.

## Statut
Release candidate de préproduction.
Avant publication commerciale : build/lint dans un environnement Node avec dépendances, configuration EmailJS, test réel double email et décision sur le backend de paiement/licence.
