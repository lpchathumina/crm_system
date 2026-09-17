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
        return $this->successResponse(new OrganizationResource($org), 'Organization updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->orgRepository->delete($id);
        return $this->successResponse(null, 'Organization deleted');
    }
}
