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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('action')->comment('Action performed (login, create, update, delete, etc.)');
            $table->string('model')->nullable()->comment('Model affected (User, Service, etc.)');
            $table->unsignedBigInteger('model_id')->nullable()->comment('ID of the affected model');
            $table->text('description')->nullable()->comment('Detailed description of the action');
            $table->string('ip_address')->nullable()->comment('IP address of the request');
            $table->string('user_agent')->nullable()->comment('User agent/browser info');
            $table->json('changes')->nullable()->comment('Before and after changes');
            $table->string('status')->default('success')->comment('Status of the action (success, failure)');
            $table->text('response')->nullable()->comment('Response or error message');
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('user_id');
            $table->index('action');
            $table->index('model');
            $table->index('created_at');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
