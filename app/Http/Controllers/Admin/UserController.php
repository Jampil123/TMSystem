<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Userstatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::with('role', 'accountStatus', 'onlineStatus')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role?->name ?? 'N/A',
                    'role_id' => $user->role_id,
                    'status' => $user->accountStatus?->status ?? 'N/A',
                    'account_status_id' => $user->account_status_id,
                    'online_status' => $user->onlineStatus?->status ?? 'OFFLINE',
                    'online_status_id' => $user->online_status_id,
                    'joinDate' => $user->created_at->format('Y-m-d'),
                ];
            });

        $stats = [
            'total_users' => User::count(),
            'approved_users' => User::whereHas('accountStatus', function ($query) {
                $query->where('status', 'APPROVED');
            })->count(),
            'pending_users' => User::whereHas('accountStatus', function ($query) {
                $query->where('status', 'PENDING');
            })->count(),
        ];

        $roles = Role::all()->pluck('name', 'id')->toArray();
        $statuses = Userstatus::where('type', 'ACCOUNT')->pluck('status', 'id')->toArray();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $roles,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'account_status_id' => 'required|exists:user_statuses,id',
        ]);

        $validated['password'] = bcrypt($validated['password']);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'username' => 'required|string|unique:users,username,' . $user->id,
            'role_id' => 'required|exists:roles,id',
            'account_status_id' => 'required|exists:user_statuses,id',
        ]);

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}
