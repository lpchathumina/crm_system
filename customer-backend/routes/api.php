<?php

use App\Http\Controllers\V1\Customer\ActivityController;
use App\Http\Controllers\V1\Customer\AuthController;
use App\Http\Controllers\V1\Customer\ContactController;
use App\Http\Controllers\V1\Customer\CustomerController;
use App\Http\Controllers\V1\Customer\DashboardController;
use App\Http\Controllers\V1\Customer\DealController;
use App\Http\Controllers\V1\Customer\LeadController;
use App\Http\Controllers\V1\Customer\NoteController;
use App\Http\Controllers\V1\Customer\NotificationController;
use App\Http\Controllers\V1\Customer\ReportController;
use App\Http\Controllers\V1\Customer\SearchController;
use App\Http\Controllers\V1\Customer\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Customer API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/customer
| All authenticated routes use auth:sanctum + tenant middleware
|
*/

Route::prefix('v1/customer')->group(function () {

    // ── Public: Authentication ───────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('customer.auth.login')
            ->middleware('throttle:customer-login');
    });

    // ── Protected: Require Sanctum token + Tenant resolution ────────────
    Route::middleware(['auth:sanctum', 'ability:customer', 'tenant'])->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('customer.auth.logout');
            Route::get('me', [AuthController::class, 'me'])->name('customer.auth.me');
            Route::post('change-password', [AuthController::class, 'changePassword'])->name('customer.auth.change-password');
            Route::put('profile', [AuthController::class, 'updateProfile'])->name('customer.auth.profile');
        });

        // Global Search
        Route::get('search', [SearchController::class, 'search'])->name('customer.search');

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index'])->name('customer.dashboard');

        // Customers (CRM records)
        Route::apiResource('customers', CustomerController::class)->names([
            'index' => 'customer.customers.index',
            'store' => 'customer.customers.store',
            'show' => 'customer.customers.show',
            'update' => 'customer.customers.update',
            'destroy' => 'customer.customers.destroy',
        ]);

        // Contacts
        Route::apiResource('contacts', ContactController::class)->names([
            'index' => 'customer.contacts.index',
            'store' => 'customer.contacts.store',
            'show' => 'customer.contacts.show',
            'update' => 'customer.contacts.update',
            'destroy' => 'customer.contacts.destroy',
        ]);

        // Leads & Conversion
        Route::post('leads/{id}/convert', [LeadController::class, 'convert'])->name('customer.leads.convert');
        Route::apiResource('leads', LeadController::class)->names([
            'index' => 'customer.leads.index',
            'store' => 'customer.leads.store',
            'show' => 'customer.leads.show',
            'update' => 'customer.leads.update',
            'destroy' => 'customer.leads.destroy',
        ]);

        // Deals & Pipeline
        Route::get('deals/pipeline', [DealController::class, 'pipeline'])->name('customer.deals.pipeline');
        Route::get('pipeline', [DealController::class, 'pipeline'])->name('customer.pipeline');
        Route::get('opportunities', [DealController::class, 'index'])->name('customer.opportunities.index');
        Route::put('deals/{id}/stage', [DealController::class, 'updateStage'])->name('customer.deals.stage');
        Route::apiResource('deals', DealController::class)->names([
            'index' => 'customer.deals.index',
            'store' => 'customer.deals.store',
            'show' => 'customer.deals.show',
            'update' => 'customer.deals.update',
            'destroy' => 'customer.deals.destroy',
        ]);

        // Tasks
        Route::put('tasks/{id}/toggle', [TaskController::class, 'toggleComplete'])->name('customer.tasks.toggle');
        Route::apiResource('tasks', TaskController::class)->names([
            'index' => 'customer.tasks.index',
            'store' => 'customer.tasks.store',
            'show' => 'customer.tasks.show',
            'update' => 'customer.tasks.update',
            'destroy' => 'customer.tasks.destroy',
        ]);

        // Activities
        Route::apiResource('activities', ActivityController::class)->only(['index', 'store', 'show', 'destroy'])->names([
            'index' => 'customer.activities.index',
            'store' => 'customer.activities.store',
            'show' => 'customer.activities.show',
            'destroy' => 'customer.activities.destroy',
        ]);

        // Notes
        Route::apiResource('notes', NoteController::class)->names([
            'index' => 'customer.notes.index',
            'store' => 'customer.notes.store',
            'show' => 'customer.notes.show',
            'update' => 'customer.notes.update',
            'destroy' => 'customer.notes.destroy',
        ]);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index'])->name('customer.notifications.index');
        Route::put('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('customer.notifications.read');
        Route::put('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('customer.notifications.read-all');

        // Reports
        Route::get('reports/pipeline', [ReportController::class, 'pipeline'])->name('customer.reports.pipeline');
        Route::get('reports/sales', [ReportController::class, 'sales'])->name('customer.reports.sales');
    });
});
