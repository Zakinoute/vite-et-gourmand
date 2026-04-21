<?php
// =========================================================
// menus/create-menu.php – Créer un menu (employé/admin)
// POST { titre, description, theme, regime, nb_personnes_min, prix, stock, conditions }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body = getJsonBody();

$titre           = trim($body['titre']           ?? '');
$description     = trim($body['description']     ?? '');
$theme           = trim($body['theme']           ?? '');
$regime          = trim($body['regime']          ?? 'classique');
$nb_personnes_min = (int)($body['nb_personnes_min'] ?? 1);
$prix            = (float)($body['prix']         ?? 0);
$stock           = (int)($body['stock']          ?? 0);
$conditions      = trim($body['conditions']      ?? '');
$plats_ids       = $body['plats_ids']            ?? [];

if (!$titre || !$description || !$theme || $nb_personnes_min < 1 || $prix <= 0) {
    jsonResponse(['message' => 'Champs obligatoires manquants.'], 400);
}

$themes_valides  = ['noel', 'paques', 'classique', 'evenement'];
$regimes_valides = ['classique', 'vegetarien', 'vegan'];

if (!in_array($theme, $themes_valides, true) || !in_array($regime, $regimes_valides, true)) {
    jsonResponse(['message' => 'Thème ou régime invalide.'], 400);
}

$pdo = getPDO();

$stmt = $pdo->prepare('
    INSERT INTO menus (titre, description, theme, regime, nb_personnes_min, prix, stock, conditions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([$titre, $description, $theme, $regime, $nb_personnes_min, $prix, $stock, $conditions ?: null]);
$menuId = (int)$pdo->lastInsertId();

// Associer les plats
if (!empty($plats_ids) && is_array($plats_ids)) {
    $stmtPlat = $pdo->prepare('INSERT IGNORE INTO menu_plats (menu_id, plat_id) VALUES (?, ?)');
    foreach ($plats_ids as $platId) {
        $stmtPlat->execute([$menuId, (int)$platId]);
    }
}

jsonResponse(['message' => 'Menu créé avec succès.', 'id' => $menuId], 201);