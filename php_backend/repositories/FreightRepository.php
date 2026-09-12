<?php
/**
 * Freight Announcement Repository
 * 
 * Handles freight announcements and duplicate checks by announcement number.
 */

require_once __DIR__ . '/BaseRepository.php';

class FreightRepository extends BaseRepository {
    public function __construct() {
        parent::__construct('freights');
    }

    /**
     * Find by announcement number (شماره اعلام بار)
     */
    public function findByAnnouncementNumber(string $announcementNumber): ?array {
        $clean = trim($announcementNumber);
        if (empty($clean)) return null;

        $table = $this->getTableName();
        $numCol = $this->col('announcement_number');

        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE `{$numCol}` = :num LIMIT 1");
        $stmt->execute(['num' => $clean]);
        $row = $stmt->fetch();

        return $row ? $this->mapRowToLogical($row) : null;
    }

    /**
     * Search freight announcements
     */
    public function search(string $query = '', int $page = 1, int $limit = 20): array {
        $table = $this->getTableName();
        $numCol = $this->col('announcement_number');
        $originCol = $this->col('origin');
        $destCol = $this->col('destination');
        $cargoCol = $this->col('cargo_type');
        $customerCol = $this->col('customer_reference');
        $idCol = $this->col('id');

        $offset = ($page - 1) * $limit;
        $params = [];
        $where = "1=1";

        if (!empty($query)) {
            $where = "(`{$numCol}` LIKE :q OR `{$originCol}` LIKE :q OR `{$destCol}` LIKE :q OR `{$cargoCol}` LIKE :q OR `{$customerCol}` LIKE :q)";
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
