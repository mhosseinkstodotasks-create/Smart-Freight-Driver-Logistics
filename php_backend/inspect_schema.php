<?php
/**
 * CLI & Web Schema Inspector
 * 
 * Inspects existing MySQL tables and columns, outputs foreign keys,
 * and generates ready-to-copy code for config/tables.php!
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $db = Database::getConnection();
} catch (Exception $e) {
    echo "ERROR: Could not connect to database: " . $e->getMessage() . "\n";
    exit(1);
}

$dbNameStmt = $db->query("SELECT DATABASE()");
$dbName = $dbNameStmt->fetchColumn();

echo "========================================================\n";
echo "   MYSQL LOGISTICS SCHEMA INSPECTOR & AUTO-MAPPER\n";
echo "   Database: {$dbName}\n";
echo "========================================================\n\n";

// 1. Fetch tables
$tablesStmt = $db->prepare("
    SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = :db 
    ORDER BY TABLE_NAME
");
$tablesStmt->execute(['db' => $dbName]);
$tables = $tablesStmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($tables)) {
    echo "No tables found in database '{$dbName}'.\n";
    echo "Please run schema_migration.sql first if you are initializing the database.\n";
    exit(0);
}

echo "Found " . count($tables) . " tables:\n";
foreach ($tables as $t) {
    echo "- {$t['TABLE_NAME']} (approx {$t['TABLE_ROWS']} rows)\n";
}
echo "\n--------------------------------------------------------\n";
echo "TABLE COLUMNS & KEYS:\n";
echo "--------------------------------------------------------\n";

$schemaMap = [];

foreach ($tables as $t) {
    $tableName = $t['TABLE_NAME'];
    echo "\n[TABLE] {$tableName}:\n";

    $colsStmt = $db->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_COMMENT 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :tbl 
        ORDER BY ORDINAL_POSITION
    ");
    $colsStmt->execute(['db' => $dbName, 'tbl' => $tableName]);
    $cols = $colsStmt->fetchAll(PDO::FETCH_ASSOC);

    $schemaMap[$tableName] = [];
    foreach ($cols as $c) {
        $keyMarker = $c['COLUMN_KEY'] ? " [{$c['COLUMN_KEY']}]" : "";
        echo "  • {$c['COLUMN_NAME']}: {$c['COLUMN_TYPE']}{$keyMarker}\n";
        $schemaMap[$tableName][] = $c['COLUMN_NAME'];
    }
}

echo "\n--------------------------------------------------------\n";
echo "SUGGESTED MAPPING FOR config/tables.php:\n";
echo "--------------------------------------------------------\n";
echo "<?php\nreturn [\n    'tables' => [\n";
foreach ($tables as $t) {
    $tbl = $t['TABLE_NAME'];
    echo "        '{$tbl}' => '{$tbl}',\n";
}
echo "    ],\n];\n";
