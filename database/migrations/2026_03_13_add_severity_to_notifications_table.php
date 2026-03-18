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
        Schema::table('notifications', function (Blueprint $table) {
            // Add severity column if it doesn't exist
            if (!Schema::hasColumn('notifications', 'severity')) {
                $table->enum('severity', ['low', 'medium', 'high', 'critical', 'success', 'info', 'warning'])
                    ->default('info')
                    ->after('notification_type');
            }
        });

        // Update type enum to support new notification types
        // Since SQLite doesn't support direct enum modification, we'll do this via raw SQL for MySQL
        if (Schema::connection(DB::getDefaultConnection())->getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM(
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
                'qr_scan_error',
                'entry_blocked',
                'capacity_rule_violation',
                'safety_alert',
                'guide_assignment_conflict',
                'guide_assignment_issue',
                'guest_list_problem',
                'entry_success'
            ) DEFAULT 'arrival_logged'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'severity')) {
                $table->dropColumn('severity');
            }
        });
    }
};
