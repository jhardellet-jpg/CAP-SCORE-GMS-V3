# Backend de sécurité V3 — référence

La V2 était 100 % navigateur. Un mot de passe ou une clé secrète dans React/Vite est donc public par conception.

La V3 supprime le faux secret côté client et prépare les opérations sensibles côté serveur :
- contrôle d'accès/licence ;
- envoi email ;
- futur paiement et entitlement ;
- journalisation minimale ;
- limitation de débit.

Ne jamais placer de secret Stripe, token privé EmailJS ou mot de passe administrateur dans `VITE_*`.
Les variables `VITE_*` sont publiques dans le bundle navigateur.
