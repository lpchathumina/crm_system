<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('org_users')->nullOnDelete();
            $table->nullableMorphs('actable');
            $table->string('type', 50);
            $table->string('subject');
            $table->text('description')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'type']);
            $table->index(['organization_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
