<?php
// =========================================================
// menus/update-plat.php – Modifier un plat (employé/admin)
// POST { id, nom, type, description, allergenes_ids[] }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body        = getJsonBody();
$id          = (int)($body['id']          ?? 0);
$nom         = trim($body['nom']          ?? '');
$type        = trim($body['type']         ?? '');
$description = trim($body['description']  ?? '');
$allergenes  = $body['allergenes_ids']    ?? null;

$typesValides = ['entree', 'plat', 'dessert'];

if (!$id || !$nom || !in_array($type, $typesValides, true)) {
    jsonResponse(['message' => 'Id, nom et type obligatoires.'], 400);
}

$pdo  = getPDO();

$check = $pdo->prepare('SELECT id FROM plats WHERE id = ? LIMIT 1');
$check->execute([$id]);
if (!$check->fetch()) {
    jsonResponse(['message' => 'Plat introuvable.'], 404);
}

$pdo->prepare('
    UPDATE plats SET nom = ?, type = ?, description = ? WHERE id = ?
')->execute([$nom, $type, $description ?: null, $id]);

// Mettre à jour les allergènes si fournis
if (is_array($allergenes)) {
    $pdo->prepare('DELETE FROM plat_allergenes WHERE plat_id = ?')->execute([$id]);
    if (!empty($allergenes)) {
        $stmtAllerg = $pdo->prepare(
            'INSERT IGNORE INTO plat_allergenes (plat_id, allergene_id) VALUES (?, ?)'
        );
        foreach ($allergenes as $allergeneId) {
            $stmtAllerg->execute([$id, (int)$allergeneId]);
        }
    }
}

jsonResponse(['message' => 'Plat mis à jour avec succès.']);