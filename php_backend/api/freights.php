<?php
/**
 * API: Search & List Freight Announcements
 * 
 * Endpoint: GET /api/freights.php?query=...&page=1&limit=20
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../repositories/FreightRepository.php';

$query = $_GET['query'] ?? '';
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;

$repo = new FreightRepository();
$data = $repo->search($query, $page, $limit);

echo json_encode([
    'success' => true,
    'data' => $data
], JSON_UNESCAPED_UNICODE);
