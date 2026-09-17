<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\AuditLog\Entities\AuditLog as AuditLogEntity;
use App\Domain\AuditLog\Repositories\AuditLogRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\AuditLog;
use DateTimeImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentAuditLogRepository implements AuditLogRepositoryInterface
{
    public function __construct(private readonly AuditLog $model) {}

    public function create(array $data): AuditLogEntity
    {
        $log = $this->model->create($data);
        return $this->toEntity($log);
    }

    public function paginate(int $perPage = 50, array $filters = []): LengthAwarePaginator
    {
        return $this->model->with('user')
            ->when(!empty($filters['user_id']), fn($q) => $q->where('user_id', $filters['user_id']))
            ->when(!empty($filters['action']), fn($q) => $q->where('action', $filters['action']))
            ->latest()
            ->paginate($perPage);
    }

    private function toEntity(AuditLog $model): AuditLogEntity
    {
        return new AuditLogEntity(
            id: $model->id,
            userId: $model->user_id,
            action: $model->action,
            modelType: $model->model_type,
            modelId: $model->model_id,
            oldValues: $model->old_values,
            newValues: $model->new_values,
            ipAddress: $model->ip_address,
            userAgent: $model->user_agent,
            createdAt: new DateTimeImmutable($model->created_at->toIso8601String()),
        );
    }
}
