<?php
/**
 * Fleet / Vehicle Repository
 * 
 * Handles vehicle storage and duplicate checks by plate or smart card.
 */

require_once __DIR__ . '/BaseRepository.php';

class FleetRepository extends BaseRepository {
    public function __construct() {
        parent::__construct('fleets');
    }

    /**
     * Clean license plate string for matching
     */
    private function cleanPlate(string $plate): string {
        return preg_replace('/\s+/', '', $plate);
    }

    /**
     * Find fleet by license plate
     */
    public function findByLicensePlate(string $plate): ?array {
        $clean = trim($plate);
        if (empty($clean)) return null;

        $table = $this->getTableName();
        $plateCol = $this->col('license_plate');

        // Match exact or spaces removed
        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE REPLACE(`{$plateCol}`, ' ', '') = :plate LIMIT 1");
        $stmt->execute(['plate' => $this->cleanPlate($clean)]);
        $row = $stmt->fetch();

        return $row ? $this->mapRowToLogical($row) : null;
    }

    /**
     * Find fleet by smart fleet number (شماره هوشمند)
     */
    public function findBySmartNumber(string $smartNumber): ?array {
        $clean = trim($smartNumber);
        if (empty($clean)) return null;

        $table = $this->getTableName();
        $smartCol = $this->col('smart_fleet_number');

        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE `{$smartCol}` = :snum LIMIT 1");
        $stmt->execute(['snum' => $clean]);
        $row = $stmt->fetch();

        return $row ? $this->mapRowToLogical($row) : null;
    }

    /**
     * Check if duplicate fleet exists
     */
    public function findDuplicate(?string $plate, ?string $smartNumber): ?array {
        if (!empty($plate)) {
            $fleet = $this->findByLicensePlate($plate);
            if ($fleet) return $fleet;
        }
        if (!empty($smartNumber)) {
            $fleet = $this->findBySmartNumber($smartNumber);
            if ($fleet) return $fleet;
        }
        return null;
    }

    /**
     * Search fleets with pagination
     */
    public function search(string $query = '', int $page = 1, int $limit = 20): array {
        $table = $this->getTableName();
        $plateCol = $this->col('license_plate');
        $smartCol = $this->col('smart_fleet_number');
        $idCol = $this->col('id');

        $offset = ($page - 1) * $limit;
        $params = [];
        $where = "1=1";

        if (!empty($query)) {
            $where = "(`{$plateCol}` LIKE :q OR `{$smartCol}` LIKE :q)";
            $params['q'] = "%{$query}%";
        }

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM `{$table}` WHERE {$where}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

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
