<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Contact;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ContactController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $contacts = Contact::query()
            ->with('customer:id,name,company', 'owner:id,name')
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($contacts);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|integer',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'title' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
        ]);

        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;

        $contact = Contact::create($data);
        return $this->successResponse($contact, 'Contact created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $contact = Contact::with('customer:id,name,company', 'owner:id,name')->findOrFail($id);
        return $this->successResponse($contact);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'is_primary' => 'boolean',
        ]);

        $contact->update($request->validated());
        return $this->successResponse($contact, 'Contact updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Contact::findOrFail($id)->delete();
        return $this->successResponse(null, 'Contact deleted');
    }
}
