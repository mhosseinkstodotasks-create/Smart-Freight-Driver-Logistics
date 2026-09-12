<?php
/**
 * Driver Matching & Duplicate Detection Service
 * 
 * Checks the database for existing records of drivers, fleets, and freight announcements
 * so they are reused instead of creating duplicate records.
 */

require_once __DIR__ . '/../repositories/DriverRepository.php';
require_once __DIR__ . '/../repositories/FleetRepository.php';
require_once __DIR__ . '/../repositories/FreightRepository.php';
require_once __DIR__ . '/../repositories/TripRepository.php';

class DriverMatchingService {
    private DriverRepository $driverRepo;
    private FleetRepository $fleetRepo;
    private FreightRepository $freightRepo;
    private TripRepository $tripRepo;

    public function __construct() {
        $this->driverRepo = new DriverRepository();
        $this->fleetRepo = new FleetRepository();
        $this->freightRepo = new FreightRepository();
        $this->tripRepo = new TripRepository();
    }

    /**
     * Analyze extracted data for existing database duplicates
     */
    public function analyzeDuplicates(array $extractedData): array {
        $driver = $extractedData['driver'] ?? [];
        $fleet = $extractedData['fleet'] ?? [];
        $freight = $extractedData['freight'] ?? [];

        // 1. Check Driver Duplicate
        $matchedDriver = $this->driverRepo->findDuplicate(
            $driver['national_id'] ?? null,
            $driver['mobile_number'] ?? null
        );

        // 2. Check Fleet Duplicate
        $matchedFleet = $this->fleetRepo->findDuplicate(
            $fleet['license_plate'] ?? null,
            $fleet['smart_fleet_number'] ?? null
        );

        // 3. Check Freight Announcement Duplicate
        $matchedFreight = null;
        if (!empty($freight['announcement_number'])) {
            $matchedFreight = $this->freightRepo->findByAnnouncementNumber($freight['announcement_number']);
        }

        // 4. Check Active Trip Duplicate
        $existingTrip = null;
        if ($matchedDriver) {
            $existingTrip = $this->tripRepo->findExistingTrip(
                (int)$matchedDriver['id'],
                $matchedFreight ? (int)$matchedFreight['id'] : null
            );
        }

        return [
            'driver' => [
                'is_duplicate' => $matchedDriver !== null,
                'existing_record' => $matchedDriver,
                'match_reason' => $matchedDriver ? 'راننده با این کد ملی یا شماره همراه قبلاً در سیستم ثبت شده است' : null
            ],
            'fleet' => [
                'is_duplicate' => $matchedFleet !== null,
                'existing_record' => $matchedFleet,
                'match_reason' => $matchedFleet ? 'این پلاک یا شماره هوشمند ناوگان قبلاً در سیستم ثبت شده است' : null
            ],
            'freight' => [
                'is_duplicate' => $matchedFreight !== null,
                'existing_record' => $matchedFreight,
                'match_reason' => $matchedFreight ? 'اعلام بار با این شماره قبلاً ثبت شده است' : null
            ],
            'trip' => [
                'is_duplicate' => $existingTrip !== null,
                'existing_record' => $existingTrip,
                'match_reason' => $existingTrip ? 'سفر فعالی با این راننده برای این اعلام بار موجود است' : null
            ]
        ];
    }
}
