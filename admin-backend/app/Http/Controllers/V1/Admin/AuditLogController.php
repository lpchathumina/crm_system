<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Infrastructure\Persistence\Eloquent\Models\AuditLog;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user')
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->action, fn($q) => $q->where('action', $request->action))
            ->when($request->model_type, fn($q) => $q->where('model_type', $request->model_type))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->paginate($request->get('per_page', 50));

        return $this->paginatedResponse($logs);
    }

    public function show(int $id): JsonResponse
    {
        $log = AuditLog::with('user')->findOrFail($id);
        return $this->successResponse($log);
    }
}
