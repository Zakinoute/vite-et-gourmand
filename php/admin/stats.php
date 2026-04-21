<?php
// =========================================================
// admin/stats.php – Statistiques via MongoDB (NoSQL)
// Synchronise aussi les stats depuis MySQL vers MongoDB
// GET ?menu_id=&date_debut=&date_fin=
// =========================================================
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mongodb.php';

requireMethod('GET');
requireAuth(['administrateur']);

$menuId    = isset($_GET['menu_id'])    && is_numeric($_GET['menu_id']) ? (int)$_GET['menu_id'] : null;
$dateDebut = $_GET['date_debut'] ?? null;
$dateFin   = $_GET['date_fin']   ?? null;

// =========================================================
// Essayer MongoDB – si indisponible, fallback MySQL
// =========================================================
try {
    $stats = getStatsDepuisMongo($menuId, $dateDebut, $dateFin);
} catch (\Throwable $e) {
    // Fallback : calcul direct depuis MySQL
    $stats = getStatsDepuisMySQL($menuId, $dateDebut, $dateFin);
}

jsonResponse($stats);

// =========================================================
// Requête MongoDB
// =========================================================
function getStatsDepuisMongo(?int $menuId, ?string $debut, ?string $fin): array
{
    $collection = getStatsCollection();

    // Synchroniser d'abord MySQL → MongoDB
    syncMysqlVersMongo($collection);

    $match = [];
    if ($menuId)  $match['menu_id'] = $menuId;
    if ($debut)   $match['date']    = ['$gte' => $debut];
    if ($fin)     $match['date']    = array_merge($match['date'] ?? [], ['$lte' => $fin]);

    $pipeline = [
        ['$match' => (object)($match ?: [])],
        ['$group' => [
            '_id'          => ['menu_id' => '$menu_id', 'menu_titre' => '$menu_titre'],
            'nb_commandes' => ['$sum' => '$nb_commandes'],
            'ca'           => ['$sum' => '$ca'],
            'note_sum'     => ['$sum' => '$note_sum'],
            'note_count'   => ['$sum' => '$note_count'],
        ]],
        ['$sort' => ['nb_commandes' => -1]],
    ];

    $cursor = $collection->aggregate($pipeline);
    $menus  = [];

    foreach ($cursor as $doc) {
        $noteMoy = $doc['note_count'] > 0
            ? round($doc['note_sum'] / $doc['note_count'], 2)
            : null;

        $menus[] = [
            'menu_id'      => $doc['_id']['menu_id'],
            'menu_titre'   => $doc['_id']['menu_titre'],
            'nb_commandes' => (int)$doc['nb_commandes'],
            'ca'           => round((float)$doc['ca'], 2),
            'note_moyenne' => $noteMoy,
        ];
    }

    return buildTotaux($menus);
}

// =========================================================
// Synchronisation MySQL → MongoDB
// =========================================================
function syncMysqlVersMongo(\MongoDB\Collection $collection): void
{
    $pdo  = getPDO();
    $stmt = $pdo->query('
        SELECT
            c.menu_id,
            m.titre AS menu_titre,
            DATE(c.created_at) AS date,
            COUNT(c.id)            AS nb_commandes,
            SUM(c.prix_total)      AS ca,
            AVG(a.note)            AS note_moy,
            COUNT(a.id)            AS nb_avis
        FROM commandes c
        JOIN menus m ON m.id = c.menu_id
        LEFT JOIN avis a ON a.commande_id = c.id AND a.valide = 1
        WHERE c.statut NOT IN ("annulee")
        GROUP BY c.menu_id, DATE(c.created_at)
    ');

    foreach ($stmt->fetchAll() as $row) {
        $filter = [
            'menu_id' => (int)$row['menu_id'],
            'date'    => $row['date'],
        ];
        $update = ['$set' => [
            'menu_titre'   => $row['menu_titre'],
            'nb_commandes' => (int)$row['nb_commandes'],
            'ca'           => (float)$row['ca'],
            'note_sum'     => $row['note_moy'] !== null ? (float)$row['note_moy'] * (int)$row['nb_avis'] : 0,
            'note_count'   => (int)$row['nb_avis'],
            'synced_at'    => date('Y-m-d H:i:s'),
        ]];
        $collection->updateOne($filter, $update, ['upsert' => true]);
    }
}

// =========================================================
// Fallback MySQL (si MongoDB indisponible)
// =========================================================
function getStatsDepuisMySQL(?int $menuId, ?string $debut, ?string $fin): array
{
    $pdo    = getPDO();
    $where  = ["c.statut NOT IN ('annulee')"];
    $params = [];

    if ($menuId) {
        $where[]  = 'c.menu_id = ?';
        $params[] = $menuId;
    }
    if ($debut) {
        $where[]  = 'c.date_prestation >= ?';
        $params[] = $debut;
    }
    if ($fin) {
        $where[]  = 'c.date_prestation <= ?';
        $params[] = $fin;
    }

    $whereClause = 'WHERE ' . implode(' AND ', $where);

    $stmt = $pdo->prepare("
        SELECT
            c.menu_id,
            m.titre AS menu_titre,
            COUNT(c.id)        AS nb_commandes,
            SUM(c.prix_total)  AS ca,
            AVG(a.note)        AS note_moyenne
        FROM commandes c
        JOIN menus m ON m.id = c.menu_id
        LEFT JOIN avis a ON a.commande_id = c.id AND a.valide = 1
        $whereClause
        GROUP BY c.menu_id, m.titre
        ORDER BY nb_commandes DESC
    ");
    $stmt->execute($params);

    $menus = array_map(function ($row) {
        return [
            'menu_id'      => (int)$row['menu_id'],
            'menu_titre'   => $row['menu_titre'],
            'nb_commandes' => (int)$row['nb_commandes'],
            'ca'           => round((float)$row['ca'], 2),
            'note_moyenne' => $row['note_moyenne'] !== null ? round((float)$row['note_moyenne'], 2) : null,
        ];
    }, $stmt->fetchAll());

    return buildTotaux($menus);
}

// =========================================================
// Calculer les totaux
// =========================================================
function buildTotaux(array $menus): array
{
    $totalCmds = array_sum(array_column($menus, 'nb_commandes'));
    $totalCA   = array_sum(array_column($menus, 'ca'));
    $menuTop   = !empty($menus) ? $menus[0]['menu_titre'] : '–';

    $notes    = array_filter(array_column($menus, 'note_moyenne'), fn($n) => $n !== null);
    $noteMoy  = count($notes) ? round(array_sum($notes) / count($notes), 2) : null;

    return [
        'menus'  => $menus,
        'totaux' => [
            'nb_commandes' => $totalCmds,
            'ca_total'     => round($totalCA, 2),
            'menu_top'     => $menuTop,
            'note_moyenne' => $noteMoy,
        ],
    ];
}