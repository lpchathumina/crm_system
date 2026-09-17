<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Note extends TenantModel
{
    protected $table = 'notes';

    protected $fillable = [
        'organization_id', 'user_id',
        'notable_id', 'notable_type',
        'content', 'is_pinned', 'tags',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'tags' => 'array',
    ];

    public function notable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'user_id');
    }
}
