import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Plus, Trash2, Edit, X, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    role_id: number;
    status: string;
    account_status_id: number;
    online_status: string;
    online_status_id: number;
    joinDate: string;
}

interface PageProps {
    users: User[];
    stats: {
        total_users: number;
        approved_users: number;
        pending_users: number;
    };
    roles: Record<string, string>;
    statuses: Record<string, string>;
}

export default function UserManagement({ users = [], stats = { total_users: 0, approved_users: 0, pending_users: 0 }, roles = {}, statuses = {} }: PageProps) {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationUser, setDeleteConfirmationUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        role_id: '',
        account_status_id: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            username: user.username,
            role_id: user.role_id.toString(),
            account_status_id: user.account_status_id.toString(),
        });
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsSubmitting(true);
        router.put(`/users/${editingUser.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingUser(null);
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to update user');
            },
        });
    };

    const handleDeleteClick = (user: User) => {
        setDeleteConfirmationUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirmationUser) return;

        setIsDeleting(deleteConfirmationUser.id);
        router.delete(`/users/${deleteConfirmationUser.id}`, {
            onSuccess: () => {
                setIsDeleting(null);
                setIsDeleteModalOpen(false);
                setDeleteConfirmationUser(null);
                router.reload();
            },
            onError: () => {
                setIsDeleting(null);
                alert('Failed to delete user');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Total Users</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.total_users}</p>
                                <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-2">All registered users</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#375534] to-[#0F2A1D] flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#E3EED4]" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Approved Users</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.approved_users}</p>
                                <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-2">Approved accounts</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6B8071] to-[#375534] flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Pending Users</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.pending_users}</p>
                                <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-2">Awaiting approval</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#AEC3B0] to-[#6B8071] flex items-center justify-center">
                                <UserX className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">User Directory</h2>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">Manage and view all system users</p>
                        </div>
                        <button className="flex items-center gap-2 bg-[#375534] hover:bg-[#0F2A1D] text-white px-4 py-2 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            Add User
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Email</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Role</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Account Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Online Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Join Date</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
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
                                                        : user.role === 'Tourism Officer'
                                                          ? 'bg-[#375534] text-white dark:bg-[#6B8071]'
                                                          : user.role === 'LGU Officer'
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
                                                    user.status === 'APPROVED'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : user.status === 'PENDING'
                                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                          : user.status === 'SUSPENDED'
                                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                            : user.status === 'BLOCKED'
                                                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                                }`}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${user.online_status === 'ONLINE' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                                <span className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                    {user.online_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0] text-sm">{user.joinDate}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 text-[#6B8071]" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="p-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#AEC3B0]/40 dark:border-[#375534]/40 overflow-hidden">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 bg-gradient-to-r from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">Edit User</h2>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">Update user information and permissions</p>
                                </div>
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-white/20 dark:hover:bg-[#375534]/30 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-[#0F2A1D] dark:text-[#E3EED4]" />
                                </button>
                            </div>
                        </div>
                        {/* Form Body */}
                        <form onSubmit={handleSaveEdit} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">Full Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-xl bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                {/* Email Field */}
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-xl bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-transparent transition-all"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                {/* Username Field */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">Username</label>
                                    <input 
                                        type="text" 
                                        name="username"
                                        value={formData.username}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-xl bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-transparent transition-all"
                                        placeholder="johndoe"
                                        required
                                    />
                                </div>
                                {/* Role Field */}
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">Role</label>
                                    <div className="relative">
                                        <select 
                                            name="role_id"
                                            value={formData.role_id}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-xl bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-transparent transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Choose a role...</option>
                                            {Object.entries(roles).map(([id, name]) => (
                                                <option key={id} value={id}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-[#6B8071]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {/* Status Field */}
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">Status</label>
                                    <div className="relative">
                                        <select 
                                            name="account_status_id"
                                            value={formData.account_status_id}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-xl bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-transparent transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Choose a status...</option>
                                            {Object.entries(statuses).map(([id, name]) => (
                                                <option key={id} value={id}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-[#6B8071]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="flex gap-3 pt-8 mt-8 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-6 py-3 border-2 border-[#6B8071] text-[#6B8071] dark:text-[#AEC3B0] rounded-xl hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#375534] to-[#0F2A1D] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && deleteConfirmationUser && (
                <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl shadow-lg max-w-md w-full border border-red-200 dark:border-red-900/40">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-center mb-2">Delete User?</h2>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] text-center mb-4">
                                Are you sure you want to delete <strong>{deleteConfirmationUser.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg p-3 mb-6">
                                <p className="text-xs text-red-800 dark:text-red-300">
                                    <strong>Warning:</strong> All associated data will be permanently removed.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-[#6B8071] text-[#6B8071] rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting === deleteConfirmationUser.id}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting === deleteConfirmationUser.id ? 'Deleting...' : 'Delete User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}