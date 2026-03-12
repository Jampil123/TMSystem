<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Collection;

class NotificationRouter
{
    /**
     * Route notifications to appropriate user roles based on event type
     */
    public static function broadcastToRoles(
        string $type,
        string $title,
        string $message,
        array $targetRoles,
        string $severity = 'info',
        ?array $details = null,
        ?string $relatedEntityType = null,
        ?int $relatedEntityId = null
    ): Collection {
        $createdNotifications = collect();

        try {
            // Get all users with target roles
            $users = User::whereIn('role_id', function ($query) use ($targetRoles) {
                $query->select('id')
                    ->from('roles')
                    ->whereIn('name', $targetRoles)
                    ->where('active', true);
            })
            ->where('active', true)
            ->get();

            foreach ($users as $user) {
                $notification = Notification::create([
                    'user_id' => $user->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message,
                    'severity' => $severity,
                    'details' => $details ? json_encode($details) : null,
                    'related_entity_type' => $relatedEntityType,
                    'related_entity_id' => $relatedEntityId,
                    'is_read' => false,
                ]);

                $createdNotifications->push($notification);
            }
        } catch (\Exception $e) {
            \Log::error('Error broadcasting notifications: ' . $e->getMessage());
        }

        return $createdNotifications;
    }

    /**
     * Route QR scan errors to Entrance Staff
     */
    public static function qrScanError(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'qr_scan_error',
            title: $title,
            message: $message,
            targetRoles: ['Tourism Staff'],
            severity: 'warning',
            details: $details,
            relatedEntityType: 'qr_scan',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route capacity warnings to Entrance Staff and Admin
     */
    public static function capacityWarning(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'capacity_warning',
            title: $title,
            message: $message,
            targetRoles: ['Tourism Staff', 'Admin'],
            severity: 'warning',
            details: $details,
            relatedEntityType: 'capacity_rule',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route capacity critical alerts to Admin
     */
    public static function capacityCritical(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'capacity_critical',
            title: $title,
            message: $message,
            targetRoles: ['Admin'],
            severity: 'critical',
            details: $details,
            relatedEntityType: 'capacity_rule',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route entry blocked notifications to Entrance Staff
     */
    public static function entryBlocked(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'entry_blocked',
            title: $title,
            message: $message,
            targetRoles: ['Tourism Staff'],
            severity: 'warning',
            details: $details,
            relatedEntityType: 'guest_list',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route capacity rule violations to Admin
     */
    public static function capacityRuleViolation(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'capacity_rule_violation',
            title: $title,
            message: $message,
            targetRoles: ['Admin'],
            severity: 'critical',
            details: $details,
            relatedEntityType: 'capacity_rule',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route safety alerts to Admin
     */
    public static function safetyAlert(
        string $title,
        string $message,
        string $severity = 'high',
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'safety_alert',
            title: $title,
            message: $message,
            targetRoles: ['Admin'],
            severity: $severity,
            details: $details,
            relatedEntityType: 'system_alert',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route guide assignment conflicts to Admin and Operators
     */
    public static function guideAssignmentConflict(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'guide_assignment_conflict',
            title: $title,
            message: $message,
            targetRoles: ['Admin', 'External Operator'],
            severity: 'high',
            details: $details,
            relatedEntityType: 'guide_assignment',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route guide assignment issues to Operators
     */
    public static function guideAssignmentIssue(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'guide_assignment_issue',
            title: $title,
            message: $message,
            targetRoles: ['External Operator'],
            severity: 'warning',
            details: $details,
            relatedEntityType: 'guide_assignment',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route guest list problems to Operators
     */
    public static function guestListProblem(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'guest_list_problem',
            title: $title,
            message: $message,
            targetRoles: ['External Operator'],
            severity: 'warning',
            details: $details,
            relatedEntityType: 'guest_list',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Route entry success notifications to Entrance Staff
     */
    public static function entrySuccess(
        string $title,
        string $message,
        ?array $details = null,
        ?int $relatedId = null
    ): Collection {
        return self::broadcastToRoles(
            type: 'entry_success',
            title: $title,
            message: $message,
            targetRoles: ['Tourism Staff'],
            severity: 'success',
            details: $details,
            relatedEntityType: 'arrival_log',
            relatedEntityId: $relatedId
        );
    }

    /**
     * Get notifications for current user by severity
     */
    public static function getForUserBySeverity(int $userId, string $severity, int $limit = 10): Collection
    {
        return Notification::where('user_id', $userId)
            ->where('severity', $severity)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get critical notifications for current user
     */
    public static function getCriticalForUser(int $userId, int $limit = 5): Collection
    {
        return self::getForUserBySeverity($userId, 'critical', $limit);
    }

    /**
     * Count unread notifications by severity for user
     */
    public static function countUnreadBySeverity(int $userId): array
    {
        $severities = ['critical', 'high', 'warning', 'info', 'success'];
        $counts = [];

        foreach ($severities as $severity) {
            $counts[$severity] = Notification::where('user_id', $userId)
                ->where('severity', $severity)
                ->where('is_read', false)
                ->count();
        }

        return $counts;
    }

    /**
     * Has user any critical unread notifications
     */
    public static function hasCriticalForUser(int $userId): bool
    {
        return Notification::where('user_id', $userId)
            ->where('severity', 'critical')
            ->where('is_read', false)
            ->exists();
    }
}
