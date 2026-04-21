<?php
// =========================================================
// horaires/get-horaires.php – Retourne les 7 horaires
// GET (public)
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');

$pdo  = getPDO();
$stmt = $pdo->query("
    SELECT jour, ouverture, fermeture, ferme
    FROM horaires
    ORDER BY FIELD(jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')
");

jsonResponse($stmt->fetchAll());