<?php
// =========================================================
// auth/reset-password.php – Réinitialiser le mot de passe
// POST { token, password }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');

$body     = getJsonBody();
$token    = trim($body['token']    ?? '');
$password = $body['password']      ?? '';

if (!$token || !$password) {
    jsonResponse(['message' => 'Token et mot de passe requis.'], 400);
}

if (!isPasswordValid($password)) {
    jsonResponse(['message' => 'Mot de passe trop faible.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('
    SELECT tr.*, u.email FROM tokens_reinitialisation tr
    JOIN users u ON u.id = tr.user_id
    WHERE tr.token = ?
      AND tr.utilise = 0
      AND tr.expire_at > NOW()
    LIMIT 1
');
$stmt->execute([$token]);
$row = $stmt->fetch();

if (!$row) {
    jsonResponse(['message' => 'Lien invalide ou expiré.'], 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Mettre à jour le mot de passe
$pdo->prepare('UPDATE users SET mot_de_passe = ? WHERE id = ?')
    ->execute([$hash, $row['user_id']]);

// Invalider le token
$pdo->prepare('UPDATE tokens_reinitialisation SET utilise = 1 WHERE id = ?')
    ->execute([$row['id']]);

jsonResponse(['message' => 'Mot de passe réinitialisé avec succès.']);