<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Organization\Entities\Organization as OrgEntity;
use App\Domain\Organization\Repositories\OrganizationRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Organization;
use DateTimeImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class EloquentOrganizationRepository implements OrganizationRepositoryInterface
{
    public function __construct(private readonly Organization $model) {}

    public function findById(int $id): ?OrgEntity
    {
        $org = $this->model->find($id);
        return $org ? $this->toEntity($org) : null;
    }

    public function findBySlug(string $slug): ?OrgEntity
    {
        $org = $this->model->where('slug', $slug)->first();
        return $org ? $this->toEntity($org) : null;
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['plan'])) {
            $query->where('plan', $filters['plan']);
        }

        return $query->withCount('users')->latest()->paginate($perPage);
    }

    public function create(array $data): OrgEntity
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $org = $this->model->create($data);
        return $this->toEntity($org);
    }

    public function update(int $id, array $data): OrgEntity
    {
        $org = $this->model->findOrFail($id);
        $org->update($data);
        return $this->toEntity($org->fresh());
    }

    public function delete(int $id): bool
    {
        return (bool) $this->model->destroy($id);
    }

    private function toEntity(Organization $model): OrgEntity
    {
        return new OrgEntity(
            id: $model->id,
            name: $model->name,
            slug: $model->slug,
            email: $model->email,
            phone: $model->phone,
            website: $model->website,
            isActive: $model->is_active,
            plan: $model->plan,
            timezone: $model->timezone,
            createdAt: new DateTimeImmutable($model->created_at->toIso8601String()),
            updatedAt: $model->updated_at ? new DateTimeImmutable($model->updated_at->toIso8601String()) : null,
        );
    }
}
