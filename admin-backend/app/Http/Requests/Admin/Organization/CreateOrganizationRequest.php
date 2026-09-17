<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Organization;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('admin.organizations.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:organizations,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:255'],
            'plan' => ['required', 'string', 'in:free,starter,professional,enterprise'],
            'timezone' => ['nullable', 'timezone'],
            'is_active' => ['boolean'],
        ];
    }
}
