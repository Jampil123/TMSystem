<?php

namespace App\Http\Middleware;

use App\Models\Accommodation;
use App\Models\Notification;
use App\Models\Service;
use App\Models\User;
use App\Models\ArrivalLog;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        // Load relationships and check if all documents are approved
        if ($user) {
            $user->loadMissing(['role', 'accountStatus', 'documents']);
        }

        $documentsApproved = $user ? $user->hasAllDocumentsApproved() : false;
        $unreadNotificationCount = $user
            ? Notification::where('user_id', $user->id)->where('is_read', false)->count()
            : 0;
        $operatorCount = $user
            ? User::whereHas('role', fn ($query) => $query->where('name', 'External Operator'))->count()
            : 0;
        $serviceCount = $user ? Service::count() : 0;
        $accommodationCount = $user ? Accommodation::count() : 0;
        $crowdCount = $user
            ? ArrivalLog::whereDate('arrival_date', now()->toDateString())
                ->where(function ($query) {
                    $query->whereNull('status')->orWhere('status', '!=', 'Departed');
                })
                ->count()
            : 0;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'documentsApproved' => $documentsApproved,
            ],
            'portal' => [
                'unreadNotificationCount' => $unreadNotificationCount,
                'navCounts' => [
                    '/badian-portal/operators' => $operatorCount,
                    '/badian-portal/services' => $serviceCount,
                    '/badian-portal/accomodations' => $accommodationCount,
                    '/badian-portal/crowd-identifier' => $crowdCount,
                    '/badian-portal/notifications' => $unreadNotificationCount,
                ],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
