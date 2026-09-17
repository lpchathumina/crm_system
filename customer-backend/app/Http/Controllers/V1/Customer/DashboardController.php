<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Customer;
use App\Infrastructure\Persistence\Eloquent\Models\Deal;
use App\Infrastructure\Persistence\Eloquent\Models\Lead;
use App\Infrastructure\Persistence\Eloquent\Models\Task;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $stats = [
            'total_customers' => Customer::count(),
            'total_leads' => Lead::count(),
            'total_deals' => Deal::count(),
            'open_tasks' => Task::where('status', Task::STATUS_TODO)->orWhere('status', Task::STATUS_IN_PROGRESS)->count(),
            'deals_by_stage' => Deal::selectRaw('stage, count(*) as count, SUM(value) as total_value')
                ->groupBy('stage')
                ->get()
                ->keyBy('stage'),
            'deals_won_this_month' => Deal::where('stage', Deal::STAGE_CLOSED_WON)
                ->whereMonth('updated_at', now()->month)
                ->sum('value'),
            'new_customers_this_month' => Customer::whereMonth('created_at', now()->month)->count(),
            'pipeline_value' => Deal::whereNotIn('stage', [Deal::STAGE_CLOSED_WON, Deal::STAGE_CLOSED_LOST])->sum('value'),
            'recent_activities' => \App\Infrastructure\Persistence\Eloquent\Models\Activity::with('user')
                ->latest('occurred_at')
                ->take(10)
                ->get(),
            'upcoming_tasks' => Task::where('status', Task::STATUS_TODO)
                ->whereNotNull('due_date')
                ->orderBy('due_date')
                ->take(5)
                ->get(),
        ];

        return $this->successResponse($stats);
    }
}
