<?php

use App\Http\Controllers\V1\Admin\AuthController;
use App\Http\Controllers\V1\Admin\AuditLogController;
use App\Http\Controllers\V1\Admin\DashboardController;
use App\Http\Controllers\V1\Admin\OrganizationController;
use App\Http\Controllers\V1\Admin\ReportController;
use App\Http\Controllers\V1\Admin\RoleController;
use App\Http\Controllers\V1\Admin\SettingController;
use App\Http\Controllers\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/admin
| All authenticated routes use auth:sanctum middleware
|
*/

Route::prefix('v1/admin')->group(function () {

    // ── Public: Authentication ───────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('admin.auth.login');
    });

    // ── Protected: Require Sanctum token ────────────────────────────────
    Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('admin.auth.logout');
            Route::get('me', [AuthController::class, 'me'])->name('admin.auth.me');
            Route::post('change-password', [AuthController::class, 'changePassword'])->name('admin.auth.change-password');
            Route::put('profile', [AuthController::class, 'updateProfile'])->name('admin.auth.profile');
        });

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

        // Users
        Route::apiResource('users', UserController::class)->names([
            'index' => 'admin.users.index',
            'store' => 'admin.users.store',
            'show' => 'admin.users.show',
            'update' => 'admin.users.update',
            'destroy' => 'admin.users.destroy',
        ]);

        // Organizations
        Route::put('organizations/{id}/toggle-status', [OrganizationController::class, 'toggleStatus'])->name('admin.organizations.toggle');
        Route::get('organizations/{id}/statistics', [OrganizationController::class, 'statistics'])->name('admin.organizations.statistics');
        Route::apiResource('organizations', OrganizationController::class)->names([
            'index' => 'admin.organizations.index',
            'store' => 'admin.organizations.store',
            'show' => 'admin.organizations.show',
            'update' => 'admin.organizations.update',
            'destroy' => 'admin.organizations.destroy',
        ]);

        // Roles & Permissions
        Route::get('roles', [RoleController::class, 'index'])->name('admin.roles.index');
        Route::post('roles', [RoleController::class, 'store'])->name('admin.roles.store');
        Route::get('roles/{id}', [RoleController::class, 'show'])->name('admin.roles.show');
        Route::put('roles/{id}', [RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('roles/{id}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
        Route::get('permissions', [RoleController::class, 'permissions'])->name('admin.permissions.index');

        // Audit Logs
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('admin.audit-logs.index');
        Route::get('audit-logs/{id}', [AuditLogController::class, 'show'])->name('admin.audit-logs.show');

        // Settings
        Route::get('settings', [SettingController::class, 'index'])->name('admin.settings.index');
        Route::put('settings', [SettingController::class, 'update'])->name('admin.settings.update');

        // Reports
        Route::get('reports', [ReportController::class, 'index'])->name('admin.reports.index');
    });
});
