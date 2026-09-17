<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $roles = Role::with('permissions')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($roles);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|unique:roles,name', 'permissions' => 'array']);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'sanctum']);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return $this->successResponse($role->load('permissions'), 'Role created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $role = Role::with('permissions')->findOrFail($id);
        return $this->successResponse($role);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $request->validate(['name' => "required|string|unique:roles,name,{$id}", 'permissions' => 'array']);

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return $this->successResponse($role->load('permissions'), 'Role updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Role::findOrFail($id)->delete();
        return $this->successResponse(null, 'Role deleted');
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy('group');
        return $this->successResponse($permissions);
    }
}
