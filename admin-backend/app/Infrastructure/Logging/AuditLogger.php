<?php

declare(strict_types=1);

namespace App\Infrastructure\Logging;

use App\Infrastructure\Persistence\Eloquent\Models\AuditLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    public static function log(
        string $action,
        ?string $description = null,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null
    ): void {
        try {
            AuditLog::create([
                'user_id' => $userId ?: auth('sanctum')->id(),
                'user_type' => 'admin',
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'description' => $description,
            ]);
        } catch (\Throwable $e) {
            Log::warning('AuditLog creation failed: ' . $e->getMessage());
        }
    }
}
