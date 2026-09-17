<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use App\Infrastructure\Persistence\Eloquent\Models\SystemSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Users
            'admin.users.view', 'admin.users.create', 'admin.users.update', 'admin.users.delete',
            // Organizations
            'admin.organizations.view', 'admin.organizations.create', 'admin.organizations.update', 'admin.organizations.delete',
            // Roles
            'admin.roles.view', 'admin.roles.create', 'admin.roles.update', 'admin.roles.delete',
            // Settings
            'admin.settings.view', 'admin.settings.update',
            // Audit Logs
            'admin.audit-logs.view',
            // Reports
            'admin.reports.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        // Create Super Admin role
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'sanctum']);
        $superAdminRole->givePermissionTo(Permission::all());

        // Create Admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $adminRole->givePermissionTo(
            Permission::whereNotIn('name', ['admin.roles.delete', 'admin.settings.update'])->get()
        );

        // Create Viewer role
        $viewerRole = Role::firstOrCreate(['name' => 'viewer', 'guard_name' => 'sanctum']);
        $viewerRole->givePermissionTo(
            Permission::where('name', 'like', '%.view')->get()
        );

        // Create Super Admin user
        $superAdmin = AdminUser::firstOrCreate(
            ['email' => 'superadmin@crm.example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@12345'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Create demo admin user
        $admin = AdminUser::firstOrCreate(
            ['email' => 'admin@crm.example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Admin@12345'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Seed system settings
        $settings = [
            ['key' => 'app.name', 'value' => 'Enterprise CRM', 'type' => 'string', 'group' => 'general', 'is_public' => true],
            ['key' => 'app.maintenance_mode', 'value' => '0', 'type' => 'boolean', 'group' => 'general', 'is_public' => false],
            ['key' => 'app.max_orgs_per_plan.free', 'value' => '1', 'type' => 'integer', 'group' => 'plans', 'is_public' => false],
            ['key' => 'app.max_orgs_per_plan.starter', 'value' => '5', 'type' => 'integer', 'group' => 'plans', 'is_public' => false],
            ['key' => 'app.max_orgs_per_plan.professional', 'value' => '20', 'type' => 'integer', 'group' => 'plans', 'is_public' => false],
            ['key' => 'app.max_orgs_per_plan.enterprise', 'value' => '-1', 'type' => 'integer', 'group' => 'plans', 'is_public' => false],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
