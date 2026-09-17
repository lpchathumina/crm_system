<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Activity;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ActivityController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $activities = Activity::with('user:id,name')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->actable_type, fn($q) => $q->where('actable_type', $request->actable_type))
            ->when($request->actable_id, fn($q) => $q->where('actable_id', $request->actable_id))
            ->orderByDesc('occurred_at')
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($activities);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:call,meeting,email,task,note,follow_up,other',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'occurred_at' => 'nullable|date',
            'actable_type' => 'nullable|string',
            'actable_id' => 'nullable|integer',
            'metadata' => 'nullable|array',
        ]);

        $validated['organization_id'] = $request->user()->organization_id;
        $validated['user_id'] = $request->user()->id;
        $validated['occurred_at'] = $validated['occurred_at'] ?? now();

        $activity = Activity::create($validated);

        return $this->successResponse($activity->load('user:id,name'), 'Activity logged', 201);
    }

    public function show(int $id): JsonResponse
    {
        $activity = Activity::with('user:id,name')->findOrFail($id);
        return $this->successResponse($activity);
    }

    public function destroy(int $id): JsonResponse
    {
        Activity::findOrFail($id)->delete();
        return $this->successResponse(null, 'Activity deleted');
    }
}
