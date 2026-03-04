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
        Schema::create('guide_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_list_id')->constrained('guest_lists')->onDelete('cascade');
            $table->foreignId('guide_id')->constrained('guides')->onDelete('cascade');
            $table->date('assignment_date');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->integer('guest_count');
            $table->enum('assignment_status', ['Pending', 'Confirmed', 'Completed', 'Cancelled'])->default('Pending');
            $table->string('service_type')->nullable(); // e.g., 'Hiking', 'Cultural Tour'
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('assigned_at')->nullable();
            $table->string('compliance_status')->default('Good'); // Good, Warning, Flagged
            $table->text('compliance_notes')->nullable();
            $table->boolean('has_certification_warning')->default(false);
            $table->boolean('has_availability_conflict')->default(false);
            $table->timestamps();

            // Indexes for efficient queries
            $table->index(['guide_id', 'assignment_date']);
            $table->index(['guest_list_id']);
            $table->index(['assignment_status']);
            $table->index(['compliance_status']);
            $table->unique(['guest_list_id']); // One guide per guest list
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_assignments');
    }
};
