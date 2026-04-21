<?php
// =========================================================
// admin/get-employes.php – Liste des employés
// GET
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');
requireAuth(['administrateur']);

$pdo  = getPDO();
$stmt = $pdo->query("
    SELECT id, nom, prenom, email, actif, created_at
    FROM users
    WHERE role = 'employe'
    ORDER BY nom, prenom
");

jsonResponse($stmt->fetchAll());