<?php
// =========================================================
// utilisateur/update-profil.php – Modifier son profil
// POST { nom, prenom, email, gsm, adresse, password? }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
$sessionUser = requireAuth();

$body    = getJsonBody();
$nom     = trim($body['nom']     ?? '');
$prenom  = trim($body['prenom']  ?? '');
$email   = trim($body['email']   ?? '');
$gsm     = trim($body['gsm']     ?? '');
$adresse = trim($body['adresse'] ?? '');
$password = $body['password']    ?? '';

if (!$nom || !$prenom || !$email) {
    jsonResponse(['message' => 'Nom, prénom et email sont obligatoires.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Email invalide.'], 400);
}

$pdo = getPDO();

// Vérifier si l'email est déjà pris par un autre compte
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1');
$stmt->execute([$email, $sessionUser['id']]);
if ($stmt->fetch()) {
    jsonResponse(['message' => 'Cet email est déjà utilisé par un autre compte.'], 409);
}

// Mettre à jour sans mot de passe
$pdo->prepare('
    UPDATE users SET nom = ?, prenom = ?, email = ?, gsm = ?, adresse = ?
    WHERE id = ?
')->execute([$nom, $prenom, $email, $gsm, $adresse, $sessionUser['id']]);

// Mettre à jour le mot de passe si fourni
if ($password) {
    if (!isPasswordValid($password)) {
        jsonResponse(['message' => 'Mot de passe trop faible.'], 400);
    }
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $pdo->prepare('UPDATE users SET mot_de_passe = ? WHERE id = ?')
        ->execute([$hash, $sessionUser['id']]);
}

// Mettre à jour la session
$_SESSION['user'] = array_merge($_SESSION['user'], [
    'nom' => $nom, 'prenom' => $prenom,
    'email' => $email, 'gsm' => $gsm, 'adresse' => $adresse,
]);

jsonResponse(['message' => 'Profil mis à jour avec succès.']);