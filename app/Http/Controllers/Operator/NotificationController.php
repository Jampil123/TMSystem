<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display the operator notifications page.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $notifications = $user->notifications
            ->map(fn($n) => $this->formatNotification($n));

        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('operator/notifications', [
            'notifications' => $notifications,
            'unreadCount'   => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, string $id)
    {
        $notification = auth()->user()->notifications()->find($id);

        if ($notification && !$notification->read_at) {
            $notification->markAsRead();
        }

        return back();
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllRead(Request $request)
    {
        auth()->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Delete a single notification.
     */
    public function destroy(string $id)
    {
        auth()->user()->notifications()->find($id)?->delete();

        return back();
    }

    /**
     * Get unread count as JSON (for nav badge polling).
     */
    public function unreadCount()
    {
        return response()->json([
            'count' => auth()->user()->unreadNotifications()->count(),
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private function formatNotification($n): array
    {
        $data = $n->data;

        // Determine display type and icon category from the notification class name
        $class = class_basename($n->type);
        $category = match (true) {
            str_contains($class, 'ServiceApproved')          => 'service_approved',
            str_contains($class, 'ServiceRejected')          => 'service_rejected',
            str_contains($class, 'ServiceRevision')          => 'service_revision',
            str_contains($class, 'AccountApproved')          => 'account_approved',
            str_contains($class, 'DocumentApproved')         => 'document_approved',
            str_contains($class, 'DocumentRejected')         => 'document_rejected',
            str_contains($class, 'GuestListApproved')        => 'guest_list_approved',
            str_contains($class, 'GuestListRejected')        => 'guest_list_rejected',
            str_contains($class, 'GuideAssigned')            => 'guide_assigned',
            default                                          => 'info',
        };

        $badgeType = match ($category) {
            'service_approved', 'account_approved', 'document_approved', 'guest_list_approved' => 'success',
            'service_rejected', 'document_rejected', 'guest_list_rejected'                     => 'error',
            'service_revision'                                                                  => 'warning',
            default                                                                             => 'info',
        };

        return [
            'id'         => $n->id,
            'type'       => $n->type,
            'category'   => $category,
            'badgeType'  => $badgeType,
            'message'    => $data['message'] ?? 'You have a new notification.',
            'title'      => $this->titleFromCategory($category, $data),
            'remarks'    => $data['remarks'] ?? null,
            'url'        => $data['url'] ?? null,
            'service_id' => $data['service_id'] ?? null,
            'service_name' => $data['service_name'] ?? null,
            'is_read'    => !is_null($n->read_at),
            'read_at'    => $n->read_at?->toIso8601String(),
            'time_ago'   => $n->created_at->diffForHumans(),
            'created_at' => $n->created_at->format('M d, Y H:i'),
        ];
    }

    private function titleFromCategory(string $category, array $data): string
    {
        return match ($category) {
            'service_approved'    => 'Service Approved',
            'service_rejected'    => 'Service Rejected',
            'service_revision'    => 'Revision Requested',
            'account_approved'    => 'Account Approved',
            'document_approved'   => 'Document Approved',
            'document_rejected'   => 'Document Rejected',
            'guest_list_approved' => 'Guest List Approved',
            'guest_list_rejected' => 'Guest List Rejected',
            'guide_assigned'      => 'Guide Assigned',
            default               => 'Notification',
        };
    }
}
