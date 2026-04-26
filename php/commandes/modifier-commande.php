<?php
// =========================================================
// commandes/modifier-commande.php
// POST { commande_id, adresse, date_prestation, heure_prestation, nb_personnes }
// Modifie une commande en_attente appartenant à l'utilisateur connecté.
// Le menu ne peut pas être changé.
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['utilisateur', 'employe', 'administrateur']);

$body          = getJsonBody();
$commandeId    = (int)($body['commande_id']    ?? 0);
$adresse       = trim($body['adresse']          ?? '');
$datePrestation= trim($body['date_prestation']  ?? '');
$heurePrestation=trim($body['heure_prestation'] ?? '');
$nbPersonnes   = (int)($body['nb_personnes']    ?? 0);

if (!$commandeId || !$adresse || !$datePrestation || !$heurePrestation || $nbPersonnes < 1) {
    jsonResponse(['message' => 'Tous les champs sont obligatoires.'], 400);
}

$pdo    = getPDO();
$userId = (int)$_SESSION['user']['id'];

// Vérifier que la commande existe, appartient à l'utilisateur et est encore en_attente
$stmt = $pdo->prepare('
    SELECT c.id, c.statut, c.menu_id, m.prix, m.nb_personnes_min
    FROM commandes c
    JOIN menus m ON m.id = c.menu_id
    WHERE c.id = ? AND c.user_id = ?
    LIMIT 1
');
$stmt->execute([$commandeId, $userId]);
$commande = $stmt->fetch();

if (!$commande) {
    jsonResponse(['message' => 'Commande introuvable.'], 404);
}
if ($commande['statut'] !== 'en_attente') {
    jsonResponse(['message' => 'Cette commande ne peut plus être modifiée (statut : ' . $commande['statut'] . ').'], 409);
}

$nbMin = (int)$commande['nb_personnes_min'];
if ($nbPersonnes < $nbMin) {
    jsonResponse(['message' => "Le nombre minimum de personnes pour ce menu est {$nbMin}."], 400);
}

// Recalcul du prix
$prixBase    = (float)$commande['prix'];
$prixMenu    = ($nbPersonnes / $nbMin) * $prixBase;
$reduction   = 0.0;

if ($nbPersonnes >= $nbMin + 5) {
    $reduction = $prixMenu * 0.1;
    $prixMenu  = $prixMenu * 0.9;
}

$dansBordeaux  = stripos($adresse, 'bordeaux') !== false;
$prixLivraison = $dansBordeaux ? 5.0 : 5.0 + 9.99; // forfait hors Bordeaux
$prixTotal     = round($prixMenu + $prixLivraison, 2);

// Mise à jour
$upd = $pdo->prepare('
    UPDATE commandes
    SET adresse          = ?,
        date_prestation  = ?,
        heure_prestation = ?,
        nb_personnes     = ?,
        prix_total       = ?,
        prix_livraison   = ?,
        reduction        = ?
    WHERE id = ?
');
$upd->execute([
    $adresse,
    $datePrestation,
    $heurePrestation,
    $nbPersonnes,
    $prixTotal,
    $prixLivraison,
    $reduction,
    $commandeId,
]);

jsonResponse(['message' => 'Commande modifiée avec succès.', 'prix_total' => $prixTotal]);
