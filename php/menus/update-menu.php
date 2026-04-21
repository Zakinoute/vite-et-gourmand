<?php
// =========================================================
// menus/update-menu.php – Modifier un menu (employé/admin)
// POST { id, titre, description, theme, regime, nb_personnes_min, prix, stock, conditions }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body = getJsonBody();

$id              = (int)($body['id']              ?? 0);
$titre           = trim($body['titre']            ?? '');
$description     = trim($body['description']      ?? '');
$theme           = trim($body['theme']            ?? '');
$regime          = trim($body['regime']           ?? 'classique');
$nb_personnes_min = (int)($body['nb_personnes_min'] ?? 1);
$prix            = (float)($body['prix']          ?? 0);
$stock           = (int)($body['stock']           ?? 0);
$conditions      = trim($body['conditions']       ?? '');
$plats_ids       = $body['plats_ids']             ?? null;

if (!$id || !$titre || !$description || !$theme || $nb_personnes_min < 1 || $prix <= 0) {
    jsonResponse(['message' => 'Champs obligatoires manquants.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT id FROM menus WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    jsonResponse(['message' => 'Menu introuvable.'], 404);
}

$pdo->prepare('
    UPDATE menus
    SET titre = ?, description = ?, theme = ?, regime = ?,
        nb_personnes_min = ?, prix = ?, stock = ?, conditions = ?
    WHERE id = ?
')->execute([$titre, $description, $theme, $regime, $nb_personnes_min, $prix, $stock, $conditions ?: null, $id]);

// Mettre à jour les plats si fournis
if (is_array($plats_ids)) {
    $pdo->prepare('DELETE FROM menu_plats WHERE menu_id = ?')->execute([$id]);
    if (!empty($plats_ids)) {
        $stmtPlat = $pdo->prepare('INSERT INTO menu_plats (menu_id, plat_id) VALUES (?, ?)');
        foreach ($plats_ids as $platId) {
            $stmtPlat->execute([$id, (int)$platId]);
        }
    }
}

jsonResponse(['message' => 'Menu mis à jour avec succès.']);