<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Standard Laravel database notifications table (stored separately from the
     * staff-QR custom notifications table to avoid column conflicts).
     */
    public function up(): void
    {
        Schema::dropIfExists('laravel_notifications');

        Schema::create('laravel_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laravel_notifications');
    }
};
