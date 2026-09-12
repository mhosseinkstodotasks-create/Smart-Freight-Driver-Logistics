<?php
/**
 * Trip Repository
 * 
 * Manages trip records with related driver, fleet, and freight announcement data.
 */

require_once __DIR__ . '/BaseRepository.php';
require_once __DIR__ . '/DriverRepository.php';
require_once __DIR__ . '/FleetRepository.php';
require_once __DIR__ . '/FreightRepository.php';

class TripRepository extends BaseRepository {
    private DriverRepository $driverRepo;
    private FleetRepository $fleetRepo;
    private FreightRepository $freightRepo;

    public function __construct() {
        parent::__construct('trips');
        $this->driverRepo = new DriverRepository();
        $this->fleetRepo = new FleetRepository();
        $this->freightRepo = new FreightRepository();
    }

    /**
     * Get a trip with full joined or resolved relations
     */
    public function getTripWithRelations(int $tripId): ?array {
        $trip = $this->findById($tripId);
        if (!$trip) return null;

        $driver = !empty($trip['driver_id']) ? $this->driverRepo->findById($trip['driver_id']) : null;
        $fleet = !empty($trip['fleet_id']) ? $this->fleetRepo->findById($trip['fleet_id']) : null;
        $freight = !empty($trip['freight_id']) ? $this->freightRepo->findById($trip['freight_id']) : null;

        return [
            'trip' => $trip,
            'driver' => $driver,
            'fleet' => $fleet,
            'freight' => $freight,
        ];
    }

    /**
     * Get paginated trips with relations and search filters
     */
    public function getTripsList(string $query = '', string $status = '', int $page = 1, int $limit = 15): array {
        $tripsTable = $this->getTableName();
        $idCol = $this->col('id');
        $statusCol = $this->col('status');
        $tripNumCol = $this->col('trip_number');
        $dateCol = $this->col('trip_date');
        $operatorCol = $this->col('operator_name');

        $offset = ($page - 1) * $limit;
        $whereClauses = ["1=1"];
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $whereClauses[] = "`{$statusCol}` = :status";
            $params['status'] = $status;
        }

        if (!empty($query)) {
            $whereClauses[] = "(`{$tripNumCol}` LIKE :q OR `{$operatorCol}` LIKE :q)";
            $params['q'] = "%{$query}%";
        }

        $where = implode(' AND ', $whereClauses);

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM `{$tripsTable}` WHERE {$where}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Fetch trips
        $sql = "SELECT * FROM `{$tripsTable}` WHERE {$where} ORDER BY `{$idCol}` DESC LIMIT {$limit} OFFSET {$offset}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $trips = [];
        foreach ($rows as $row) {
            $trip = $this->mapRowToLogical($row);
            $driver = !empty($trip['driver_id']) ? $this->driverRepo->findById($trip['driver_id']) : null;
            $fleet = !empty($trip['fleet_id']) ? $this->fleetRepo->findById($trip['fleet_id']) : null;
            $freight = !empty($trip['freight_id']) ? $this->freightRepo->findById($trip['freight_id']) : null;

            $trips[] = [
                'id' => $trip['id'],
                'trip_number' => $trip['trip_number'] ?? ('سفر ' . $trip['id'] . '#'),
                'trip_date' => $trip['trip_date'] ?? date('Y/m/d H:i'),
                'status' => $trip['status'] ?? 'فعال',
                'operator_name' => $trip['operator_name'] ?? 'اپراتور سامانه',
                'notes' => $trip['notes'] ?? '',
                'driver' => $driver,
                'fleet' => $fleet,
                'freight' => $freight,
            ];
        }

        return [
            'items' => $trips,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ];
    }

    /**
     * Check if an active trip already exists for the same driver or vehicle today
     */
    public function findExistingTrip(int $driverId, ?int $freightId): ?array {
        $table = $this->getTableName();
        $driverCol = $this->col('driver_id');
        $freightCol = $this->col('freight_id');
        $statusCol = $this->col('status');

        $sql = "SELECT * FROM `{$table}` WHERE `{$driverCol}` = :driverId AND `{$statusCol}` != 'لغو سفر' ";
        $params = ['driverId' => $driverId];

        if ($freightId) {
            $sql .= "AND `{$freightCol}` = :freightId ";
            $params['freightId'] = $freightId;
        }

        $sql .= "ORDER BY `id` DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();

        return $row ? $this->mapRowToLogical($row) : null;
    }
}
