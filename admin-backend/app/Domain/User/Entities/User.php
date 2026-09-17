<?php

declare(strict_types=1);

namespace App\Domain\User\Entities;

use App\Domain\Organization\Entities\Organization;
use App\Domain\Role\Entities\Role;
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

final class User
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly string $email,
        public readonly bool $isActive,
        public readonly ?int $organizationId,
        public readonly DateTimeImmutable $createdAt,
        public readonly ?DateTimeImmutable $updatedAt = null,
        public readonly ?DateTimeImmutable $lastLoginAt = null,
    ) {}

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function belongsToOrganization(int $organizationId): bool
    {
        return $this->organizationId === $organizationId;
    }
}
