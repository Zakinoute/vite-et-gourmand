<?php
// =========================================================
// menus/create-plat.php – Créer un plat (employé/admin)
// POST { nom, type, description, allergenes_ids[] }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body        = getJsonBody();
$nom         = trim($body['nom']         ?? '');
$type        = trim($body['type']        ?? '');
$description = trim($body['description'] ?? '');
$allergenes  = $body['allergenes_ids']   ?? [];

$typesValides = ['entree', 'plat', 'dessert'];

if (!$nom || !in_array($type, $typesValides, true)) {
    jsonResponse(['message' => 'Nom et type (entree/plat/dessert) obligatoires.'], 400);
}

$pdo  = getPDO();

// Vérifier doublon
$check = $pdo->prepare('SELECT id FROM plats WHERE nom = ? AND type = ? LIMIT 1');
$check->execute([$nom, $type]);
if ($check->fetch()) {
    jsonResponse(['message' => 'Un plat avec ce nom et ce type existe déjà.'], 409);
}

$stmt = $pdo->prepare('
    INSERT INTO plats (nom, type, description) VALUES (?, ?, ?)
');
$stmt->execute([$nom, $type, $description ?: null]);
$platId = (int)$pdo->lastInsertId();

// Associer les allergènes
if (!empty($allergenes) && is_array($allergenes)) {
    $stmtAllerg = $pdo->prepare(
        'INSERT IGNORE INTO plat_allergenes (plat_id, allergene_id) VALUES (?, ?)'
    );
    foreach ($allergenes as $allergeneId) {
        $stmtAllerg->execute([$platId, (int)$allergeneId]);
    }
}

jsonResponse(['message' => 'Plat créé avec succès.', 'id' => $platId], 201);