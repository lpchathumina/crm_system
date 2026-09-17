<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\User\Entities\User as UserEntity;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use DateTimeImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function __construct(private readonly AdminUser $model) {}

    public function findById(int $id): ?UserEntity
    {
        $user = $this->model->find($id);
        return $user ? $this->toEntity($user) : null;
    }

    public function findByEmail(string $email): ?UserEntity
    {
        $user = $this->model->where('email', $email)->first();
        return $user ? $this->toEntity($user) : null;
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('roles');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['role'])) {
            $query->role($filters['role']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function create(array $data): UserEntity
    {
        $data['password'] = Hash::make($data['password']);
        $user = $this->model->create($data);

        if (!empty($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return $this->toEntity($user);
    }

    public function update(int $id, array $data): UserEntity
    {
        $user = $this->model->findOrFail($id);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        if (array_key_exists('roles', $data)) {
            $user->syncRoles($data['roles']);
        }

        return $this->toEntity($user->fresh());
    }

    public function delete(int $id): bool
    {
        return (bool) $this->model->destroy($id);
    }

    public function exists(string $email): bool
    {
        return $this->model->where('email', $email)->exists();
    }

    private function toEntity(AdminUser $model): UserEntity
    {
        return new UserEntity(
            id: $model->id,
            name: $model->name,
            email: $model->email,
            isActive: $model->is_active,
            organizationId: null,
            createdAt: new DateTimeImmutable($model->created_at->toIso8601String()),
            updatedAt: $model->updated_at ? new DateTimeImmutable($model->updated_at->toIso8601String()) : null,
            lastLoginAt: $model->last_login_at ? new DateTimeImmutable($model->last_login_at->toIso8601String()) : null,
        );
    }
}
