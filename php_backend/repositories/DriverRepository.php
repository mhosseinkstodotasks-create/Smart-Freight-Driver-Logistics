<?php
/**
 * Driver Repository
 * 
 * Handles database operations and duplicate detection for drivers.
 */

require_once __DIR__ . '/BaseRepository.php';

class DriverRepository extends BaseRepository {
    public function __construct() {
        parent::__construct('drivers');
    }

    /**
     * Find driver by National ID (کد ملی)
     */
    public function findByNationalId(string $nationalId): ?array {
        $cleanId = trim($nationalId);
        if (empty($cleanId)) return null;

        $table = $this->getTableName();
        $nationalCol = $this->col('national_id');

        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE `{$nationalCol}` = :nid LIMIT 1");
        $stmt->execute(['nid' => $cleanId]);
        $row = $stmt->fetch();

        return $row ? $this->mapRowToLogical($row) : null;
    }

    /**
     * Find driver by mobile number (شماره همراه)
     */
    public function findByMobileNumber(string $mobile): ?array {
        $cleanMobile = trim($mobile);
        if (empty($cleanMobile)) return null;

        $table = $this->getTableName();
        $mobileCol = $this->col('mobile_number');

        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE `{$mobileCol}` = :mobile LIMIT 1");
        $stmt->execute(['mobile' => $cleanMobile]);
        $row = $stmt->fetch();

        return $row ? $this->mapRowToLogical($row) : null;
    }

    /**
     * Check if duplicate driver exists by national ID or mobile
     */
    public function findDuplicate(?string $nationalId, ?string $mobile): ?array {
        if (!empty($nationalId)) {
            $driver = $this->findByNationalId($nationalId);
            if ($driver) return $driver;
        }
        if (!empty($mobile)) {
            $driver = $this->findByMobileNumber($mobile);
            if ($driver) return $driver;
        }
        return null;
    }

    /**
     * Search drivers with pagination
     */
    public function search(string $query = '', int $page = 1, int $limit = 20): array {
        $table = $this->getTableName();
        $nameCol = $this->col('full_name');
        $nationalCol = $this->col('national_id');
        $mobileCol = $this->col('mobile_number');
        $idCol = $this->col('id');

        $offset = ($page - 1) * $limit;
        $params = [];
        $where = "1=1";

        if (!empty($query)) {
            $where = "(`{$nameCol}` LIKE :q OR `{$nationalCol}` LIKE :q OR `{$mobileCol}` LIKE :q)";
            $params['q'] = "%{$query}%";
        }

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM `{$table}` WHERE {$where}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Fetch rows
        $sql = "SELECT * FROM `{$table}` WHERE {$where} ORDER BY `{$idCol}` DESC LIMIT {$limit} OFFSET {$offset}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $items = array_map([$this, 'mapRowToLogical'], $rows);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ];
    }
}
