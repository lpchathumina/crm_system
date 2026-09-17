<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Http\Requests\Customer\Auth\LoginRequest;
use App\Infrastructure\Persistence\Eloquent\Models\OrgUser;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(LoginRequest $request): JsonResponse
    {
        $user = OrgUser::with('organization')
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Invalid credentials', 401);
        }

        if (!$user->is_active) {
            return $this->errorResponse('Account is deactivated', 403);
        }

        if (!$user->organization || !$user->organization->is_active) {
            return $this->errorResponse('Organization is inactive', 403);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $token = $user->createToken(
            'crm-token',
            ['customer'],
            now()->addDays((int) config('sanctum.customer_token_expiry_days', 7))
        );

        return $this->successResponse([
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'roles' => $user->getRoleNames(),
                'organization' => [
                    'id' => $user->organization->id,
                    'name' => $user->organization->name,
                    'plan' => $user->organization->plan,
                ],
            ],
        ], 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('organization', 'roles');

        return $this->successResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'timezone' => $user->timezone,
            'roles' => $user->getRoleNames(),
            'organization' => $user->organization,
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password does not match.', 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return $this->successResponse(null, 'Password changed successfully');
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'timezone' => ['nullable', 'string', 'max:50'],
        ]);

        $user->update($validated);

        return $this->successResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'timezone' => $user->timezone,
            'roles' => $user->getRoleNames(),
            'organization' => $user->organization,
        ], 'Profile updated successfully');
    }
}
