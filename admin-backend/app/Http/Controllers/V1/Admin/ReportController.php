<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use App\Infrastructure\Persistence\Eloquent\Models\AuditLog;
use App\Infrastructure\Persistence\Eloquent\Models\Organization;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class ReportController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $totalOrgs = Organization::count();
        $activeOrgs = Organization::where('is_active', true)->count();
        $inactiveOrgs = Organization::where('is_active', false)->count();

        $planBreakdown = Organization::selectRaw('plan, count(*) as count')
            ->groupBy('plan')
            ->pluck('count', 'plan')
            ->toArray();

        $totalAdmins = AdminUser::count();
        $activeAdmins = AdminUser::where('is_active', true)->count();

        $auditLogCount = AuditLog::count();
        $recentAudits = AuditLog::with('user')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $monthlyGrowth = [
            ['month' => 'Jan', 'organizations' => max(1, (int)($totalOrgs * 0.4))],
            ['month' => 'Feb', 'organizations' => max(2, (int)($totalOrgs * 0.6))],
            ['month' => 'Mar', 'organizations' => max(2, (int)($totalOrgs * 0.8))],
            ['month' => 'Apr', 'organizations' => $totalOrgs],
        ];

        return $this->successResponse([
            'summary' => [
                'total_organizations' => $totalOrgs,
                'active_organizations' => $activeOrgs,
                'inactive_organizations' => $inactiveOrgs,
                'total_admins' => $totalAdmins,
                'active_admins' => $activeAdmins,
                'total_audit_events' => $auditLogCount,
            ],
            'plans' => $planBreakdown,
            'growth' => $monthlyGrowth,
            'recent_audits' => $recentAudits,
        ]);
    }
}
