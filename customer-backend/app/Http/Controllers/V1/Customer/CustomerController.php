<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Customer;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('company', 'like', "%{$request->search}%");
            }))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->source, fn($q) => $q->where('source', $request->source))
            ->when($request->owner_id, fn($q) => $q->where('owner_id', $request->owner_id))
            ->with(['owner:id,name,email', 'contacts'])
            ->withCount(['deals', 'leads', 'tasks'])
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'website' => 'nullable|url',
            'status' => 'in:active,inactive,prospect,churned',
            'source' => 'nullable|string|max:50',
            'tags' => 'array',
        ]);

        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;
        // organization_id is auto-set by TenantModel::booted()

        $customer = Customer::create($data);
        $customer->load('owner:id,name,email');

        return $this->successResponse($customer, 'Customer created', 201);
    }

    public function show(int $id): JsonResponse
    {
        // TenantModel global scope ensures this can only return records in the user's org
        $customer = Customer::with([
            'owner:id,name,email',
            'contacts',
            'leads' => fn($q) => $q->latest()->take(5),
            'deals' => fn($q) => $q->latest()->take(5),
            'activities' => fn($q) => $q->latest()->take(10),
            'notes' => fn($q) => $q->latest()->take(5),
        ])->findOrFail($id);

        return $this->successResponse($customer);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,inactive,prospect,churned',
            'tags' => 'array',
        ]);

        $customer->update($request->validated());

        return $this->successResponse($customer, 'Customer updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Customer::findOrFail($id)->delete();
        return $this->successResponse(null, 'Customer deleted');
    }
}
