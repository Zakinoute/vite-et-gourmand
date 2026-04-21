<?php
// =========================================================
// auth/login.php – Connexion utilisateur
// POST { email, password } → { user }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');

$body     = getJsonBody();
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$password) {
    jsonResponse(['message' => 'Email et mot de passe requis.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Format d\'email invalide.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['mot_de_passe'])) {
    // Délai anti brute-force
    sleep(1);
    jsonResponse(['message' => 'Email ou mot de passe incorrect.'], 401);
}

if (!$user['actif']) {
    jsonResponse(['message' => 'Ce compte est désactivé. Contactez l\'administrateur.'], 403);
}

// Stocker en session (sans le mot de passe)
$sessionUser = [
    'id'      => $user['id'],
    'nom'     => $user['nom'],
    'prenom'  => $user['prenom'],
    'email'   => $user['email'],
    'gsm'     => $user['gsm'],
    'adresse' => $user['adresse'],
    'role'    => $user['role'],
];
$_SESSION['user'] = $sessionUser;

jsonResponse(['message' => 'Connexion réussie.', 'user' => $sessionUser]);