<?php
// =========================================================
// avis/get-avis.php
// GET ?valide=1   → avis validés (page d'accueil)
// GET ?valide=0   → avis en attente (espace employé)
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');

$valide = isset($_GET['valide']) ? (int)$_GET['valide'] : 1;

// Les avis en attente sont réservés aux employés/admin
if ($valide !== 1) {
    requireAuth(['employe', 'administrateur']);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('
    SELECT a.id, a.note, a.commentaire, a.valide, a.created_at,
           u.nom AS user_nom, u.prenom AS user_prenom,
           m.titre AS menu_titre
    FROM avis a
    JOIN users u    ON u.id = a.user_id
    JOIN commandes c ON c.id = a.commande_id
    JOIN menus m    ON m.id = c.menu_id
    WHERE a.valide = ?
    ORDER BY a.created_at DESC
');
$stmt->execute([$valide]);

jsonResponse($stmt->fetchAll());