<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Infrastructure\Persistence\Eloquent\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    private const AUDITABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (!in_array($request->method(), self::AUDITABLE_METHODS, true)) {
            return;
        }

        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return;
        }

        $user = $request->user();
        if (!$user) {
            return;
        }

        AuditLog::create([
            'user_id' => $user->id,
            'user_type' => 'admin',
            'action' => $this->resolveAction($request->method()),
            'model_type' => $this->resolveModelType($request),
            'model_id' => $this->resolveModelId($request),
            'old_values' => null,
            'new_values' => $this->sanitizePayload($request->all()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'description' => "{$request->method()} {$request->path()}",
        ]);
    }

    private function resolveAction(string $method): string
    {
        return match ($method) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'other',
        };
    }

    private function resolveModelType(Request $request): string
    {
        $segments = $request->segments();
        return implode('/', array_slice($segments, 0, -1));
    }

    private function resolveModelId(Request $request): ?int
    {
        $last = last($request->segments());
        return is_numeric($last) ? (int) $last : null;
    }

    private function sanitizePayload(array $data): array
    {
        unset($data['password'], $data['password_confirmation'], $data['token']);
        return $data;
    }
}
