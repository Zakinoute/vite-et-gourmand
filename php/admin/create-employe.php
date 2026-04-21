<?php
// =========================================================
// admin/create-employe.php – Créer un compte employé
// POST { nom, prenom, email, password }
// Administrateur uniquement
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
requireAuth(['administrateur']);

$body     = getJsonBody();
$nom      = trim($body['nom']      ?? '');
$prenom   = trim($body['prenom']   ?? '');
$email    = trim($body['email']    ?? '');
$password = $body['password']      ?? '';

if (!$nom || !$prenom || !$email || !$password) {
    jsonResponse(['message' => 'Tous les champs sont obligatoires.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Email invalide.'], 400);
}

if (!isPasswordValid($password)) {
    jsonResponse(['message' => 'Mot de passe trop faible (10 car. min, maj, min, chiffre, spécial).'], 400);
}

$pdo  = getPDO();

// Vérifier doublon
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['message' => 'Cet email est déjà utilisé.'], 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$pdo->prepare('
    INSERT INTO users (nom, prenom, email, gsm, adresse, mot_de_passe, role)
    VALUES (?, ?, ?, "", "", ?, "employe")
')->execute([$nom, $prenom, $email, $hash]);

// Notifier l'employé (sans envoyer le mot de passe !)
$sujet = 'Votre compte Vite & Gourmand a été créé';
$html  = "
<h2>Bonjour {$prenom} {$nom},</h2>
<p>Un compte employé a été créé pour vous sur le site <strong>Vite &amp; Gourmand</strong>.</p>
<p>Votre identifiant de connexion est : <strong>{$email}</strong></p>
<p><strong>Le mot de passe ne vous est pas communiqué par email</strong> pour des raisons de sécurité.
   Veuillez vous rapprocher de l'administrateur (José) pour l'obtenir.</p>
<p><a href='http://vite-et-gourmand.fr/connexion.html'>Se connecter</a></p>
<p>Cordialement,<br>José – Vite &amp; Gourmand</p>
";
sendMail($email, $sujet, $html);

jsonResponse(['message' => 'Compte employé créé. L\'employé a été notifié par email.'], 201);