<?php
// =========================================================
// horaires/update-horaires.php – Mettre à jour les horaires
// POST [ { jour, ouverture, fermeture, ferme }, ... ]
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['employe', 'administrateur']);

$body = getJsonBody();

if (!is_array($body) || empty($body)) {
    jsonResponse(['message' => 'Données invalides.'], 400);
}

$joursValides = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
$pdo          = getPDO();

$stmt = $pdo->prepare('
    INSERT INTO horaires (jour, ouverture, fermeture, ferme)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        ouverture = VALUES(ouverture),
        fermeture = VALUES(fermeture),
        ferme     = VALUES(ferme)
');

foreach ($body as $h) {
    $jour      = $h['jour']      ?? '';
    $ouverture = $h['ouverture'] ?? '09:00';
    $fermeture = $h['fermeture'] ?? '19:00';
    $ferme     = !empty($h['ferme']) ? 1 : 0;

    if (!in_array($jour, $joursValides, true)) continue;

    $stmt->execute([$jour, $ferme ? null : $ouverture, $ferme ? null : $fermeture, $ferme]);
}

jsonResponse(['message' => 'Horaires mis à jour.']);