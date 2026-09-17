<?php

declare(strict_types=1);

namespace App\Domain\Organization\Entities;

use DateTimeImmutable;

final class Organization
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly string $slug,
        public readonly string $email,
        public readonly ?string $phone,
        public readonly ?string $website,
        public readonly bool $isActive,
        public readonly string $plan,
        public readonly ?string $timezone,
        public readonly DateTimeImmutable $createdAt,
        public readonly ?DateTimeImmutable $updatedAt = null,
    ) {}

    public function isActive(): bool
    {
        return $this->isActive;
    }
}
