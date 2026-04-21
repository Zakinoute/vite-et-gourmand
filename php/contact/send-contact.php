<?php
// =========================================================
// contact/send-contact.php – Envoi du formulaire de contact
// POST { titre, email, description }
// =========================================================
require_once __DIR__ . '/../config/helpers.php';

requireMethod('POST');

$body        = getJsonBody();
$titre       = trim($body['titre']       ?? '');
$email       = trim($body['email']       ?? '');
$description = trim($body['description'] ?? '');

if (!$titre || !$email || !$description) {
    jsonResponse(['message' => 'Tous les champs sont obligatoires.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['message' => 'Email invalide.'], 400);
}

if (strlen($description) < 20) {
    jsonResponse(['message' => 'Le message doit comporter au moins 20 caractères.'], 400);
}

// Nettoyer pour éviter les injections d'en-têtes
$titre       = strip_tags($titre);
$description = strip_tags($description);
$email       = filter_var($email, FILTER_SANITIZE_EMAIL);

// Email à l'entreprise
$sujetEntreprise = "[Contact Site] {$titre}";
$htmlEntreprise  = "
<h3>Nouveau message de contact</h3>
<p><strong>Sujet :</strong> {$titre}</p>
<p><strong>Email de l'expéditeur :</strong> {$email}</p>
<hr>
<p><strong>Message :</strong></p>
<p>" . nl2br(htmlspecialchars($description)) . "</p>
";
sendMail('contact@vite-et-gourmand.fr', $sujetEntreprise, $htmlEntreprise);

// Email de confirmation à l'expéditeur
$sujetConfirm = 'Votre message a bien été reçu – Vite & Gourmand';
$htmlConfirm  = "
<h2>Merci de nous avoir contactés !</h2>
<p>Nous avons bien reçu votre message concernant : <strong>{$titre}</strong>.</p>
<p>Notre équipe vous répondra dans les meilleurs délais à cette adresse.</p>
<p>Cordialement,<br>Julie &amp; José – Vite &amp; Gourmand</p>
";
sendMail($email, $sujetConfirm, $htmlConfirm);

jsonResponse(['message' => 'Message envoyé avec succès.']);