/**
 * Architecture de référence — à déployer sur une fonction serveur (Vercel/Netlify/Cloudflare/etc.).
 * Aucun secret ne doit être embarqué dans le frontend GitHub Pages.
 */
export function assertAllowedOrigin(origin, allowedOrigin) {
  if (!origin || origin !== allowedOrigin) throw new Error("Origin non autorisée");
}
export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
export function rateLimitKey(ip, email) {
  return `${ip || "unknown"}:${normalizeEmail(email)}`;
}
/*
POST /api/report
1. valider les champs + consentement ;
2. recalculer le scoring côté serveur ;
3. générer le PDF côté serveur ;
4. envoyer au répondant + CAP NEGO ;
5. ne stocker que les données nécessaires et selon une durée documentée.

POST /api/checkout
1. créer une session Stripe côté serveur ;
2. ne jamais débloquer sur simple clic client.

POST /api/stripe-webhook
1. vérifier la signature Stripe ;
2. créer l'entitlement après paiement confirmé.
*/
