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
        Schema::table('attractions', function (Blueprint $table) {
            if (!Schema::hasColumn('attractions', 'best_time_to_visit')) {
                $table->text('best_time_to_visit')->nullable()->after('description');
            }
            if (Schema::hasColumn('attractions', 'price')) {
                $table->renameColumn('price', 'entry_fee');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attractions', function (Blueprint $table) {
            $table->renameColumn('entry_fee', 'price');
            $table->dropColumn('best_time_to_visit');
        });
    }
};
