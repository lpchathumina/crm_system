<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use App\Infrastructure\Persistence\Eloquent\Models\Organization;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $stats = [
            'total_users' => AdminUser::count(),
            'active_users' => AdminUser::where('is_active', true)->count(),
            'total_organizations' => Organization::count(),
            'active_organizations' => Organization::where('is_active', true)->count(),
            'users_this_month' => AdminUser::whereMonth('created_at', now()->month)->count(),
            'orgs_this_month' => Organization::whereMonth('created_at', now()->month)->count(),
            'organizations_by_plan' => Organization::groupBy('plan')
                ->selectRaw('plan, count(*) as count')
                ->pluck('count', 'plan'),
            'recent_users' => AdminUser::with('roles')
                ->latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'is_active', 'created_at']),
        ];

        return $this->successResponse($stats);
    }
}
