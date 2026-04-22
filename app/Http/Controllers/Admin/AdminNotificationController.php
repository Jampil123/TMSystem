<?php

namespace App\Http\Controllers\Admin;

use App\Models\Notification;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdminNotificationController extends Controller
{
    /**
     * Display all system notifications
     */
    public function index(Request $request)
    {
        $query = Notification::query();

        // Filter by status
        if ($request->has('status') && $request->status) {
            if ($request->status === 'unread') {
                $query->where('is_read', false);
            } elseif ($request->status === 'read') {
                $query->where('is_read', true);
            }
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity) {
            $query->where('severity', $request->severity);
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('notification_type', $request->type);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                    ->orWhere('message', 'like', "%$search%");
            });
        }

        // Get statistics
        $totalNotifications = Notification::count();
        $unreadCount = Notification::where('is_read', false)->count();
        $criticalCount = Notification::where('severity', 'critical')->count();

        $severityBreakdown = Notification::selectRaw('severity, count(*) as count')
            ->groupBy('severity')
            ->pluck('count', 'severity');

        $notifications = $query->orderByDesc('created_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/notifications/index', [
            'notifications' => [
                'data' => $notifications->items(),
                'meta' => [
                    'current_page' => $notifications->currentPage(),
                    'from' => ($notifications->currentPage() - 1) * 30 + 1,
                    'to' => min($notifications->currentPage() * 30, $notifications->total()),
                    'total' => $notifications->total(),
                    'per_page' => $notifications->perPage(),
                    'last_page' => $notifications->lastPage(),
                ],
                'links' => [
                    'prev' => $notifications->previousPageUrl(),
                    'next' => $notifications->nextPageUrl(),
                ],
            ],
            'totalNotifications' => $totalNotifications,
            'unreadCount' => $unreadCount,
            'criticalCount' => $criticalCount,
            'severityBreakdown' => $severityBreakdown,
            'filters' => $request->only(['status', 'severity', 'type', 'search']),
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Notification $notification)
    {
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'Notification marked as read');
    }

    /**
     * Mark a notification as unread
     */
    public function markAsUnread(Notification $notification)
    {
        $notification->update([
            'is_read' => false,
            'read_at' => null,
        ]);

        return back()->with('success', 'Notification marked as unread');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Notification::where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'All notifications marked as read');
    }

    /**
     * Delete a notification
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();

        return back()->with('success', 'Notification deleted');
    }

    /**
     * Delete all read notifications
     */
    public function deleteRead()
    {
        $deleted = Notification::where('is_read', true)->delete();

        return back()->with('success', "Deleted $deleted read notifications");
    }

    /**
     * Delete all notifications older than X days
     */
    public function deleteOld(Request $request)
    {
        $days = $request->input('days', 30);
        $cutoffDate = now()->subDays($days);

        $deleted = Notification::where('created_at', '<', $cutoffDate)->delete();

        return back()->with('success', "Deleted $deleted notifications older than $days days");
    }

    /**
     * Get notification statistics
     */
    public function stats()
    {
        return response()->json([
            'total' => Notification::count(),
            'unread' => Notification::where('is_read', false)->count(),
            'critical' => Notification::where('severity', 'critical')->count(),
            'high' => Notification::where('severity', 'high')->count(),
            'medium' => Notification::where('severity', 'medium')->count(),
            'low' => Notification::where('severity', 'low')->count(),
            'by_type' => Notification::selectRaw('notification_type, count(*) as count')
                ->groupBy('notification_type')
                ->pluck('count', 'notification_type'),
        ]);
    }
}
