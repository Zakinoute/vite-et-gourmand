<?php
// =========================================================
// auth/send-reset.php – Envoi du lien de réinitialisation
// POST { email }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');

$body  = getJsonBody();
$email = trim($body['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Email invalide.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT id, prenom FROM users WHERE email = ? AND actif = 1 LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Ne pas révéler si l'email existe (sécurité)
if (!$user) {
    jsonResponse(['message' => 'Si cet email existe, un lien a été envoyé.']);
}

// Générer un token unique
$token     = bin2hex(random_bytes(32));
$expireAt  = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Supprimer anciens tokens
$pdo->prepare('DELETE FROM tokens_reinitialisation WHERE user_id = ?')->execute([$user['id']]);

// Insérer le nouveau
$stmt = $pdo->prepare('
    INSERT INTO tokens_reinitialisation (user_id, token, expire_at)
    VALUES (?, ?, ?)
');
$stmt->execute([$user['id'], $token, $expireAt]);

// Envoyer l'email
$lien = "http://vite-et-gourmand.fr/reinitialisation-mdp.html?token={$token}";
$sujet = 'Réinitialisation de votre mot de passe – Vite & Gourmand';
$html  = "
<h2>Bonjour {$user['prenom']},</h2>
<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
<p>Cliquez sur le lien ci-dessous (valable 1 heure) :</p>
<p><a href='{$lien}' style='background:#D4370C;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;'>
   Réinitialiser mon mot de passe
</a></p>
<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
<p>Cordialement,<br>Julie &amp; José – Vite &amp; Gourmand</p>
";
sendMail($email, $sujet, $html);

jsonResponse(['message' => 'Si cet email existe, un lien a été envoyé.']);