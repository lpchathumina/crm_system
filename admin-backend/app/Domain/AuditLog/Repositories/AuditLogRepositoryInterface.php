<?php

declare(strict_types=1);

namespace App\Domain\AuditLog\Repositories;

use App\Domain\AuditLog\Entities\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AuditLogRepositoryInterface
{
    public function create(array $data): AuditLog;
    public function paginate(int $perPage = 50, array $filters = []): LengthAwarePaginator;
}
