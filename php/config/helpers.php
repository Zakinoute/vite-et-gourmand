<?php
// =========================================================
// config/helpers.php – Fonctions utilitaires partagées
// =========================================================

session_start();

// ---- Réponse JSON ----
function jsonResponse(mixed $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ---- Lire le body JSON de la requête ----
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ---- Vérifier la méthode HTTP ----
function requireMethod(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
        jsonResponse(['message' => 'Méthode non autorisée.'], 405);
    }
}

// ---- Vérifier la session / authentification ----
function requireAuth(array $roles = []): array
{
    if (empty($_SESSION['user'])) {
        jsonResponse(['message' => 'Non authentifié.'], 401);
    }
    if (!empty($roles) && !in_array($_SESSION['user']['role'], $roles, true)) {
        jsonResponse(['message' => 'Accès refusé.'], 403);
    }
    return $_SESSION['user'];
}

// ---- Valider un mot de passe sécurisé ----
function isPasswordValid(string $password): bool
{
    return strlen($password) >= 10
        && preg_match('/[A-Z]/', $password)
        && preg_match('/[a-z]/', $password)
        && preg_match('/[0-9]/', $password)
        && preg_match('/[!@#$%^&*()\-_=+\[\]{};\':"\\|,.<>\/?`~]/', $password);
}

// ---- Envoyer un email (PHPMailer ou mail() natif) ----
function sendMail(string $to, string $subject, string $htmlBody): bool
{
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Vite & Gourmand <noreply@vite-et-gourmand.fr>\r\n";
    $headers .= "Reply-To: contact@vite-et-gourmand.fr\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    return mail($to, $subject, $htmlBody, $headers);
}

// ---- Entête CORS (développement local) ----
function setCorsHeaders(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = ['http://localhost', 'http://127.0.0.1', 'http://localhost:8080'];
    if (in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

setCorsHeaders();