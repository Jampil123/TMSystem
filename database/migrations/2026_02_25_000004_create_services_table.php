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
        Schema::create('services', function (Blueprint $table) {
            $table->id('service_id');
            $table->foreignId('operator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tourist_spot_id')->constrained('attractions')->onDelete('cascade');
            $table->enum('service_type', ['Activity', 'Accommodation']);
            $table->string('service_name');
            $table->text('description')->nullable();
            $table->string('facebook_url')->nullable();
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Revision Required', 'Inactive'])->default('Pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
