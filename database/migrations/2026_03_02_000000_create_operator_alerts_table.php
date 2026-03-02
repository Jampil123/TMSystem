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
        Schema::create('operator_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operator_id')->constrained('users')->onDelete('cascade');
            $table->enum('alert_type', ['Safety Issue', 'Guide Assignment', 'Schedule Conflict', 'Service Update']);
            $table->enum('priority_level', ['High', 'Medium', 'Low']);
            $table->string('tourist_group_name');
            $table->integer('number_of_tourists');
            $table->string('assigned_guide_name')->nullable();
            $table->string('activity_service_name');
            $table->dateTime('activity_date_time');
            $table->text('description');
            $table->enum('suggested_action', ['View', 'Resolve', 'Acknowledge']);
            $table->enum('status', ['Active', 'Acknowledged', 'Resolved'])->default('Active');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            // Indexes for querying
            $table->index(['operator_id', 'status']);
            $table->index(['priority_level']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operator_alerts');
    }
};
