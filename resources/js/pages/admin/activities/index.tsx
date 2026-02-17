import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Trash2, Edit, X, AlertTriangle, Star, Clock, Users, TrendingUp } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Management',
        href: '/activities',
    },
];

interface Activity {
    id: number;
    name: string;
    description: string;
    duration: string;
    difficulty_level: string;
    max_participants: number | null;
    price: number | null;
    image_url: string | null;
    rating: number | null;
    package_information?: {
        whats_included?: string;
        what_to_bring?: string;
        what_to_expect?: string;
        cost_details?: string;
    } | null;
    faqs?: Array<{
        id?: number;
        question: string;
        answer: string;
    }>;
    status: string;
}

interface PageProps {
    activities: Activity[];
    stats: {
        total_activities: number;
        active_activities: number;
        inactive_activities: number;
    };
}

export default function ActivityManagement({ activities = [], stats = { total_activities: 0, active_activities: 0, inactive_activities: 0 } }: PageProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationActivity, setDeleteConfirmationActivity] = useState<Activity | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
        difficulty_level: '',
        max_participants: '',
        price: '',
        image_url: '',
        rating: '',
        package_information: {
            whats_included: '',
            what_to_bring: '',
            what_to_expect: '',
            cost_details: '',
        },
        faqs: [] as Array<{ question: string; answer: string }>,
        status: 'active',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddClick = () => {
        setFormData({
            name: '',
            description: '',
            duration: '',
            difficulty_level: '',
            max_participants: '',
            price: '',
            image_url: '',
            rating: '',
            package_information: {
                whats_included: '',
                what_to_bring: '',
                what_to_expect: '',
                cost_details: '',
            },
            faqs: [],
            status: 'active',
        });
        setEditingActivity(null);
        setIsAdding(true);
    };

    const handleEditClick = (activity: Activity) => {
        setEditingActivity(activity);
        setFormData({
            name: activity.name,
            description: activity.description,
            duration: activity.duration,
            difficulty_level: activity.difficulty_level,
            max_participants: activity.max_participants?.toString() || '',
            price: activity.price?.toString() || '',
            image_url: activity.image_url || '',
            rating: activity.rating?.toString() || '',
            package_information: {
                whats_included: activity.package_information?.whats_included || '',
                what_to_bring: activity.package_information?.what_to_bring || '',
                what_to_expect: activity.package_information?.what_to_expect || '',
                cost_details: activity.package_information?.cost_details || '',
            },
            faqs: activity.faqs || [],
            status: activity.status,
        });
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('package_information.')) {
            const field = name.replace('package_information.', '');
            setFormData(prev => ({
                ...prev,
                package_information: {
                    ...(prev.package_information || {}),
                    [field]: value,
                },
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddFaq = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...(prev.faqs || []), { question: '', answer: '' }],
        }));
    };

    const handleRemoveFaq = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faqs: (prev.faqs || []).filter((_, i) => i !== index),
        }));
    };

    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        setFormData(prev => ({
            ...prev,
            faqs: (prev.faqs || []).map((faq, i) =>
                i === index ? { ...faq, [field]: value } : faq
            ),
        }));
    };

    const handleSaveNew = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/activities', formData, {
            onSuccess: () => {
                setIsAdding(false);
                setFormData({
                    name: '',
                    description: '',
                    duration: '',
                    difficulty_level: '',
                    max_participants: '',
                    price: '',
                    image_url: '',
                    rating: '',
                    package_information: {
                        whats_included: '',
                        what_to_bring: '',
                        what_to_expect: '',
                        cost_details: '',
                    },
                    faqs: [],
                    status: 'active',
                });
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to create activity');
            },
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingActivity) return;

        setIsSubmitting(true);
        router.put(`/activities/${editingActivity.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingActivity(null);
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to update activity');
            },
        });
    };

    const handleDeleteClick = (activity: Activity) => {
        setDeleteConfirmationActivity(activity);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirmationActivity) return;

        router.delete(`/activities/${deleteConfirmationActivity.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmationActivity(null);
                router.reload();
            },
            onError: () => {
                alert('Failed to delete activity');
            },
        });
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <Badge className={status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
            {status === 'active' ? '✓ Active' : '✗ Inactive'}
        </Badge>
    );

    const DifficultyBadge = ({ level }: { level: string }) => {
        const colorMap: Record<string, string> = {
            'easy': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'hard': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return <Badge className={colorMap[level.toLowerCase()] || colorMap['medium']}>{level}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Management" />

            <div className="space-y-6 px-6 py-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-bold text-[#0F2A1D] dark:text-white flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#375534] to-[#0F2A1D] rounded-lg">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            Activity Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all tourist activities and experiences in Badian</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="px-8 py-3 bg-gradient-to-r from-[#375534] to-[#0F2A1D] hover:shadow-lg text-white font-semibold rounded-xl flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Activity
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Activities</div>
                                <div className="text-4xl font-bold text-[#375534] dark:text-[#AEC3B0] mt-2">{stats.total_activities}</div>
                            </div>
                            <div className="p-3 bg-[#375534]/10 dark:bg-[#375534]/20 rounded-lg">
                                <Zap className="w-8 h-8 text-[#375534] dark:text-[#AEC3B0]" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active</div>
                                <div className="text-4xl font-bold text-green-600 mt-2">{stats.active_activities}</div>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Inactive</div>
                                <div className="text-4xl font-bold text-red-600 mt-2">{stats.inactive_activities}</div>
                            </div>
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activities Table */}
                <div className="bg-white dark:bg-[#1F3A2F] rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#0F2A1D] dark:to-[#1F3A2F] border-b-2 border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Duration</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Difficulty</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Capacity</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Rating</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {activities.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No activities found</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">Create one to get started!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    activities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-[#375534]/30 dark:hover:to-transparent transition duration-200 border-l-4 border-transparent hover:border-[#375534]">
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{activity.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                        {activity.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                {activity.duration}
                                            </td>
                                            <td className="px-6 py-5">
                                                <DifficultyBadge level={activity.difficulty_level} />
                                            </td>
                                            <td className="px-6 py-5 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                {activity.max_participants || '—'}
                                            </td>
                                            <td className="px-6 py-5 text-gray-700 dark:text-gray-300 text-sm font-medium">
                                                {activity.price ? `₱${parseFloat(activity.price.toString()).toFixed(2)}` : '—'}
                                            </td>
                                            <td className="px-6 py-5">
                                                {activity.rating ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < Math.floor(activity.rating!)
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{activity.rating}/5</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={activity.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(activity)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition duration-200 hover:scale-110"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(activity)}
                                                        className="p-2.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition duration-200 hover:scale-110"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {(isAdding || isEditModalOpen) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#1F3A2F] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-[#0F2A1D] dark:to-[#1F3A2F]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#375534]/10 dark:bg-[#375534]/20 rounded-lg">
                                        <Zap className="w-6 h-6 text-[#375534] dark:text-[#AEC3B0]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-white">
                                        {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setIsEditModalOpen(false);
                                        setEditingActivity(null);
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={editingActivity ? handleSaveEdit : handleSaveNew} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Activity Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Canyoneering Tour"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Duration *
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleFormChange}
                                            placeholder="e.g., 3-4 hours"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        placeholder="Describe the activity in detail..."
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Difficulty Level *
                                        </label>
                                        <select
                                            name="difficulty_level"
                                            value={formData.difficulty_level}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        >
                                            <option value="">Select difficulty</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Max Participants
                                        </label>
                                        <input
                                            type="number"
                                            name="max_participants"
                                            value={formData.max_participants}
                                            onChange={handleFormChange}
                                            placeholder="e.g., 10"
                                            min="1"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Price (₱)
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleFormChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Rating (0-5)
                                        </label>
                                        <input
                                            type="number"
                                            name="rating"
                                            value={formData.rating}
                                            onChange={handleFormChange}
                                            placeholder="0.0"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-[#375534]" />
                                        Package Information
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            What's Included
                                        </label>
                                        <textarea
                                            name="package_information.whats_included"
                                            value={formData.package_information?.whats_included || ''}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Canyoneering Gear, Professional Guide, Travel Insurance, Safety Briefing"
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                    <div className="mt-5">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            What to Bring
                                        </label>
                                        <textarea
                                            name="package_information.what_to_bring"
                                            value={formData.package_information?.what_to_bring || ''}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Swimwear, Water Shoes, Sunscreen, Towel, Waterproof Bag"
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                    <div className="mt-5">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            What to Expect
                                        </label>
                                        <textarea
                                            name="package_information.what_to_expect"
                                            value={formData.package_information?.what_to_expect || ''}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Exhilarating water jumps, Beautiful natural pools, Scenic canyon views, Physical activity level: High"
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                    <div className="mt-5">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Cost Details
                                        </label>
                                        <textarea
                                            name="package_information.cost_details"
                                            value={formData.package_information?.cost_details || ''}
                                            onChange={handleFormChange}
                                            placeholder="e.g., ₱2,500 per person, Includes equipment rental and guide fee, Discounts available for groups of 5+"
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Image URL
                                        </label>
                                        <input
                                            type="text"
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleFormChange}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-6 mt-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-[#375534]" />
                                            Frequently Asked Questions
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleAddFaq}
                                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#375534] text-white hover:bg-[#0F2A1D] transition font-semibold text-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add FAQ
                                        </button>
                                    </div>

                                    {(formData.faqs || []).map((faq, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl mb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                    Question {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFaq(index)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Question *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={faq.question}
                                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                    placeholder="e.g., How do we get to Osmena Peak?"
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Answer *
                                                </label>
                                                <textarea
                                                    value={faq.answer}
                                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                    placeholder="e.g., We depart early from the city and take a scenic route through the mountains, arriving at the peak by mid-afternoon."
                                                    rows={3}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setIsEditModalOpen(false);
                                            setEditingActivity(null);
                                        }}
                                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-gradient-to-r from-[#375534] to-[#0F2A1D] hover:shadow-lg text-white rounded-lg transition disabled:opacity-50 font-semibold flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            editingActivity ? 'Update Activity' : 'Create Activity'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && deleteConfirmationActivity && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#1F3A2F] rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-[#0F2A1D] dark:text-white mb-2">Delete Activity</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Are you sure you want to delete <span className="font-semibold">"{deleteConfirmationActivity.name}"</span>? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F2A1D]">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteConfirmationActivity(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition font-semibold"
                                >
                                    Keep It
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg text-white rounded-lg transition font-semibold flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
