<?php
// =========================================================
// auth/register.php – Création de compte utilisateur
// POST { nom, prenom, email, gsm, adresse, password }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');

$body    = getJsonBody();
$nom     = trim($body['nom']     ?? '');
$prenom  = trim($body['prenom']  ?? '');
$email   = trim($body['email']   ?? '');
$gsm     = trim($body['gsm']     ?? '');
$adresse = trim($body['adresse'] ?? '');
$password = $body['password']    ?? '';

// ---- Validation ----
if (!$nom || !$prenom || !$email || !$gsm || !$adresse || !$password) {
    jsonResponse(['message' => 'Tous les champs sont obligatoires.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Format d\'email invalide.'], 400);
}

if (!preg_match('/^(\+33|0)[0-9]{9}$/', $gsm)) {
    jsonResponse(['message' => 'Numéro de téléphone invalide.'], 400);
}

if (!isPasswordValid($password)) {
    jsonResponse([
        'message' => 'Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    ], 400);
}

$pdo = getPDO();

// ---- Vérifier si l'email existe déjà ----
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['message' => 'Cette adresse email est déjà utilisée.'], 409);
}

// ---- Insérer l'utilisateur ----
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$stmt = $pdo->prepare('
    INSERT INTO users (nom, prenom, email, gsm, adresse, mot_de_passe, role)
    VALUES (?, ?, ?, ?, ?, ?, "utilisateur")
');
$stmt->execute([$nom, $prenom, $email, $gsm, $adresse, $hash]);

// ---- Email de bienvenue ----
$sujet = 'Bienvenue chez Vite & Gourmand !';
$html  = "
<h2>Bienvenue, {$prenom} !</h2>
<p>Votre compte Vite &amp; Gourmand a bien été créé.</p>
<p>Vous pouvez dès maintenant découvrir nos menus et passer commande en ligne.</p>
<p><a href='http://vite-et-gourmand.fr/menus.html'>Découvrir nos menus</a></p>
<p>À bientôt,<br>Julie &amp; José – Vite &amp; Gourmand</p>
";
sendMail($email, $sujet, $html);

jsonResponse(['message' => 'Compte créé avec succès.'], 201);