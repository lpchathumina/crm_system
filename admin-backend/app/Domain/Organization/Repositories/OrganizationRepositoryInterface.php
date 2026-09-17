<?php

declare(strict_types=1);

namespace App\Domain\Organization\Repositories;

use App\Domain\Organization\Entities\Organization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrganizationRepositoryInterface
{
    public function findById(int $id): ?Organization;
    public function findBySlug(string $slug): ?Organization;
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function create(array $data): Organization;
    public function update(int $id, array $data): Organization;
    public function delete(int $id): bool;
}
