<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Create a notification for a specific user or all staff
     */
    public static function create(
        string $type,
        string $title,
        string $message,
        string $notificationType = 'info',
        ?int $userId = null,
        ?string $details = null,
        ?string $relatedEntityType = null,
        ?int $relatedEntityId = null
    ): ?Notification {
        try {
            // Use authenticated user if not specified
            if ($userId === null) {
                $userId = Auth::id();
            }

            // If still no user, send to all staff users
            if ($userId === null) {
                return null;
            }

            return Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'notification_type' => $notificationType,
                'title' => $title,
                'message' => $message,
                'details' => $details,
                'related_entity_type' => $relatedEntityType,
                'related_entity_id' => $relatedEntityId,
                'is_read' => false,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating notification: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a notification for all staff users
     */
    public static function createForAllStaff(
        string $type,
        string $title,
        string $message,
        string $notificationType = 'info',
        ?string $details = null,
        ?string $relatedEntityType = null,
        ?int $relatedEntityId = null
    ): void {
        try {
            // Get all staff users (users with staff or admin role)
            $staffUsers = User::whereIn('role', ['staff', 'admin'])
                ->where('active', true)
                ->get();

            foreach ($staffUsers as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => $type,
                    'notification_type' => $notificationType,
                    'title' => $title,
                    'message' => $message,
                    'details' => $details,
                    'related_entity_type' => $relatedEntityType,
                    'related_entity_id' => $relatedEntityId,
                    'is_read' => false,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error creating notifications for all staff: ' . $e->getMessage());
        }
    }

    /**
     * Create QR Verified notification
     */
    public static function qrVerified(string $guestName, string $bookingCode, int $guestCount, ?int $userId = null): void
    {
        self::create(
            type: 'qr_verified',
            title: '✓ QR Code Verified',
            message: "Entry allowed for guest group {$bookingCode} ({$guestCount} guests)",
            notificationType: 'success',
            userId: $userId,
            details: "Guest: {$guestName}",
            relatedEntityType: 'arrival_log',
            relatedEntityId: null
        );
    }

    /**
     * Create Invalid QR Code notification
     */
    public static function invalidQR(string $scannedCode, ?int $userId = null): void
    {
        self::create(
            type: 'invalid_qr',
            title: '✕ Invalid QR Code',
            message: 'Unrecognized booking code scanned',
            notificationType: 'error',
            userId: $userId,
            details: "Scanned code: {$scannedCode}",
            relatedEntityType: null,
            relatedEntityId: null
        );
    }

    /**
     * Create QR Expired notification
     */
    public static function qrExpired(string $bookingCode, ?int $userId = null): void
    {
        self::create(
            type: 'qr_expired',
            title: '⏱ QR Code Expired',
            message: "Booking {$bookingCode} is expired and cannot be used",
            notificationType: 'error',
            userId: $userId,
            details: "The QR code has passed its valid date range.",
            relatedEntityType: null,
            relatedEntityId: null
        );
    }

    /**
     * Create QR Already Used notification
     */
    public static function qrAlreadyUsed(string $bookingCode, ?int $userId = null): void
    {
        self::create(
            type: 'qr_already_used',
            title: '⚠ Duplicate Entry',
            message: "Booking {$bookingCode} has already been logged",
            notificationType: 'warning',
            userId: $userId,
            details: "Cannot log duplicate entry for the same booking code.",
            relatedEntityType: null,
            relatedEntityId: null
        );
    }

    /**
     * Create Guide Verification Failed notification
     */
    public static function guideVerificationFailed(string $bookingCode, string $reason, ?int $userId = null): void
    {
        self::create(
            type: 'guide_verification_failed',
            title: '✕ Guide Verification Failed',
            message: "Guide verification failed for booking {$bookingCode}",
            notificationType: 'error',
            userId: $userId,
            details: "Reason: {$reason}",
            relatedEntityType: null,
            relatedEntityId: null
        );
    }

    /**
     * Create Arrival Logged notification
     */
    public static function arrivalLogged(string $guestName, int $guestCount, string $guide, int $arrivalLogId, ?int $userId = null): void
    {
        self::create(
            type: 'arrival_logged',
            title: '✓ Arrival Logged',
            message: "New guest group arrival: {$guestName} ({$guestCount} guests) with guide {$guide}",
            notificationType: 'success',
            userId: $userId,
            details: "Guests have been logged into the system.",
            relatedEntityType: 'arrival_log',
            relatedEntityId: $arrivalLogId
        );
    }

    /**
     * Create Capacity Warning notification
     */
    public static function capacityWarning(int $currentVisitors, int $maximumCapacity, int $capacityPercentage, ?int $userId = null): void
    {
        self::createForAllStaff(
            type: 'capacity_warning',
            title: '⚠ Capacity Warning',
            message: "Site capacity approaching limit: {$currentVisitors}/{$maximumCapacity} ({$capacityPercentage}%)",
            notificationType: 'warning',
            details: "Approaching maximum visitor capacity. Monitor entry rates.",
            relatedEntityType: 'capacity_status',
            relatedEntityId: null
        );
    }

    /**
     * Create Capacity Critical notification
     */
    public static function capacityCritical(int $currentVisitors, int $maximumCapacity, ?int $userId = null): void
    {
        self::createForAllStaff(
            type: 'capacity_critical',
            title: '🚫 Maximum Capacity Reached',
            message: "Site has reached maximum capacity: {$currentVisitors}/{$maximumCapacity}",
            notificationType: 'error',
            details: "Entry must be temporarily closed to maintain safety compliance.",
            relatedEntityType: 'capacity_status',
            relatedEntityId: null
        );
    }

    /**
     * Create Duplicate Entry Attempt notification
     */
    public static function duplicateEntryAttempt(string $bookingCode, ?int $userId = null): void
    {
        self::create(
            type: 'duplicate_entry',
            title: '⚠ Duplicate Entry Attempted',
            message: "Attempt to re-scan booking {$bookingCode}",
            notificationType: 'warning',
            userId: $userId,
            details: "This booking has already been processed and logged.",
            relatedEntityType: null,
            relatedEntityId: null
        );
    }

    /**
     * Create Scanner Error notification
     */
    public static function scannerError(string $errorMessage, ?int $userId = null): void
    {
        self::create(
            type: 'scanner_error',
            title: '✕ Scanner Error',
            message: 'An error occurred while processing the scan',
            notificationType: 'error',
            userId: $userId,
            details: "Error: {$errorMessage}",
            relatedEntityType: null,
            relatedEntityId: null
        );
    }
}
