<?php
// =========================================================
// commandes/update-commande.php – Changer le statut
// POST { commande_id, statut, motif_annulation?, mode_contact? }
// Employé/Admin uniquement
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';

requireMethod('POST');
$sessionUser = requireAuth(['employe', 'administrateur']);

$body        = getJsonBody();
$commandeId  = (int)($body['commande_id']     ?? 0);
$statut      = trim($body['statut']           ?? '');
$motif       = trim($body['motif_annulation'] ?? '');
$modeContact = trim($body['mode_contact']     ?? '');

$statutsValides = [
    'acceptee','en_preparation','en_cours_livraison',
    'livree','attente_materiel','terminee','annulee',
];

if (!$commandeId || !in_array($statut, $statutsValides, true)) {
    jsonResponse(['message' => 'Données invalides.'], 400);
}

// L'annulation nécessite motif + mode_contact
if ($statut === 'annulee' && (!$motif || !$modeContact)) {
    jsonResponse(['message' => 'Le motif et le mode de contact sont requis pour une annulation.'], 400);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT * FROM commandes WHERE id = ? LIMIT 1');
$stmt->execute([$commandeId]);
$commande = $stmt->fetch();

if (!$commande) {
    jsonResponse(['message' => 'Commande introuvable.'], 404);
}

// ---- Mise à jour ----
$pdo->prepare('
    UPDATE commandes
    SET statut = ?, motif_annulation = ?, mode_contact = ?
    WHERE id = ?
')->execute([$statut, $motif ?: null, $modeContact ?: null, $commandeId]);

// ---- Suivi ----
$note = $motif ? "Motif : $motif (Contact : $modeContact)" : null;
$pdo->prepare('INSERT INTO suivi_commandes (commande_id, statut, note) VALUES (?, ?, ?)')
    ->execute([$commandeId, $statut, $note]);

// ---- Si stock remis si annulé ----
if ($statut === 'annulee') {
    $pdo->prepare('UPDATE menus SET stock = stock + 1 WHERE id = ?')
        ->execute([$commande['menu_id']]);
}

// ---- Emails selon statut ----
$stmtUser = $pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
$stmtUser->execute([$commande['user_id']]);
$user = $stmtUser->fetch();

if ($user) {
    envoyerEmailStatut($user, $commande, $statut, $motif);
}

jsonResponse(['message' => 'Commande mise à jour.']);

// ---- Fonction email ----
function envoyerEmailStatut(array $user, array $cmd, string $statut, string $motif): void
{
    $prenomNom = "{$user['prenom']} {$user['nom']}";
    $sujet     = '';
    $corps     = '';

    switch ($statut) {
        case 'acceptee':
            $sujet = "Votre commande #{$cmd['id']} a été acceptée – Vite & Gourmand";
            $corps = "<p>Bonjour {$prenomNom},</p><p>Bonne nouvelle ! Votre commande <strong>#{$cmd['id']}</strong> a été <strong>acceptée</strong> par notre équipe. Nous allons commencer sa préparation très prochainement.</p>";
            break;
        case 'terminee':
            $sujet = "Commande #{$cmd['id']} terminée – Donnez votre avis !";
            $corps = "<p>Bonjour {$prenomNom},</p><p>Votre commande <strong>#{$cmd['id']}</strong> est <strong>terminée</strong>. Nous espérons que vous avez apprécié notre prestation !</p><p>Connectez-vous à votre espace pour <strong>laisser votre avis</strong>.</p><p><a href='http://vite-et-gourmand.fr/espace-utilisateur.html'>Mon espace</a></p>";
            break;
        case 'attente_materiel':
            $sujet = "Retour de matériel requis – Commande #{$cmd['id']}";
            $corps = "<p>Bonjour {$prenomNom},</p><p>Suite à votre commande <strong>#{$cmd['id']}</strong>, du matériel vous a été prêté.</p><p><strong>Vous disposez de 10 jours ouvrés</strong> pour le restituer. Sans retour dans ce délai, une indemnité de <strong>600 €</strong> sera appliquée conformément à nos CGV.</p><p>Pour organiser la restitution, <a href='http://vite-et-gourmand.fr/contact.html'>contactez-nous</a>.</p>";
            break;
        case 'annulee':
            $sujet = "Commande #{$cmd['id']} annulée – Vite & Gourmand";
            $corps = "<p>Bonjour {$prenomNom},</p><p>Votre commande <strong>#{$cmd['id']}</strong> a malheureusement dû être <strong>annulée</strong>.</p>" . ($motif ? "<p><strong>Motif :</strong> {$motif}</p>" : '') . "<p>Nous nous en excusons. N'hésitez pas à nous contacter.</p>";
            break;
        default:
            return;
    }

    if ($sujet) {
        $corps .= "<p>Cordialement,<br>Julie &amp; José – Vite &amp; Gourmand</p>";
        sendMail($user['email'], $sujet, $corps);
    }
}