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
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('contact_number');
            $table->string('email')->unique();
            $table->string('id_type')->nullable(); // e.g., National ID, Driver's License
            $table->string('id_number')->unique();
            $table->string('id_image_path')->nullable();
            
            // Professional Details
            $table->integer('years_of_experience')->default(0);
            $table->json('specialty_areas')->nullable(); // Array of specialties: hiking, cultural, marine, etc.
            
            // Status: Pending, Approved, Rejected
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->text('rejection_reason')->nullable();
            
            // Admin review info
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status']);
            $table->index(['email']);
            $table->index('created_at');
            
            // Foreign key for reviewer (admin)
            $table->foreign('reviewed_by')
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
        Schema::dropIfExists('guides');
    }
};
