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
        Schema::table('guest_list_qr_codes', function (Blueprint $table) {
            $table->unsignedTinyInteger('guest_index')->default(0)->after('guest_list_id')->comment('Index of guest in guest_names array (0 = first guest)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_list_qr_codes', function (Blueprint $table) {
            $table->dropColumn('guest_index');
        });
    }
};
