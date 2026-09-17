<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Deal;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DealController extends Controller
{
    use ApiResponse;

    /**
     * Returns deals grouped by stage for Kanban pipeline view.
     */
    public function pipeline(Request $request): JsonResponse
    {
        $query = Deal::with(['customer:id,name,company', 'owner:id,name'])
            ->withCount('tasks')
            ->orderBy('updated_at', 'desc');

        if ($request->owner_id) {
            $query->where('owner_id', $request->owner_id);
        }

        $deals = $query->get();

        $kanban = collect(Deal::STAGES)->mapWithKeys(fn($stage) => [
            $stage => [
                'stage' => $stage,
                'count' => 0,
                'total_value' => 0,
                'deals' => [],
            ],
        ]);

        foreach ($deals as $deal) {
            if (isset($kanban[$deal->stage])) {
                $kanban[$deal->stage]['count']++;
                $kanban[$deal->stage]['total_value'] += $deal->value;
                $kanban[$deal->stage]['deals'][] = $deal;
            }
        }

        return $this->successResponse($kanban->values());
    }

    public function index(Request $request): JsonResponse
    {
        $deals = Deal::with(['customer:id,name,company', 'owner:id,name'])
            ->when($request->stage, fn($q) => $q->where('stage', $request->stage))
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->when($request->owner_id, fn($q) => $q->where('owner_id', $request->owner_id))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($deals);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'stage' => 'required|in:' . implode(',', Deal::STAGES),
            'value' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
        ]);

        // Verify customer belongs to the same org (TenantModel scope handles this)
        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;

        $deal = Deal::create($data);
        $deal->load('customer:id,name,company', 'owner:id,name');

        return $this->successResponse($deal, 'Deal created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $deal = Deal::with([
            'customer:id,name,company,email',
            'owner:id,name,email',
            'tasks',
            'activities' => fn($q) => $q->latest()->take(20),
            'notes',
        ])->findOrFail($id);

        return $this->successResponse($deal);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $deal = Deal::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'stage' => 'sometimes|in:' . implode(',', Deal::STAGES),
            'value' => 'nullable|numeric|min:0',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
        ]);

        $deal->update($request->validated());

        return $this->successResponse($deal, 'Deal updated');
    }

    public function updateStage(Request $request, int $id): JsonResponse
    {
        $deal = Deal::findOrFail($id);

        $request->validate([
            'stage' => 'required|in:' . implode(',', Deal::STAGES),
        ]);

        $oldStage = $deal->stage;
        $deal->update(['stage' => $request->stage]);

        // Record activity for stage change
        \App\Infrastructure\Persistence\Eloquent\Models\Activity::create([
            'user_id' => $request->user()->id,
            'actable_id' => $deal->id,
            'actable_type' => Deal::class,
            'type' => \App\Infrastructure\Persistence\Eloquent\Models\Activity::TYPE_STATUS_CHANGE,
            'subject' => "Deal moved from {$oldStage} to {$request->stage}",
            'occurred_at' => now(),
            'metadata' => ['from' => $oldStage, 'to' => $request->stage],
        ]);

        return $this->successResponse($deal, 'Deal stage updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Deal::findOrFail($id)->delete();
        return $this->successResponse(null, 'Deal deleted');
    }
}
