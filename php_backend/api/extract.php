<?php
/**
 * API: Extract Structured Logistics Data from Persian Message
 * 
 * Endpoint: POST /api/extract.php
 * Request:  { "message": "...", "user_id": "..." }
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

require_once __DIR__ . '/../services/AIExtractionService.php';
require_once __DIR__ . '/../services/DriverMatchingService.php';
require_once __DIR__ . '/../repositories/ChatHistoryRepository.php';

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

$message = $input['message'] ?? '';
$userId = $input['user_id'] ?? 'dispatcher_1';

if (empty(trim($message))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'متن پیام الزامی است.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$aiService = new AIExtractionService();
$extraction = $aiService->extract($message);

if (!$extraction['success']) {
    http_response_code(422);
    echo json_encode($extraction, JSON_UNESCAPED_UNICODE);
    exit;
}

// Perform duplicate detection against MySQL
$matchingService = new DriverMatchingService();
$duplicates = $matchingService->analyzeDuplicates($extraction['data']);

// Audit log
$chatRepo = new ChatHistoryRepository();
$logId = $chatRepo->logMessage($userId, $message, $extraction['data']);

echo json_encode([
    'success' => true,
    'message' => 'استخراج اطلاعات با موفقیت انجام شد.',
    'log_id' => $logId,
    'extracted' => $extraction['data'],
    'missing_fields' => $extraction['missing_fields'],
    'is_complete' => $extraction['is_complete'],
    'duplicates' => $duplicates
], JSON_UNESCAPED_UNICODE);
