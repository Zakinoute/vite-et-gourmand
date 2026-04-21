<?php
// =========================================================
// menus/get-menus.php – Liste tous les menus (avec filtres)
// GET ?theme=&regime=&prix_min=&prix_max=&personnes=
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');

$pdo = getPDO();

$where  = ['m.actif = 1'];
$params = [];

// Filtres optionnels
if (!empty($_GET['theme'])) {
    $where[]  = 'm.theme = ?';
    $params[] = $_GET['theme'];
}
if (!empty($_GET['regime'])) {
    $where[]  = 'm.regime = ?';
    $params[] = $_GET['regime'];
}
if (isset($_GET['prix_min']) && is_numeric($_GET['prix_min'])) {
    $where[]  = 'm.prix >= ?';
    $params[] = (float)$_GET['prix_min'];
}
if (isset($_GET['prix_max']) && is_numeric($_GET['prix_max'])) {
    $where[]  = 'm.prix <= ?';
    $params[] = (float)$_GET['prix_max'];
}
if (isset($_GET['personnes']) && is_numeric($_GET['personnes'])) {
    $where[]  = 'm.nb_personnes_min <= ?';
    $params[] = (int)$_GET['personnes'];
}

$whereClause = 'WHERE ' . implode(' AND ', $where);

$stmt = $pdo->prepare("
    SELECT
        m.id, m.titre, m.description, m.theme, m.regime,
        m.nb_personnes_min, m.prix, m.stock, m.conditions
    FROM menus m
    $whereClause
    ORDER BY m.titre ASC
");
$stmt->execute($params);
$menus = $stmt->fetchAll();

// Ajouter la première image de chaque menu
$stmtImg = $pdo->prepare('
    SELECT chemin FROM images_menu WHERE menu_id = ? ORDER BY ordre ASC LIMIT 1
');

foreach ($menus as &$menu) {
    $stmtImg->execute([$menu['id']]);
    $img = $stmtImg->fetchColumn();
    $menu['images'] = $img ? [$img] : [];
    $menu['prix']   = (float)$menu['prix'];
    $menu['stock']  = (int)$menu['stock'];
    $menu['nb_personnes_min'] = (int)$menu['nb_personnes_min'];
}

jsonResponse($menus);