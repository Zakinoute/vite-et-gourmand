<?php
// =========================================================
// menus/delete-plat.php – Supprimer un plat (employé/admin)
// POST { id }
// Bloqué si le plat est lié à au moins un menu actif
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body = getJsonBody();
$id   = (int)($body['id'] ?? 0);

if (!$id) {
    jsonResponse(['message' => 'Identifiant du plat requis.'], 400);
}

$pdo = getPDO();

$check = $pdo->prepare('SELECT id FROM plats WHERE id = ? LIMIT 1');
$check->execute([$id]);
if (!$check->fetch()) {
    jsonResponse(['message' => 'Plat introuvable.'], 404);
}

// Vérifier si le plat est utilisé dans un menu actif
$stmtUsage = $pdo->prepare('
    SELECT COUNT(*) FROM menu_plats mp
    JOIN menus m ON m.id = mp.menu_id
    WHERE mp.plat_id = ? AND m.actif = 1
');
$stmtUsage->execute([$id]);
$nbUsages = (int)$stmtUsage->fetchColumn();

if ($nbUsages > 0) {
    jsonResponse([
        'message' => "Ce plat est utilisé dans {$nbUsages} menu(s) actif(s). Retirez-le des menus avant de le supprimer."
    ], 409);
}

// Supprimer les allergènes liés puis le plat
$pdo->prepare('DELETE FROM plat_allergenes WHERE plat_id = ?')->execute([$id]);
$pdo->prepare('DELETE FROM plats WHERE id = ?')->execute([$id]);

jsonResponse(['message' => 'Plat supprimé avec succès.']);