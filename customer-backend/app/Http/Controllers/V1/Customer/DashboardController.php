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
        $wonCount = Deal::where('stage', Deal::STAGE_CLOSED_WON)->count();
        $lostCount = Deal::where('stage', Deal::STAGE_CLOSED_LOST)->count();
        $totalClosed = $wonCount + $lostCount;
        $winRate = $totalClosed > 0 ? round(($wonCount / $totalClosed) * 100, 1) : 0;

        $stats = [
            'total_customers' => Customer::count(),
            'total_contacts' => \App\Infrastructure\Persistence\Eloquent\Models\Contact::count(),
            'total_leads' => Lead::count(),
            'total_deals' => Deal::count(),
            'open_tasks' => Task::whereIn('status', [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS])->count(),
            'overdue_tasks' => Task::whereIn('status', [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS])
                ->where('due_date', '<', now())
                ->count(),
            'deals_by_stage' => Deal::selectRaw('stage, count(*) as count, COALESCE(SUM(value), 0) as total_value')
                ->groupBy('stage')
                ->get()
                ->keyBy('stage'),
            'deals_won_this_month' => (float) Deal::where('stage', Deal::STAGE_CLOSED_WON)
                ->whereMonth('updated_at', now()->month)
                ->sum('value'),
            'new_customers_this_month' => Customer::whereMonth('created_at', now()->month)->count(),
            'pipeline_value' => (float) Deal::whereNotIn('stage', [Deal::STAGE_CLOSED_WON, Deal::STAGE_CLOSED_LOST])->sum('value'),
            'win_rate' => $winRate,
            'recent_deals' => Deal::with('customer:id,name,company', 'owner:id,name')
                ->latest()
                ->take(5)
                ->get(),
            'recent_customers' => Customer::with('owner:id,name')
                ->latest()
                ->take(5)
                ->get(),
            'recent_activities' => \App\Infrastructure\Persistence\Eloquent\Models\Activity::with('user:id,name')
                ->latest('occurred_at')
                ->take(8)
                ->get(),
            'upcoming_tasks' => Task::where('status', Task::STATUS_TODO)
                ->whereNotNull('due_date')
                ->orderBy('due_date')
                ->take(5)
                ->get(),
        ];

        $stats['metrics'] = [
            'total_customers' => $stats['total_customers'],
            'total_contacts' => $stats['total_contacts'],
            'total_leads' => $stats['total_leads'],
            'open_deals' => Deal::whereNotIn('stage', [Deal::STAGE_CLOSED_WON, Deal::STAGE_CLOSED_LOST])->count(),
            'won_deals' => $wonCount,
            'lost_deals' => $lostCount,
            'pipeline_value' => $stats['pipeline_value'],
            'won_revenue' => (float) Deal::where('stage', Deal::STAGE_CLOSED_WON)->sum('value'),
            'win_rate' => $winRate,
            'pending_tasks' => $stats['open_tasks'],
            'overdue_tasks' => $stats['overdue_tasks'],
            'conversion_rate' => Lead::count() > 0 ? round((Lead::where('status', 'converted')->count() / Lead::count()) * 100, 1) : 0,
        ];
        $stats['won_revenue'] = $stats['metrics']['won_revenue'];
        $stats['pipeline_summary'] = Deal::selectRaw('stage, count(*) as count, COALESCE(SUM(value), 0) as total_value')
            ->groupBy('stage')
            ->get();

        return $this->successResponse($stats);
    }
}
