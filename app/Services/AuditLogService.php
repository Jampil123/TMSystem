<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Log an action
     */
    public static function log(
        string $action,
        ?string $model = null,
        ?int $modelId = null,
        ?string $description = null,
        ?array $changes = null,
        string $status = 'success',
        ?string $response = null
    ): AuditLog {
        $user = Auth::user();

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Guest',
            'user_email' => $user?->email ?? 'N/A',
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'changes' => $changes,
            'status' => $status,
            'response' => $response,
        ]);
    }

    /**
     * Log a login attempt
     */
    public static function logLogin(string $email, string $status = 'success', ?string $reason = null): AuditLog
    {
        $user = null;
        if ($status === 'success') {
            $user = Auth::user();
        }

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Unknown',
            'user_email' => $email,
            'action' => 'login',
            'description' => $status === 'success' ? 'User logged in successfully' : 'Login attempt failed: ' . $reason,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => $status,
            'response' => $reason,
        ]);
    }

    /**
     * Log a logout
     */
    public static function logLogout(): AuditLog
    {
        $user = Auth::user();

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Unknown',
            'user_email' => $user?->email ?? 'N/A',
            'action' => 'logout',
            'description' => 'User logged out',
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => 'success',
        ]);
    }

    /**
     * Log a resource creation
     */
    public static function logCreate(string $model, int $modelId, ?string $description = null): AuditLog
    {
        return self::log('create', $model, $modelId, $description ?? "New $model created");
    }

    /**
     * Log a resource update
     */
    public static function logUpdate(string $model, int $modelId, array $changes, ?string $description = null): AuditLog
    {
        return self::log('update', $model, $modelId, $description ?? "$model updated", $changes);
    }

    /**
     * Log a resource deletion
     */
    public static function logDelete(string $model, int $modelId, ?string $description = null): AuditLog
    {
        return self::log('delete', $model, $modelId, $description ?? "$model deleted");
    }

    /**
     * Log an error
     */
    public static function logError(string $action, string $error, ?string $description = null): AuditLog
    {
        return self::log($action, null, null, $description ?? "Error during $action", null, 'failure', $error);
    }
}
