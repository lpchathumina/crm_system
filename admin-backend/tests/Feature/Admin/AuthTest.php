<?php

namespace Tests\Feature\Admin;

use App\Infrastructure\Persistence\Eloquent\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_with_valid_credentials(): void
    {
        AdminUser::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'Admin@12345',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['token', 'token_type', 'user'],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_admin_cannot_login_with_wrong_password(): void
    {
        AdminUser::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_inactive_admin_cannot_login(): void
    {
        AdminUser::create([
            'name' => 'Inactive Admin',
            'email' => 'inactive@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'inactive@test.com',
            'password' => 'Admin@12345',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_logout(): void
    {
        $admin = AdminUser::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('Admin@12345'),
            'is_active' => true,
        ]);

        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/v1/admin/auth/logout');

        $response->assertOk()
            ->assertJson(['success' => true]);
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/admin/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }
}
