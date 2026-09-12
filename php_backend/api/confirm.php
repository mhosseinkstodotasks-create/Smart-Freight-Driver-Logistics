<?php
/**
 * API: Confirm & Save Extracted Logistics Data to MySQL
 * 
 * Endpoint: POST /api/confirm.php
 * Request:  { "data": { "driver": {}, "fleet": {}, "freight": {} }, "operator_name": "...", "log_id": 123 }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/../services/TripService.php';
require_once __DIR__ . '/../repositories/ChatHistoryRepository.php';

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

$data = $input['data'] ?? null;
$operatorName = $input['operator_name'] ?? 'ناصر مدیر';
$rawMessage = $input['raw_message'] ?? '';
$logId = isset($input['log_id']) ? (int)$input['log_id'] : null;

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'اطلاعات تایید شده ارسال نشده است.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$tripService = new TripService();
$result = $tripService->confirmAndSaveTrip($data, $operatorName, $rawMessage);

if ($result['success'] && $logId) {
    $chatRepo = new ChatHistoryRepository();
    $chatRepo->updateStatus($logId, 'confirmed');
}

if (!$result['success']) {
    http_response_code(500);
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);
