<?php

declare(strict_types=1);

namespace App\Domain\AuditLog\Entities;

use DateTimeImmutable;

final class AuditLog
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $userId,
        public readonly string $action,
        public readonly string $modelType,
        public readonly ?int $modelId,
        public readonly ?array $oldValues,
        public readonly ?array $newValues,
        public readonly ?string $ipAddress,
        public readonly ?string $userAgent,
        public readonly DateTimeImmutable $createdAt,
    ) {}
}
