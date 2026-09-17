<?php

namespace Tests\Feature\Admin;

use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private AdminUser $superAdmin;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup permissions
        Permission::create(['name' => 'admin.users.view', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'admin.users.create', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'admin.users.update', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'admin.users.delete', 'guard_name' => 'sanctum']);

        $role = Role::create(['name' => 'super-admin', 'guard_name' => 'sanctum']);
        $role->givePermissionTo(Permission::all());

        $this->superAdmin = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'super@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);
        $this->superAdmin->assignRole('super-admin');

        $this->token = $this->superAdmin->createToken('test-token', ['admin'])->plainTextToken;
    }

    public function test_can_list_users(): void
    {
        AdminUser::create([
            'name' => 'Another User',
            'email' => 'another@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)->getJson('/api/v1/admin/users');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['total', 'current_page', 'per_page'],
            ]);
    }

    public function test_can_create_user(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/v1/admin/users', [
            'name' => 'New Admin',
            'email' => 'newadmin@test.com',
            'password' => 'Admin@12345',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.email', 'newadmin@test.com');
    }

    public function test_cannot_create_user_with_duplicate_email(): void
    {
        AdminUser::create([
            'name' => 'Existing',
            'email' => 'existing@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)->postJson('/api/v1/admin/users', [
            'name' => 'Duplicate',
            'email' => 'existing@test.com',
            'password' => 'Admin@12345',
        ]);

        $response->assertStatus(422);
    }

    public function test_can_update_user(): void
    {
        $user = AdminUser::create([
            'name' => 'Original',
            'email' => 'original@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)->putJson("/api/v1/admin/users/{$user->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_can_delete_user(): void
    {
        $user = AdminUser::create([
            'name' => 'To Delete',
            'email' => 'delete@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)->deleteJson("/api/v1/admin/users/{$user->id}");

        $response->assertOk()
            ->assertJson(['success' => true]);
    }

    public function test_unauthenticated_cannot_access_users(): void
    {
        $response = $this->getJson('/api/v1/admin/users');
        $response->assertStatus(401);
    }
}
