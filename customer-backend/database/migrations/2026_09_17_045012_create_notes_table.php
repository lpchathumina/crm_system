<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('org_users')->nullOnDelete();
            $table->nullableMorphs('notable');
            $table->text('content');
            $table->boolean('is_pinned')->default(false);
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
