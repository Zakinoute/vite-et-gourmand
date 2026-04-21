<?php
// =========================================================
// commandes/create-commande.php – Passer une commande
// POST { menu_id, nb_personnes, adresse, date_prestation,
//        heure_prestation, nom, prenom, email, gsm }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
$sessionUser = requireAuth(['utilisateur', 'employe', 'administrateur']);

$body = getJsonBody();

$menu_id          = (int)($body['menu_id']          ?? 0);
$nb_personnes     = (int)($body['nb_personnes']     ?? 0);
$adresse          = trim($body['adresse']           ?? '');
$date_prestation  = trim($body['date_prestation']   ?? '');
$heure_prestation = trim($body['heure_prestation']  ?? '');

if (!$menu_id || $nb_personnes < 1 || !$adresse || !$date_prestation || !$heure_prestation) {
    jsonResponse(['message' => 'Données de commande incomplètes.'], 400);
}

// Valider la date (ne pas accepter une date passée)
if (strtotime($date_prestation) < strtotime('today')) {
    jsonResponse(['message' => 'La date de prestation ne peut pas être dans le passé.'], 400);
}

$pdo  = getPDO();

// ---- Récupérer le menu ----
$stmt = $pdo->prepare('SELECT * FROM menus WHERE id = ? AND actif = 1 AND stock > 0 LIMIT 1');
$stmt->execute([$menu_id]);
$menu = $stmt->fetch();

if (!$menu) {
    jsonResponse(['message' => 'Menu introuvable ou plus disponible.'], 404);
}

$nb_min = (int)$menu['nb_personnes_min'];
if ($nb_personnes < $nb_min) {
    jsonResponse(['message' => "Le nombre minimum de personnes est {$nb_min}."], 400);
}

// ---- Calcul du prix ----
$prix_base  = (float)$menu['prix'];
$prix_menu  = ($nb_personnes / $nb_min) * $prix_base;
$reduction  = 0.0;

if ($nb_personnes >= $nb_min + 5) {
    $reduction = $prix_menu * 0.1;
    $prix_menu = $prix_menu * 0.9;
}

// ---- Frais de livraison ----
// 5 € dans Bordeaux, sinon 5 € + 0.59 € / km (estimation basique)
$dans_bordeaux   = mb_stripos($adresse, 'bordeaux') !== false;
$prix_livraison  = $dans_bordeaux ? 5.00 : 5.00 + (rand(5, 30) * 0.59); // distance approximée
$prix_total      = round($prix_menu + $prix_livraison, 2);

// ---- Insérer la commande ----
$stmt = $pdo->prepare('
    INSERT INTO commandes
        (user_id, menu_id, nb_personnes, adresse, date_prestation, heure_prestation,
         prix_total, prix_livraison, reduction, statut)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "en_attente")
');
$stmt->execute([
    $sessionUser['id'], $menu_id, $nb_personnes, $adresse,
    $date_prestation, $heure_prestation . ':00',
    $prix_total, round($prix_livraison, 2), round($reduction, 2),
]);
$commandeId = (int)$pdo->lastInsertId();

// ---- Suivi initial ----
$pdo->prepare('INSERT INTO suivi_commandes (commande_id, statut) VALUES (?, "en_attente")')
    ->execute([$commandeId]);

// ---- Décrémenter le stock ----
$pdo->prepare('UPDATE menus SET stock = stock - 1 WHERE id = ?')->execute([$menu_id]);

// ---- Email de confirmation ----
$sujet = "Confirmation de votre commande #$commandeId – Vite & Gourmand";
$html  = "
<h2>Bonjour {$sessionUser['prenom']} !</h2>
<p>Nous avons bien reçu votre commande <strong>#{$commandeId}</strong>.</p>
<table border='0' cellpadding='8' style='border-collapse:collapse;'>
  <tr><td><strong>Menu</strong></td><td>{$menu['titre']}</td></tr>
  <tr><td><strong>Personnes</strong></td><td>{$nb_personnes}</td></tr>
  <tr><td><strong>Date</strong></td><td>{$date_prestation} à {$heure_prestation}</td></tr>
  <tr><td><strong>Adresse</strong></td><td>{$adresse}</td></tr>
  <tr><td><strong>Total</strong></td><td><strong>" . number_format($prix_total, 2, ',', ' ') . " €</strong></td></tr>
</table>
<p>Votre commande est <strong>en attente de validation</strong> par notre équipe. Vous recevrez un email dès qu'elle sera acceptée.</p>
<p>Merci de votre confiance !<br>Julie &amp; José – Vite &amp; Gourmand</p>
";
sendMail($sessionUser['email'], $sujet, $html);

jsonResponse([
    'message'     => 'Commande passée avec succès.',
    'commande_id' => $commandeId,
    'prix_total'  => $prix_total,
], 201);