# Sécurité CAP SCORE GMS® V3

## Corrigé dans cette V3
- la V3 ne dépend plus du mot de passe `CAPNEGO.2027` pour ouvrir le diagnostic ;
- le démarrage va directement vers l'identification ;
- aucun paiement n'est considéré comme sécurisé par un simple `setComplet(true)` ;
- les secrets futurs sont explicitement réservés au backend ;
- une architecture de référence est fournie dans `/server`.

## À ne pas confondre
La clé publique EmailJS est, par définition, utilisable côté navigateur. Elle ne doit cependant pas être assimilée à un secret.
Les opérations sensibles (paiement, licence, administration, stockage de données, clés privées) doivent être côté serveur.

## Production
Pour une V3 commercialisée avec paiement, le déblocage doit dépendre d'un entitlement serveur obtenu après confirmation du paiement. GitHub Pages peut rester le frontend, mais ne peut pas héberger ce backend.
