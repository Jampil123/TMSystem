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
        Schema::create('system_alerts', function (Blueprint $table) {
            $table->id();
            $table->enum('alert_type', [
                'capacity_warning',
                'capacity_critical',
                'guide_assignment_issue',
                'invalid_qr',
                'security_breach',
                'system_error',
                'maintenance_required',
                'booking_issue',
                'guide_unavailable',
                'duplicate_entry'
            ])->comment('Type of alert triggered');
            $table->string('title')->comment('Alert title/headline');
            $table->text('message')->comment('Detailed alert message');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium')->comment('Alert severity level');
            $table->enum('target_role', ['staff', 'guide', 'operator', 'admin', 'all'])->default('all')->comment('Intended recipients of the alert');
            $table->boolean('is_resolved')->default(false)->comment('Whether alert has been resolved');
            $table->timestamp('resolved_at')->nullable()->comment('When the alert was resolved');
            $table->json('details')->nullable()->comment('Additional JSON data for the alert');
            $table->timestamps();

            // Add indexes for quick querying
            $table->index('alert_type');
            $table->index('severity');
            $table->index('target_role');
            $table->index('is_resolved');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_alerts');
    }
};
