<?php
// =========================================================
// menus/get-plats.php – Liste tous les plats avec allergènes
// GET
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');

$pdo  = getPDO();
$stmt = $pdo->query('SELECT id, nom, type, description FROM plats ORDER BY type, nom');
$plats = $stmt->fetchAll();

$stmtAllerg = $pdo->prepare('
    SELECT a.id, a.nom FROM allergenes a
    JOIN plat_allergenes pa ON pa.allergene_id = a.id
    WHERE pa.plat_id = ?
    ORDER BY a.nom
');

foreach ($plats as &$plat) {
    $stmtAllerg->execute([$plat['id']]);
    $rows = $stmtAllerg->fetchAll();
    $plat['allergenes']     = array_column($rows, 'nom');
    $plat['allergenes_ids'] = array_map('intval', array_column($rows, 'id'));
}

jsonResponse($plats);