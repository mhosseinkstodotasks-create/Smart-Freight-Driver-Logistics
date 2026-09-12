<?php
/**
 * Chat History Repository
 * 
 * Audits employee chat messages, raw text, and AI extractions without mixing with business tables.
 */

require_once __DIR__ . '/BaseRepository.php';

class ChatHistoryRepository extends BaseRepository {
    public function __construct() {
        parent::__construct('chat_history');
    }

    /**
     * Store a message log
     */
    public function logMessage(string $userId, string $rawMessage, array $extractedJson, string $status = 'pending'): int {
        try {
            return $this->insert([
                'user_id' => $userId,
                'raw_message' => $rawMessage,
                'extracted_json' => json_encode($extractedJson, JSON_UNESCAPED_UNICODE),
                'status' => $status,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (Exception $e) {
            // Non-blocking if table doesn't exist yet
            error_log("Chat audit log warning: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Update log status after confirmation
     */
    public function updateStatus(int $logId, string $status): void {
        try {
            $this->update($logId, ['status' => $status]);
        } catch (Exception $e) {
            error_log("Chat audit update warning: " . $e->getMessage());
        }
    }
}
