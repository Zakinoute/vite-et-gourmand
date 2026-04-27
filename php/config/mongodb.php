<?php
// =========================================================
// config/mongodb.php – Connexion MongoDB (NoSQL)
// Extension : mongodb (pecl) + library mongodb/mongodb
// =========================================================

define('MONGO_URI',  getenv('MONGO_URI')  ?: 'mongodb://localhost:27017');
define('MONGO_DB',   getenv('MONGO_DB')   ?: 'vite_et_gourmand_stats');
define('MONGO_COLL', getenv('MONGO_COLL') ?: 'commandes_stats');

function getMongoDB(): \MongoDB\Database
{
    static $db = null;
    if ($db !== null) return $db;

    if (!class_exists('\MongoDB\Client')) {
        throw new \RuntimeException('Extension MongoDB non installée.');
    }

    $client = new \MongoDB\Client(MONGO_URI);
    $db     = $client->selectDatabase(MONGO_DB);
    return $db;
}

function getStatsCollection(): \MongoDB\Collection
{
    return getMongoDB()->selectCollection(MONGO_COLL);
}