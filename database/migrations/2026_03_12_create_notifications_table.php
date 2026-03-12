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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('type', [
                'qr_verified',
                'invalid_qr',
                'qr_expired',
                'qr_already_used',
                'guide_verification_failed',
                'arrival_logged',
                'capacity_warning',
                'capacity_critical',
                'duplicate_entry',
                'scanner_error',
            ])->default('arrival_logged');
            $table->enum('notification_type', ['success', 'warning', 'error', 'info'])->default('info');
            $table->string('title');
            $table->string('message');
            $table->text('details')->nullable();
            $table->string('related_entity_type')->nullable(); // e.g., 'arrival_log', 'guest_list'
            $table->unsignedBigInteger('related_entity_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('type');
            $table->index('is_read');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
