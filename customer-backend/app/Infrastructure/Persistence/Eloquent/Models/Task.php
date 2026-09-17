<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Task extends TenantModel
{
    protected $table = 'tasks';

    protected $fillable = [
        'organization_id', 'owner_id', 'assigned_to',
        'taskable_id', 'taskable_type',
        'title', 'description', 'status', 'priority',
        'due_date', 'completed_at', 'tags',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
        'tags' => 'array',
    ];

    const STATUS_TODO = 'todo';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_DONE = 'done';
    const STATUS_CANCELLED = 'cancelled';

    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    public function taskable(): MorphTo
    {
        return $this->morphTo();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'owner_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'assigned_to');
    }
}
