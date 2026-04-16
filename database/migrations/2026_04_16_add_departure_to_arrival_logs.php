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
        Schema::table('arrival_logs', function (Blueprint $table) {
            // Add departure_time column
            $table->time('departure_time')->nullable()->after('arrival_time');
            
            // Change status enum to include 'departed'
            $table->dropColumn('status');
            $table->enum('status', ['arrived', 'departed', 'denied'])->default('arrived')->after('fee_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arrival_logs', function (Blueprint $table) {
            $table->dropColumn('departure_time');
            
            // Revert status enum
            $table->dropColumn('status');
            $table->enum('status', ['arrived', 'denied'])->default('arrived')->after('fee_paid');
        });
    }
};
