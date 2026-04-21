<?php
// =========================================================
// avis/create-avis.php – Déposer un avis (après commande terminée)
// POST { commande_id, note, commentaire }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
$sessionUser = requireAuth(['utilisateur']);

$body       = getJsonBody();
$commandeId = (int)($body['commande_id'] ?? 0);
$note       = (int)($body['note']        ?? 0);
$commentaire = trim($body['commentaire'] ?? '');

if (!$commandeId || $note < 1 || $note > 5) {
    jsonResponse(['message' => 'Données invalides.'], 400);
}

$pdo  = getPDO();

// Vérifier que la commande appartient à l'utilisateur et est terminée
$stmt = $pdo->prepare('
    SELECT id FROM commandes
    WHERE id = ? AND user_id = ? AND statut = "terminee"
    LIMIT 1
');
$stmt->execute([$commandeId, $sessionUser['id']]);
if (!$stmt->fetch()) {
    jsonResponse(['message' => 'Commande introuvable ou non terminée.'], 404);
}

// Vérifier qu'un avis n'existe pas déjà
$stmtCheck = $pdo->prepare('SELECT id FROM avis WHERE commande_id = ? LIMIT 1');
$stmtCheck->execute([$commandeId]);
if ($stmtCheck->fetch()) {
    jsonResponse(['message' => 'Vous avez déjà donné un avis pour cette commande.'], 409);
}

$pdo->prepare('
    INSERT INTO avis (user_id, commande_id, note, commentaire, valide)
    VALUES (?, ?, ?, ?, 0)
')->execute([$sessionUser['id'], $commandeId, $note, $commentaire ?: null]);

jsonResponse(['message' => 'Avis envoyé. Il sera visible après validation par notre équipe.'], 201);