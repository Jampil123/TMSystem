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
        Schema::create('guide_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('guides')->onDelete('cascade');
            $table->string('certification_name'); // e.g., "First Aid", "Wilderness Rescue"
            $table->string('issued_by'); // Organization or institution
            $table->date('issued_date');
            $table->date('expiry_date')->nullable();
            $table->string('certificate_file_path');
            $table->enum('status', ['Valid', 'Expiring Soon', 'Expired'])->default('Valid');
            $table->timestamps();
            
            // Indexes
            $table->index(['guide_id']);
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_certifications');
    }
};
