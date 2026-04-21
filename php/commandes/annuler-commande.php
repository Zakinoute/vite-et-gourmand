<?php
// =========================================================
// commandes/annuler-commande.php – Annulation par le client
// POST { commande_id }
// Uniquement si statut = en_attente
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
$sessionUser = requireAuth(['utilisateur', 'employe', 'administrateur']);

$body       = getJsonBody();
$commandeId = (int)($body['commande_id'] ?? 0);

if (!$commandeId) {
    jsonResponse(['message' => 'Identifiant de commande requis.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT * FROM commandes WHERE id = ? LIMIT 1');
$stmt->execute([$commandeId]);
$commande = $stmt->fetch();

if (!$commande) {
    jsonResponse(['message' => 'Commande introuvable.'], 404);
}

// Vérifier que la commande appartient à l'utilisateur (sauf si employé/admin)
if ($sessionUser['role'] === 'utilisateur' && $commande['user_id'] != $sessionUser['id']) {
    jsonResponse(['message' => 'Accès refusé.'], 403);
}

// Seules les commandes "en_attente" peuvent être annulées par le client
if ($commande['statut'] !== 'en_attente') {
    jsonResponse(['message' => 'Cette commande ne peut plus être annulée (déjà acceptée par l\'équipe).'], 409);
}

$pdo->prepare("UPDATE commandes SET statut = 'annulee' WHERE id = ?")->execute([$commandeId]);
$pdo->prepare("INSERT INTO suivi_commandes (commande_id, statut, note) VALUES (?, 'annulee', 'Annulée par le client')")
    ->execute([$commandeId]);

// Remettre le stock
$pdo->prepare('UPDATE menus SET stock = stock + 1 WHERE id = ?')
    ->execute([$commande['menu_id']]);

jsonResponse(['message' => 'Commande annulée avec succès.']);