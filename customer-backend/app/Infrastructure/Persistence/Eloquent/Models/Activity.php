<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Activity extends TenantModel
{
    protected $table = 'activities';

    protected $fillable = [
        'organization_id', 'user_id',
        'actable_id', 'actable_type',
        'type', 'subject', 'description',
        'occurred_at', 'metadata',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'metadata' => 'array',
    ];

    const TYPE_CALL = 'call';
    const TYPE_EMAIL = 'email';
    const TYPE_MEETING = 'meeting';
    const TYPE_NOTE = 'note';
    const TYPE_TASK = 'task';
    const TYPE_STATUS_CHANGE = 'status_change';

    public function actable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'user_id');
    }
}
