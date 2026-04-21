<?php
// =========================================================
// menus/get-allergenes.php – Liste tous les allergènes
// GET
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');

$pdo  = getPDO();
$stmt = $pdo->query('SELECT id, nom FROM allergenes ORDER BY nom');

jsonResponse($stmt->fetchAll());