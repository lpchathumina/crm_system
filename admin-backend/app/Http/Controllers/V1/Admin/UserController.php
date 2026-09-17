<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Http\Requests\Admin\User\CreateUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Admin Users', description: 'Admin user management')]
class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly UserRepositoryInterface $userRepository) {}

    #[OA\Get(
        path: '/api/v1/admin/users',
        summary: 'List all admin users',
        security: [['sanctum' => []]],
        tags: ['Admin Users'],
        parameters: [
            new OA\Parameter(name: 'search', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'is_active', in: 'query', schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'role', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [new OA\Response(response: 200, description: 'Users list')]
    )]
    public function index(Request $request): JsonResponse
    {
        $users = $this->userRepository->paginate(
            perPage: (int) $request->get('per_page', 15),
            filters: $request->only(['search', 'is_active', 'role'])
        );

        return $this->paginatedResponse($users, UserResource::class);
    }

    #[OA\Post(
        path: '/api/v1/admin/users',
        summary: 'Create an admin user',
        security: [['sanctum' => []]],
        tags: ['Admin Users'],
        responses: [
            new OA\Response(response: 201, description: 'User created'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userRepository->create($request->validated());
        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
    }

    #[OA\Get(
        path: '/api/v1/admin/users/{id}',
        summary: 'Get a user by ID',
        security: [['sanctum' => []]],
        tags: ['Admin Users'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'User details'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);

        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        return $this->successResponse(new UserResource($user));
    }

    #[OA\Put(
        path: '/api/v1/admin/users/{id}',
        summary: 'Update a user',
        security: [['sanctum' => []]],
        tags: ['Admin Users'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'User updated'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userRepository->update($id, $request->validated());
        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    #[OA\Delete(
        path: '/api/v1/admin/users/{id}',
        summary: 'Delete a user',
        security: [['sanctum' => []]],
        tags: ['Admin Users'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'User deleted'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $this->userRepository->delete($id);
        return $this->successResponse(null, 'User deleted successfully');
    }
}
