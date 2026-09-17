<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deal extends TenantModel
{
    protected $table = 'deals';

    protected $fillable = [
        'organization_id', 'customer_id', 'owner_id',
        'title', 'description', 'stage', 'value',
        'currency', 'probability', 'expected_close_date',
        'actual_close_date', 'lost_reason', 'tags', 'custom_fields',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'probability' => 'integer',
        'expected_close_date' => 'date',
        'actual_close_date' => 'date',
        'tags' => 'array',
        'custom_fields' => 'array',
    ];

    // Pipeline stages (Kanban columns)
    const STAGE_PROSPECTING = 'prospecting';
    const STAGE_QUALIFICATION = 'qualification';
    const STAGE_PROPOSAL = 'proposal';
    const STAGE_NEGOTIATION = 'negotiation';
    const STAGE_CLOSED_WON = 'closed_won';
    const STAGE_CLOSED_LOST = 'closed_lost';

    const STAGES = [
        self::STAGE_PROSPECTING,
        self::STAGE_QUALIFICATION,
        self::STAGE_PROPOSAL,
        self::STAGE_NEGOTIATION,
        self::STAGE_CLOSED_WON,
        self::STAGE_CLOSED_LOST,
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'owner_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }
}
