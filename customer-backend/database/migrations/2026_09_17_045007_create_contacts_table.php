<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('org_users')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('title', 100)->nullable();
            $table->string('department', 100)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->json('tags')->nullable();
            $table->json('social_links')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'customer_id']);
            $table->index(['organization_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
