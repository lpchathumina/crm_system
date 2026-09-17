<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * TenantMiddleware — Multi-tenant isolation.
 *
 * SECURITY CRITICAL:
 * - The organization_id is NEVER taken from request payload or query string.
 * - It is ALWAYS resolved from the authenticated user's record in the database.
 * - This prevents tenant data leakage via parameter tampering.
 */
class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with any organization',
            ], 403);
        }

        $organization = $user->organization;

        if (!$organization || !$organization->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Organization is inactive or not found',
            ], 403);
        }

        // Bind the resolved organization to the request
        // All repositories and controllers must use this, never request input
        $request->merge(['_resolved_organization_id' => $user->organization_id]);

        // Share with the rest of the request lifecycle via the container
        app()->instance('current.organization_id', $user->organization_id);
        app()->instance('current.organization', $organization);

        return $next($request);
    }
}
