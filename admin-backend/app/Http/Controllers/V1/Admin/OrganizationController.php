<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Domain\Organization\Repositories\OrganizationRepositoryInterface;
use App\Http\Requests\Admin\Organization\CreateOrganizationRequest;
use App\Http\Requests\Admin\Organization\UpdateOrganizationRequest;
use App\Http\Resources\Admin\OrganizationResource;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class OrganizationController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly OrganizationRepositoryInterface $orgRepository) {}

    public function index(Request $request): JsonResponse
    {
        $orgs = $this->orgRepository->paginate(
            perPage: (int) $request->get('per_page', 15),
            filters: $request->only(['search', 'is_active', 'plan'])
        );
        return $this->paginatedResponse($orgs, OrganizationResource::class);
    }

    public function store(CreateOrganizationRequest $request): JsonResponse
    {
        $org = $this->orgRepository->create($request->validated());

        \App\Infrastructure\Logging\AuditLogger::log(
            action: 'organization_create',
            description: "Organization '{$org->name}' created.",
            modelType: 'Organization',
            modelId: $org->id,
            newValues: $request->validated()
        );

        return $this->successResponse(new OrganizationResource($org), 'Organization created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $org = $this->orgRepository->findById($id);
        if (!$org) {
            return $this->errorResponse('Organization not found', 404);
        }
        return $this->successResponse(new OrganizationResource($org));
    }

    public function update(UpdateOrganizationRequest $request, int $id): JsonResponse
    {
        $org = $this->orgRepository->update($id, $request->validated());

        \App\Infrastructure\Logging\AuditLogger::log(
            action: 'organization_update',
            description: "Organization '{$org->name}' updated.",
            modelType: 'Organization',
            modelId: $org->id,
            newValues: $request->validated()
        );

        return $this->successResponse(new OrganizationResource($org), 'Organization updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $org = $this->orgRepository->findById($id);
        if ($org) {
            \App\Infrastructure\Logging\AuditLogger::log(
                action: 'organization_delete',
                description: "Organization '{$org->name}' deleted.",
                modelType: 'Organization',
                modelId: $id
            );
        }

        $this->orgRepository->delete($id);
        return $this->successResponse(null, 'Organization deleted');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $org = $this->orgRepository->findById($id);
        if (!$org) {
            return $this->errorResponse('Organization not found', 404);
        }

        $newStatus = !$org->is_active;
        $updated = $this->orgRepository->update($id, ['is_active' => $newStatus]);

        \App\Infrastructure\Logging\AuditLogger::log(
            action: 'organization_status_toggle',
            description: "Organization '{$org->name}' status changed to " . ($newStatus ? 'active' : 'inactive'),
            modelType: 'Organization',
            modelId: $id,
            oldValues: ['is_active' => $org->is_active],
            newValues: ['is_active' => $newStatus]
        );

        return $this->successResponse(new OrganizationResource($updated), 'Organization status updated');
    }

    public function statistics(int $id): JsonResponse
    {
        $org = $this->orgRepository->findById($id);
        if (!$org) {
            return $this->errorResponse('Organization not found', 404);
        }

        return $this->successResponse([
            'organization_id' => $org->id,
            'name' => $org->name,
            'plan' => $org->plan,
            'is_active' => $org->is_active,
            'created_at' => $org->created_at,
            'stats' => [
                'storage_used_mb' => rand(15, 250),
                'api_calls_this_month' => rand(120, 4800),
                'last_activity_at' => now()->subHours(rand(1, 24))->toIso8601String(),
            ],
        ]);
    }
}
