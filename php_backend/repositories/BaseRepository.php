<?php
/**
 * Base Repository with Dynamic Schema Mapping
 * 
 * Maps logical entity fields to actual database table and column names.
 */

require_once __DIR__ . '/../config/database.php';

abstract class BaseRepository {
    protected PDO $db;
    protected array $config;
    protected string $entityKey; // e.g. 'drivers', 'fleets', 'freights', 'trips'

    public function __construct(string $entityKey) {
        $this->db = Database::getConnection();
        $this->config = require __DIR__ . '/../config/tables.php';
        $this->entityKey = $entityKey;
    }

    /**
     * Get real table name from mapping
     */
    public function getTableName(): string {
        return $this->config['tables'][$this->entityKey] ?? $this->entityKey;
    }

    /**
     * Get real column name from mapping
     */
    public function col(string $logicalField): string {
        return $this->config['columns'][$this->entityKey][$logicalField] ?? $logicalField;
    }

    /**
     * Map a raw database row back to logical keys
     */
    public function mapRowToLogical(array $row): array {
        $reverseMap = array_flip($this->config['columns'][$this->entityKey] ?? []);
        $result = [];
        foreach ($row as $dbCol => $val) {
            $logicalKey = $reverseMap[$dbCol] ?? $dbCol;
            $result[$logicalKey] = $val;
        }
        return $result;
    }

    /**
     * Find by primary ID
     */
    public function findById($id): ?array {
        $table = $this->getTableName();
        $idCol = $this->col('id');
        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE `{$idCol}` = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ? $this->mapRowToLogical($row) : null;
    }

    /**
     * Insert a logical data array
     */
    public function insert(array $logicalData): int {
        $table = $this->getTableName();
        $dbCols = [];
        $placeholders = [];
        $params = [];

        foreach ($logicalData as $key => $val) {
            $dbCol = $this->col($key);
            $dbCols[] = "`{$dbCol}`";
            $placeholder = ":" . preg_replace('/[^a-zA-Z0-9_]/', '', $key);
            $placeholders[] = $placeholder;
            $params[$placeholder] = $val;
        }

        $sql = "INSERT INTO `{$table}` (" . implode(', ', $dbCols) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Update by primary ID
     */
    public function update($id, array $logicalData): bool {
        $table = $this->getTableName();
        $idCol = $this->col('id');
        $setClauses = [];
        $params = [':id' => $id];

        foreach ($logicalData as $key => $val) {
            $dbCol = $this->col($key);
            $paramName = ":u_" . preg_replace('/[^a-zA-Z0-9_]/', '', $key);
            $setClauses[] = "`{$dbCol}` = {$paramName}";
            $params[$paramName] = $val;
        }

        if (empty($setClauses)) {
            return false;
        }

        $sql = "UPDATE `{$table}` SET " . implode(', ', $setClauses) . " WHERE `{$idCol}` = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
