<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends TenantModel
{
    protected $table = 'leads';

    protected $fillable = [
        'organization_id', 'customer_id', 'owner_id',
        'title', 'description', 'status', 'source',
        'estimated_value', 'probability', 'expected_close_date',
        'tags', 'custom_fields',
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
        'probability' => 'integer',
        'expected_close_date' => 'date',
        'tags' => 'array',
        'custom_fields' => 'array',
    ];

    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_QUALIFIED = 'qualified';
    const STATUS_UNQUALIFIED = 'unqualified';
    const STATUS_CONVERTED = 'converted';

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'owner_id');
    }
}
