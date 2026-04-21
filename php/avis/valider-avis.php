<?php
// =========================================================
// avis/valider-avis.php – Valider ou refuser un avis
// POST { avis_id, statut }  statut: 1=validé | -1=refusé
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body   = getJsonBody();
$avisId = (int)($body['avis_id'] ?? 0);
$statut = (int)($body['statut']  ?? 0);

if (!$avisId || !in_array($statut, [1, -1], true)) {
    jsonResponse(['message' => 'Données invalides.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT id FROM avis WHERE id = ? LIMIT 1');
$stmt->execute([$avisId]);
if (!$stmt->fetch()) {
    jsonResponse(['message' => 'Avis introuvable.'], 404);
}

$pdo->prepare('UPDATE avis SET valide = ? WHERE id = ?')->execute([$statut, $avisId]);

$msg = $statut === 1 ? 'Avis validé et publié.' : 'Avis refusé.';
jsonResponse(['message' => $msg]);