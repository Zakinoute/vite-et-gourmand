<?php
// =========================================================
// menus/delete-menu.php – Supprimer un menu (soft delete)
// POST { id }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body = getJsonBody();
$id   = (int)($body['id'] ?? 0);

if (!$id) {
    jsonResponse(['message' => 'Identifiant requis.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT id FROM menus WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    jsonResponse(['message' => 'Menu introuvable.'], 404);
}

// Soft delete (le menu reste en base mais est masqué)
$pdo->prepare('UPDATE menus SET actif = 0 WHERE id = ?')->execute([$id]);

jsonResponse(['message' => 'Menu supprimé avec succès.']);