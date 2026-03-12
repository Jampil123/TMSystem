<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('emergency_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('emergency_type', [
                'capacity_exceeded',
                'no_guide_assignment',
                'unsafe_density',
                'manual_trigger',
                'system_error',
            ]);
            $table->enum('severity', ['warning', 'critical'])->default('critical');
            $table->string('title');
            $table->text('description');
            $table->json('details')->nullable(); // Store context like visitor count, capacity, etc
            $table->unsignedBigInteger('triggered_by_user_id')->nullable(); // For manual triggers
            $table->boolean('is_active')->default(true);
            $table->timestamp('resolved_at')->nullable();
            $table->unsignedBigInteger('resolved_by_user_id')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('emergency_type');
            $table->index('severity');
            $table->index('is_active');
            $table->index('created_at');

            // Foreign keys
            $table->foreign('triggered_by_user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
            $table->foreign('resolved_by_user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_logs');
    }
};
