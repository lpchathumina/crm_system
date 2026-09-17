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
        $request->validate([
            'customer_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'status' => 'in:new,contacted,qualified,unqualified,converted',
            'source' => 'nullable|string|max:50',
            'estimated_value' => 'nullable|numeric|min:0',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
        ]);

        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;
        $data['status'] = $data['status'] ?? Lead::STATUS_NEW;

        $lead = Lead::create($data);
        return $this->successResponse($lead, 'Lead created', 201);
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
