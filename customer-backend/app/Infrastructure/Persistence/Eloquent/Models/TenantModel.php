<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Base model for all tenant-scoped CRM resources.
 *
 * Automatically filters by the organization resolved from the authenticated user.
 * NEVER allows organization_id from request input to override this.
 */
abstract class TenantModel extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        // Global scope: every query is automatically filtered by org
        static::addGlobalScope('tenant', function (Builder $builder) {
            $orgId = app()->bound('current.organization_id')
                ? app('current.organization_id')
                : null;

            if ($orgId) {
                $builder->where((new static())->getTable() . '.organization_id', $orgId);
            }
        });

        // Auto-fill organization_id on create from resolved context
        static::creating(function (self $model) {
            if (app()->bound('current.organization_id') && !$model->organization_id) {
                $model->organization_id = app('current.organization_id');
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
