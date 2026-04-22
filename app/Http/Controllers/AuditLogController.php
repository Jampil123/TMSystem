<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs
     */
    public function index(Request $request)
    {
        $query = AuditLog::query();

        // Filter by search term
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%$search%")
                    ->orWhere('user_email', 'like', "%$search%")
                    ->orWhere('action', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%")
                    ->orWhere('ip_address', 'like', "%$search%");
            });
        }

        // Filter by action
        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->where('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->where('created_at', '<=', $request->end_date . ' 23:59:59');
        }

        // Get statistics
        $totalLogs = AuditLog::count();
        $totalLogins = AuditLog::where('action', 'login')->count();
        $totalFailures = AuditLog::where('status', 'failure')->count();
        $today = AuditLog::whereDate('created_at', now()->today())->count();

        $logs = $query->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/audit-logs/index', [
            'logs' => [
                'data' => $logs->items(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'from' => ($logs->currentPage() - 1) * 50 + 1,
                    'to' => min($logs->currentPage() * 50, $logs->total()),
                    'total' => $logs->total(),
                    'per_page' => $logs->perPage(),
                    'last_page' => $logs->lastPage(),
                ],
                'links' => [
                    'prev' => $logs->previousPageUrl(),
                    'next' => $logs->nextPageUrl(),
                ],
            ],
            'totalLogs' => $totalLogs,
            'totalLogins' => $totalLogins,
            'totalFailures' => $totalFailures,
            'todayLogs' => $today,
            'filters' => $request->only(['search', 'action', 'status', 'user_id', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Display a specific audit log
     */
    public function show(AuditLog $auditLog)
    {
        return Inertia::render('admin/audit-logs/show', [
            'log' => $auditLog,
        ]);
    }

    /**
     * Delete all logs (admin only)
     */
    public function deleteAll(Request $request)
    {
        $this->authorize('admin');

        $days = $request->input('days', 90);
        $cutoffDate = now()->subDays($days);

        AuditLog::where('created_at', '<', $cutoffDate)->delete();

        return back()->with('success', "Audit logs older than $days days have been deleted.");
    }

    /**
     * Export logs to CSV
     */
    public function export(Request $request)
    {
        $this->authorize('admin');

        $query = AuditLog::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%$search%")
                    ->orWhere('action', 'like', "%$search%");
            });
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        $logs = $query->orderByDesc('created_at')->get();

        $csv = "Timestamp,User,Email,Action,Model,Description,IP Address,Status\n";

        foreach ($logs as $log) {
            $csv .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                $log->created_at->format('Y-m-d H:i:s'),
                $log->user_name,
                $log->user_email,
                $log->action,
                $log->model ?? 'N/A',
                str_replace('"', '""', $log->description ?? ''),
                $log->ip_address ?? 'N/A',
                $log->status
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="audit-logs-' . now()->format('Y-m-d-His') . '.csv"',
        ]);
    }
}
