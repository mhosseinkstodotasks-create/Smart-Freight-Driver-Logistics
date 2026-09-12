<?php
/**
 * Trip Workflow Service
 * 
 * Orchestrates confirmation, atomic database transaction, and duplicate resolution.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../repositories/DriverRepository.php';
require_once __DIR__ . '/../repositories/FleetRepository.php';
require_once __DIR__ . '/../repositories/FreightRepository.php';
require_once __DIR__ . '/../repositories/TripRepository.php';
require_once __DIR__ . '/DriverMatchingService.php';

class TripService {
    private PDO $db;
    private DriverRepository $driverRepo;
    private FleetRepository $fleetRepo;
    private FreightRepository $freightRepo;
    private TripRepository $tripRepo;
    private DriverMatchingService $matchingService;

    public function __construct() {
        $this->db = Database::getConnection();
        $this->driverRepo = new DriverRepository();
        $this->fleetRepo = new FleetRepository();
        $this->freightRepo = new FreightRepository();
        $this->tripRepo = new TripRepository();
        $this->matchingService = new DriverMatchingService();
    }

    /**
     * Confirm and atomically register a trip in MySQL
     */
    public function confirmAndSaveTrip(array $confirmedData, string $operatorName = 'اپراتور سامانه', string $rawMessage = ''): array {
        $driverData = $confirmedData['driver'] ?? [];
        $fleetData = $confirmedData['fleet'] ?? [];
        $freightData = $confirmedData['freight'] ?? [];

        $this->db->beginTransaction();

        try {
            // 1. Resolve Driver (Reuse existing or insert new)
            $matchedDriver = $this->driverRepo->findDuplicate(
                $driverData['national_id'] ?? null,
                $driverData['mobile_number'] ?? null
            );

            if ($matchedDriver) {
                $driverId = (int)$matchedDriver['id'];
                // Update phone or name if previously missing
                $updates = [];
                if (empty($matchedDriver['mobile_number']) && !empty($driverData['mobile_number'])) {
                    $updates['mobile_number'] = $driverData['mobile_number'];
                }
                if (empty($matchedDriver['full_name']) && !empty($driverData['full_name'])) {
                    $updates['full_name'] = $driverData['full_name'];
                }
                if (!empty($updates)) {
                    $this->driverRepo->update($driverId, $updates);
                }
            } else {
                $driverId = $this->driverRepo->insert([
                    'first_name' => $driverData['first_name'] ?? null,
                    'last_name' => $driverData['last_name'] ?? null,
                    'full_name' => $driverData['full_name'] ?? 'راننده نامشخص',
                    'national_id' => $driverData['national_id'] ?? null,
                    'mobile_number' => $driverData['mobile_number'] ?? null,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            }

            // 2. Resolve Fleet (Reuse existing or insert new)
            $matchedFleet = $this->fleetRepo->findDuplicate(
                $fleetData['license_plate'] ?? null,
                $fleetData['smart_fleet_number'] ?? null
            );

            if ($matchedFleet) {
                $fleetId = (int)$matchedFleet['id'];
            } else {
                $fleetId = $this->fleetRepo->insert([
                    'license_plate' => $fleetData['license_plate'] ?? 'پلاک نامشخص',
                    'smart_fleet_number' => $fleetData['smart_fleet_number'] ?? null,
                    'vehicle_type' => $fleetData['vehicle_type'] ?? 'کامیون',
                    'vehicle_turn' => $fleetData['vehicle_turn'] ?? null,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            }

            // 3. Resolve Freight Announcement
            $matchedFreight = null;
            if (!empty($freightData['announcement_number'])) {
                $matchedFreight = $this->freightRepo->findByAnnouncementNumber($freightData['announcement_number']);
            }

            if ($matchedFreight) {
                $freightId = (int)$matchedFreight['id'];
            } else {
                $freightId = $this->freightRepo->insert([
                    'announcement_number' => $freightData['announcement_number'] ?? (string)time(),
                    'announcement_type' => $freightData['announcement_type'] ?? 'نوع اول',
                    'customer_reference' => $freightData['customer_reference'] ?? null,
                    'origin' => $freightData['origin'] ?? 'مبدا نامشخص',
                    'destination' => $freightData['destination'] ?? 'مقصد نامشخص',
                    'cargo_type' => $freightData['cargo_type'] ?? 'بار صنعتی/کاشی',
                    'weight' => $freightData['weight'] ?? null,
                    'net_price' => $freightData['net_price'] ?? null,
                    'total_price' => $freightData['total_price'] ?? null,
                    'commission' => $freightData['commission'] ?? null,
                    'bill_of_lading_company' => 'ایمان بار',
                    'agent_name' => 'محمدحسین کرم سیچانی',
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            }

            // 4. Generate trip number e.g. "سفر 985#"
            $nextTripNum = 'سفر ' . rand(1000, 9999) . '#';
            $tripDate = date('Y/m/d H:i');

            // 5. Create Trip Record
            $tripId = $this->tripRepo->insert([
                'trip_number' => $nextTripNum,
                'driver_id' => $driverId,
                'fleet_id' => $fleetId,
                'freight_id' => $freightId,
                'status' => 'فعال',
                'operator_name' => $operatorName,
                'trip_date' => $tripDate,
                'notes' => $rawMessage,
                'created_at' => date('Y-m-d H:i:s'),
            ]);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'اطلاعات با موفقیت در پایگاه داده ثبت و سفر ایجاد گردید.',
                'trip_id' => $tripId,
                'trip_number' => $nextTripNum,
                'data' => $this->tripRepo->getTripWithRelations($tripId)
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            return [
                'success' => false,
                'error' => 'خطا در ثبت پایگاه داده: ' . $e->getMessage()
            ];
        }
    }
}
