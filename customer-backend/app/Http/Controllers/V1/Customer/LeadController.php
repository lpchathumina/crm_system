<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Lead;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LeadController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $leads = Lead::with('customer:id,name,company', 'owner:id,name')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($leads);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|integer',
            'title' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:150',
            'job_title' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|in:new,contacted,qualified,unqualified,converted,lost',
            'source' => 'nullable|string|max:50',
            'estimated_value' => 'nullable|numeric|min:0',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
        ]);

        $title = $validated['title'] ?? trim(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? '') . ' - ' . ($validated['company_name'] ?? 'Lead'));
        if (empty($title) || $title === '-') {
            $title = 'New Prospect';
        }

        $customFields = [
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
        ];

        $lead = Lead::create([
            'organization_id' => $request->user()->organization_id,
            'customer_id' => $validated['customer_id'] ?? null,
            'owner_id' => $request->user()->id,
            'title' => $title,
            'description' => $validated['description'] ?? ($validated['notes'] ?? null),
            'status' => $validated['status'] ?? Lead::STATUS_NEW,
            'source' => $validated['source'] ?? 'website',
            'estimated_value' => $validated['estimated_value'] ?? null,
            'probability' => $validated['probability'] ?? 50,
            'expected_close_date' => $validated['expected_close_date'] ?? null,
            'custom_fields' => $customFields,
        ]);

        return $this->successResponse($lead, 'Lead created', 201);
    }

    public function convert(Request $request, int $id, \App\Application\Services\LeadConversionService $service): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $result = $service->convert($lead, $request->all(), $request->user());
        return $this->successResponse($result, 'Lead converted successfully');
    }

    public function show(int $id): JsonResponse
    {
        $lead = Lead::with('customer:id,name,company', 'owner:id,name')->findOrFail($id);
        return $this->successResponse($lead);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:new,contacted,qualified,unqualified,converted',
            'estimated_value' => 'nullable|numeric|min:0',
            'probability' => 'nullable|integer|min:0|max:100',
        ]);
        $lead->update($request->validated());
        return $this->successResponse($lead, 'Lead updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Lead::findOrFail($id)->delete();
        return $this->successResponse(null, 'Lead deleted');
    }
}
