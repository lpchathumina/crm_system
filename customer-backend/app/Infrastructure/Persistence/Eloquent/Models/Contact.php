<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends TenantModel
{
    protected $table = 'contacts';

    protected $fillable = [
        'organization_id', 'customer_id', 'owner_id',
        'first_name', 'last_name', 'email', 'phone',
        'title', 'department', 'is_primary', 'tags',
        'social_links', 'custom_fields',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'tags' => 'array',
        'social_links' => 'array',
        'custom_fields' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(OrgUser::class, 'owner_id');
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
