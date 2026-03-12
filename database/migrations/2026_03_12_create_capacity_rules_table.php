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
        Schema::create('capacity_rules', function (Blueprint $table) {
            $table->id();
            $table->integer('max_visitors')->default(350)->comment('Maximum visitors allowed at the site');
            $table->integer('warning_threshold_percent')->default(80)->comment('Capacity percentage to trigger warning');
            $table->integer('critical_threshold_percent')->default(100)->comment('Capacity percentage to trigger critical alert');
            $table->integer('max_guests_per_guide')->default(20)->comment('Maximum guests allowed per guide');
            $table->integer('max_daily_visitors')->default(500)->comment('Maximum visitors allowed per day');
            $table->timestamps();

            // Add indexes
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capacity_rules');
    }
};
