<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends TenantModel
{
    protected $table = 'crm_notifications';

    protected $fillable = [
        'organization_id', 'user_id',
        'type', 'title', 'message',
        'data', 'is_read', 'read_at',
        'notifiable_id', 'notifiable_type',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'user_id');
    }

    public function markAsRead(): void
    {
        $this->update(['is_read' => true, 'read_at' => now()]);
    }
}
