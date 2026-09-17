<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Organization;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('admin.organizations.update');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', "unique:organizations,email,{$this->route('id')}"],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:255'],
            'plan' => ['sometimes', 'string', 'in:free,starter,professional,enterprise'],
            'timezone' => ['nullable', 'timezone'],
            'is_active' => ['boolean'],
        ];
    }
}
