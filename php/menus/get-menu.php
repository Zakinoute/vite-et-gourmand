<?php
// =========================================================
// menus/get-menu.php – Détail d'un menu (avec plats + allergènes)
// GET ?id=
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    jsonResponse(['message' => 'Identifiant invalide.'], 400);
}

$pdo  = getPDO();

// ---- Menu ----
$stmt = $pdo->prepare('SELECT * FROM menus WHERE id = ? AND actif = 1 LIMIT 1');
$stmt->execute([$id]);
$menu = $stmt->fetch();

if (!$menu) {
    jsonResponse(['message' => 'Menu introuvable.'], 404);
}

$menu['prix']             = (float)$menu['prix'];
$menu['stock']            = (int)$menu['stock'];
$menu['nb_personnes_min'] = (int)$menu['nb_personnes_min'];

// ---- Images ----
$stmtImg = $pdo->prepare('SELECT chemin FROM images_menu WHERE menu_id = ? ORDER BY ordre ASC');
$stmtImg->execute([$id]);
$menu['images'] = $stmtImg->fetchAll(PDO::FETCH_COLUMN);

// ---- Plats avec leurs allergènes ----
$stmtPlats = $pdo->prepare('
    SELECT p.id, p.nom, p.type, p.description
    FROM plats p
    JOIN menu_plats mp ON mp.plat_id = p.id
    WHERE mp.menu_id = ?
    ORDER BY FIELD(p.type, "entree", "plat", "dessert"), p.nom
');
$stmtPlats->execute([$id]);
$plats = $stmtPlats->fetchAll();

$stmtAllerg = $pdo->prepare('
    SELECT a.nom
    FROM allergenes a
    JOIN plat_allergenes pa ON pa.allergene_id = a.id
    WHERE pa.plat_id = ?
');

$tousAllergenes = [];

foreach ($plats as &$plat) {
    $stmtAllerg->execute([$plat['id']]);
    $plat['allergenes'] = $stmtAllerg->fetchAll(PDO::FETCH_COLUMN);
    $tousAllergenes     = array_merge($tousAllergenes, $plat['allergenes']);
}

$menu['plats']     = $plats;
$menu['allergenes'] = array_values(array_unique($tousAllergenes));

jsonResponse($menu);