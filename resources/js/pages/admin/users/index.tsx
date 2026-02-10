import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

const sampleUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
        status: 'Active',
        joinDate: '2025-01-15',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'User',
        status: 'Active',
        joinDate: '2025-02-03',
    },
    {
        id: 3,
        name: 'Robert Johnson',
        email: 'robert.j@example.com',
        role: 'Manager',
        status: 'Active',
        joinDate: '2025-01-20',
    },
    {
        id: 4,
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        role: 'User',
        status: 'Inactive',
        joinDate: '2024-12-10',
    },
    {
        id: 5,
        name: 'Michael Brown',
        email: 'michael.b@example.com',
        role: 'Moderator',
        status: 'Active',
        joinDate: '2025-01-28',
    },
];

export default function UserManagement() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    {/* Total Users Card */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Total Users</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">124</p>
                                <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-2">All registered users</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#375534] to-[#0F2A1D] flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#E3EED4]" />
                            </div>
                        </div>
                    </div>

                    {/* Active Users Card */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Active Users</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">118</p>
                                <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-2">Currently active</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6B8071] to-[#375534] flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Inactive Users Card */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Inactive Users</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">6</p>
                                <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-2">Not active</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#AEC3B0] to-[#6B8071] flex items-center justify-center">
                                <UserX className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">User Directory</h2>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">Manage and view all system users</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Email</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Role</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Join Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sampleUsers.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B8071] to-[#375534] flex items-center justify-center text-white font-semibold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0] text-sm">{user.email}</td>
                                        <td className="py-4 px-6">
                                            <Badge
                                                className={`${
                                                    user.role === 'Admin'
                                                        ? 'bg-[#0F2A1D] text-white dark:bg-[#375534]'
                                                        : user.role === 'Manager'
                                                          ? 'bg-[#375534] text-white dark:bg-[#6B8071]'
                                                          : user.role === 'Moderator'
                                                            ? 'bg-[#6B8071] text-white dark:bg-[#AEC3B0] dark:text-[#0F2A1D]'
                                                            : 'bg-[#AEC3B0] text-[#0F2A1D] dark:bg-[#6B8071] dark:text-white'
                                                }`}
                                            >
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge
                                                className={`${
                                                    user.status === 'Active'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0] text-sm">{user.joinDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
