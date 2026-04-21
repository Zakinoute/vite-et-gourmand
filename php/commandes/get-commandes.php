<?php
// =========================================================
// commandes/get-commandes.php
// GET ?user_id=   → commandes d'un utilisateur
// GET ?id=&suivi= → détail d'une commande + suivi
// GET ?all=1      → toutes les commandes (employé/admin)
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('GET');
$sessionUser = requireAuth();

$pdo = getPDO();

// ---- Détail d'une commande ----
if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];

    // Vérifier les droits (le proprio ou un employé/admin)
    $stmt = $pdo->prepare('
        SELECT c.*, m.titre AS menu_titre,
               u.nom AS user_nom, u.prenom AS user_prenom, u.email AS user_email
        FROM commandes c
        JOIN menus m ON m.id = c.menu_id
        JOIN users  u ON u.id = c.user_id
        WHERE c.id = ?
        LIMIT 1
    ');
    $stmt->execute([$id]);
    $cmd = $stmt->fetch();

    if (!$cmd) jsonResponse(['message' => 'Commande introuvable.'], 404);

    if ($sessionUser['role'] === 'utilisateur' && $cmd['user_id'] != $sessionUser['id']) {
        jsonResponse(['message' => 'Accès refusé.'], 403);
    }

    // Suivi demandé ?
    if (isset($_GET['suivi'])) {
        $stmtSuivi = $pdo->prepare('
            SELECT statut, note, created_at FROM suivi_commandes
            WHERE commande_id = ? ORDER BY created_at ASC
        ');
        $stmtSuivi->execute([$id]);
        jsonResponse($stmtSuivi->fetchAll());
    }

    // Vérifier si un avis a été donné
    $stmtAvis = $pdo->prepare('SELECT id FROM avis WHERE commande_id = ? LIMIT 1');
    $stmtAvis->execute([$id]);
    $cmd['a_donne_avis'] = (bool)$stmtAvis->fetch();

    jsonResponse($cmd);
}

// ---- Toutes les commandes (employé / admin) ----
if (isset($_GET['all']) && in_array($sessionUser['role'], ['employe', 'administrateur'], true)) {
    $where  = [];
    $params = [];

    if (!empty($_GET['statut'])) {
        $where[]  = 'c.statut = ?';
        $params[] = $_GET['statut'];
    }
    if (!empty($_GET['client'])) {
        $where[]  = '(u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)';
        $like     = '%' . $_GET['client'] . '%';
        $params   = array_merge($params, [$like, $like, $like]);
    }
    if (!empty($_GET['date'])) {
        $where[]  = 'c.date_prestation = ?';
        $params[] = $_GET['date'];
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = $pdo->prepare("
        SELECT c.id, c.nb_personnes, c.adresse, c.date_prestation, c.heure_prestation,
               c.prix_total, c.statut, c.created_at,
               m.titre AS menu_titre,
               u.nom AS user_nom, u.prenom AS user_prenom, u.email AS user_email
        FROM commandes c
        JOIN menus m ON m.id = c.menu_id
        JOIN users  u ON u.id = c.user_id
        $whereClause
        ORDER BY c.created_at DESC
    ");
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

// ---- Commandes d'un utilisateur ----
$userId = (int)($_GET['user_id'] ?? $sessionUser['id']);

// Sécurité : un utilisateur ne peut voir que ses propres commandes
if ($sessionUser['role'] === 'utilisateur' && $userId !== $sessionUser['id']) {
    jsonResponse(['message' => 'Accès refusé.'], 403);
}

$stmt = $pdo->prepare('
    SELECT c.id, c.nb_personnes, c.adresse, c.date_prestation, c.heure_prestation,
           c.prix_total, c.statut, c.motif_annulation, c.created_at,
           m.titre AS menu_titre
    FROM commandes c
    JOIN menus m ON m.id = c.menu_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
');
$stmt->execute([$userId]);
$commandes = $stmt->fetchAll();

// Ajouter flag "a_donne_avis"
$stmtAvis = $pdo->prepare('SELECT id FROM avis WHERE commande_id = ? LIMIT 1');
foreach ($commandes as &$cmd) {
    $stmtAvis->execute([$cmd['id']]);
    $cmd['a_donne_avis'] = (bool)$stmtAvis->fetch();
}

jsonResponse($commandes);