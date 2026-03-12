<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for logged-in user
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Get notifications for current user, sorted by newest first
            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(100)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'notification_type' => $notification->notification_type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'details' => $notification->details,
                        'is_read' => $notification->is_read,
                        'time_ago' => $notification->getTimeAgoAttribute(),
                        'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                        'read_at' => $notification->read_at?->format('Y-m-d H:i:s'),
                        'related_entity_type' => $notification->related_entity_type,
                        'related_entity_id' => $notification->related_entity_id,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $notifications,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching notifications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching notifications',
                'data' => [],
            ], 200);
        }
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'unread_count' => 0,
                ], 401);
            }

            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching unread count: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching unread count',
                'unread_count' => 0,
            ], 200);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            $notification = Notification::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'data' => [
                    'id' => $notification->id,
                    'is_read' => $notification->is_read,
                    'read_at' => $notification->read_at,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error marking notification as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error marking notification as read',
            ], 200);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error marking all notifications as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error marking all notifications as read',
            ], 200);
        }
    }

    /**
     * Delete a notification
     */
    public function delete($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            Notification::where('id', $id)
                ->where('user_id', $user->id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting notification',
            ], 200);
        }
    }

    /**
     * Get recent notifications (for navbar dropdown)
     */
    public function recent($limit = 5)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'notification_type' => $notification->notification_type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'is_read' => $notification->is_read,
                        'time_ago' => $notification->getTimeAgoAttribute(),
                        'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching recent notifications: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [],
                'unread_count' => 0,
            ], 200);
        }
    }

    /**
     * Create a notification (for system events like capacity alerts)
     */
    public function createNotification(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|string',
                'current_visitors' => 'sometimes|integer',
                'maximum_capacity' => 'sometimes|integer',
                'capacity_percentage' => 'sometimes|numeric',
            ]);

            $type = $validated['type'];
            
            // Create notification based on type
            if ($type === 'capacity_warning') {
                $currentVisitors = $validated['current_visitors'] ?? 0;
                $maxCapacity = $validated['maximum_capacity'] ?? 0;
                $percentage = $validated['capacity_percentage'] ?? 0;
                
                \App\Services\NotificationService::capacityWarning(
                    $currentVisitors,
                    $maxCapacity,
                    $percentage
                );
                
                return response()->json([
                    'success' => true,
                    'message' => 'Capacity warning notification created',
                ]);
            } elseif ($type === 'capacity_critical') {
                $currentVisitors = $validated['current_visitors'] ?? 0;
                $maxCapacity = $validated['maximum_capacity'] ?? 0;
                
                \App\Services\NotificationService::capacityCritical(
                    $currentVisitors,
                    $maxCapacity
                );
                
                return response()->json([
                    'success' => true,
                    'message' => 'Capacity critical notification created',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid notification type',
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Error creating notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating notification',
            ], 500);
        }
    }
}
