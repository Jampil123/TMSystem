<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OperatorAlert;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class OperatorAlertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find an external operator user
        $operator = User::where('role_id', 3)->first(); // Assuming role_id 3 is External Operator
        
        if (!$operator) {
            // Create a test operator if none exists
            $operator = User::factory()->create([
                'role_id' => 3,
            ]);
        }

        // Create sample alerts
        $alerts = [
            [
                'alert_type' => 'Safety Issue',
                'priority_level' => 'High',
                'tourist_group_name' => 'Adventure Seekers Group',
                'number_of_tourists' => 5,
                'assigned_guide_name' => 'Juan Dela Cruz',
                'activity_service_name' => 'Canyoneering Badian',
                'activity_date_time' => Carbon::tomorrow()->setHour(9)->setMinute(0),
                'description' => 'Insufficient guides assigned for the group size. Safety policy requires 1 guide per 1 tourist.',
                'suggested_action' => 'Resolve',
                'status' => 'Active',
            ],
            [
                'alert_type' => 'Guide Assignment',
                'priority_level' => 'High',
                'tourist_group_name' => 'Eco-Tourism Club',
                'number_of_tourists' => 8,
                'assigned_guide_name' => null,
                'activity_service_name' => 'Island Hopping Tour',
                'activity_date_time' => Carbon::tomorrow()->setHour(10)->setMinute(0),
                'description' => 'No guides assigned to this tourist group. Please assign guides before the activity',
                'suggested_action' => 'View',
                'status' => 'Active',
            ],
            [
                'alert_type' => 'Schedule Conflict',
                'priority_level' => 'Medium',
                'tourist_group_name' => 'Heritage Walkers',
                'number_of_tourists' => 12,
                'assigned_guide_name' => 'Maria Santos',
                'activity_service_name' => 'Historical Tour',
                'activity_date_time' => Carbon::now()->addDays(3)->setHour(14)->setMinute(0),
                'description' => 'Assigned guide has conflicting schedule. Consider reassigning to another available guide.',
                'suggested_action' => 'Acknowledge',
                'status' => 'Active',
            ],
            [
                'alert_type' => 'Service Update',
                'priority_level' => 'Low',
                'tourist_group_name' => 'Sunset Watchers',
                'number_of_tourists' => 6,
                'assigned_guide_name' => 'Carlos Reyes',
                'activity_service_name' => 'Sunset Beach Experience',
                'activity_date_time' => Carbon::now()->addDays(2)->setHour(17)->setMinute(0),
                'description' => 'Service details have been updated. Please review before confirming with tourists.',
                'suggested_action' => 'View',
                'status' => 'Active',
            ],
            [
                'alert_type' => 'Safety Issue',
                'priority_level' => 'Medium',
                'tourist_group_name' => 'Mountain Climbers',
                'number_of_tourists' => 4,
                'assigned_guide_name' => 'Jose Torres',
                'activity_service_name' => 'Mountain Trek',
                'activity_date_time' => Carbon::now()->addDays(5)->setHour(8)->setMinute(0),
                'description' => 'Weather forecast shows heavy rain during scheduled activity. Consider rescheduling.',
                'suggested_action' => 'Resolve',
                'status' => 'Active',
            ],
        ];

        foreach ($alerts as $alertData) {
            OperatorAlert::create([
                'operator_id' => $operator->id,
                ...$alertData,
            ]);
        }
    }
}
