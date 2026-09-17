<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\AuditLog\Repositories\AuditLogRepositoryInterface;
use App\Domain\Organization\Repositories\OrganizationRepositoryInterface;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use App\Infrastructure\Persistence\Repositories\EloquentOrganizationRepository;
use App\Infrastructure\Persistence\Repositories\EloquentUserRepository;
use App\Infrastructure\Persistence\Repositories\EloquentAuditLogRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, function () {
            return new EloquentUserRepository(new AdminUser());
        });

        $this->app->bind(
            OrganizationRepositoryInterface::class,
            EloquentOrganizationRepository::class
        );

        $this->app->bind(
            AuditLogRepositoryInterface::class,
            EloquentAuditLogRepository::class
        );
    }
}
