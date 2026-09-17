<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Customer;
use App\Infrastructure\Persistence\Eloquent\Models\Deal;
use App\Infrastructure\Persistence\Eloquent\Models\Lead;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    public function pipeline(Request $request): JsonResponse
    {
        $pipeline = Deal::selectRaw('stage, count(*) as count, SUM(value) as total_value, AVG(probability) as avg_probability')
            ->when($request->owner_id, fn($q) => $q->where('owner_id', $request->owner_id))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->groupBy('stage')
            ->get()
            ->keyBy('stage');

        return $this->successResponse([
            'pipeline_by_stage' => $pipeline,
            'total_pipeline_value' => Deal::whereNotIn('stage', [Deal::STAGE_CLOSED_WON, Deal::STAGE_CLOSED_LOST])->sum('value'),
            'won_value' => Deal::where('stage', Deal::STAGE_CLOSED_WON)->sum('value'),
            'lost_count' => Deal::where('stage', Deal::STAGE_CLOSED_LOST)->count(),
        ]);
    }

    public function sales(Request $request): JsonResponse
    {
        $wonDeals = Deal::where('stage', Deal::STAGE_CLOSED_WON)
            ->when($request->date_from, fn($q) => $q->whereDate('updated_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('updated_at', '<=', $request->date_to));

        return $this->successResponse([
            'total_revenue' => $wonDeals->sum('value'),
            'deals_won' => $wonDeals->count(),
            'avg_deal_size' => $wonDeals->avg('value'),
            'new_customers' => Customer::when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))->count(),
            'conversion_rate' => $this->calculateConversionRate($request),
            'monthly_breakdown' => Deal::where('stage', Deal::STAGE_CLOSED_WON)
                ->selectRaw("DATE_TRUNC('month', updated_at) as month, SUM(value) as revenue, count(*) as count")
                ->groupByRaw("DATE_TRUNC('month', updated_at)")
                ->orderBy('month')
                ->get(),
        ]);
    }

    private function calculateConversionRate(Request $request): float
    {
        $totalLeads = Lead::count();
        $convertedLeads = Lead::where('status', Lead::STATUS_CONVERTED)->count();
        return $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;
    }
}
