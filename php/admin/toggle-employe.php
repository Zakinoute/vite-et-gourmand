<?php
// =========================================================
// admin/toggle-employe.php – Activer / Désactiver un employé
// POST { employe_id, actif: true|false }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['administrateur']);

$body      = getJsonBody();
$employeId = (int)($body['employe_id'] ?? 0);
$actif     = isset($body['actif']) ? (bool)$body['actif'] : null;

if (!$employeId || $actif === null) {
    jsonResponse(['message' => 'Données invalides.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'employe' LIMIT 1");
$stmt->execute([$employeId]);
if (!$stmt->fetch()) {
    jsonResponse(['message' => 'Employé introuvable.'], 404);
}

$pdo->prepare('UPDATE users SET actif = ? WHERE id = ?')->execute([$actif ? 1 : 0, $employeId]);

$msg = $actif ? 'Compte employé réactivé.' : 'Compte employé désactivé.';
jsonResponse(['message' => $msg]);