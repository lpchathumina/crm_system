<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('org_users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 50)->default('new');
            $table->string('source', 50)->nullable();
            $table->decimal('estimated_value', 15, 2)->nullable();
            $table->unsignedTinyInteger('probability')->nullable();
            $table->date('expected_close_date')->nullable();
            $table->json('tags')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'owner_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
