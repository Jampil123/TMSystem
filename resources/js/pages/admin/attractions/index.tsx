import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Compass, Plus, Trash2, Edit, X, AlertTriangle, Star, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attraction Management',
        href: '/attractions',
    },
];

interface Attraction {
    id: number;
    name: string;
    description: string;
    location: string;
    category: string;
    entry_fee: number | null;
    image_url: string | null;
    rating: number | null;
    status: string;
    best_time_to_visit?: string | null;
}

interface PageProps {
    attractions: Attraction[];
    stats: {
        total_attractions: number;
        active_attractions: number;
        inactive_attractions: number;
    };
}

export default function AttractionManagement({ attractions = [], stats = { total_attractions: 0, active_attractions: 0, inactive_attractions: 0 } }: PageProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationAttraction, setDeleteConfirmationAttraction] = useState<Attraction | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        best_time_to_visit: '',
        location: '',
        category: '',
        entry_fee: '',
        image_url: '',
        rating: '',
        status: 'active',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddClick = () => {
        setFormData({
            name: '',
            description: '',
            best_time_to_visit: '',
            location: '',
            category: '',
            entry_fee: '',
            image_url: '',
            rating: '',
            status: 'active',
        });
        setEditingAttraction(null);
        setIsAdding(true);
    };

    const handleEditClick = (attraction: Attraction) => {
        setEditingAttraction(attraction);
        setFormData({
            name: attraction.name,
            description: attraction.description,
            best_time_to_visit: attraction.best_time_to_visit || '',
            location: attraction.location,
            category: attraction.category,
            entry_fee: attraction.entry_fee?.toString() || '',
            image_url: attraction.image_url || '',
            rating: attraction.rating?.toString() || '',
            status: attraction.status,
        });
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNew = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/attractions', formData, {
            onSuccess: () => {
                setIsAdding(false);
                setFormData({
                    name: '',
                    description: '',
                    best_time_to_visit: '',
                    location: '',
                    category: '',
                    entry_fee: '',
                    image_url: '',
                    rating: '',
                    status: 'active',
                });
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to create attraction');
            },
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAttraction) return;

        setIsSubmitting(true);
        router.put(`/attractions/${editingAttraction.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingAttraction(null);
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to update attraction');
            },
        });
    };

    const handleDeleteClick = (attraction: Attraction) => {
        setDeleteConfirmationAttraction(attraction);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirmationAttraction) return;

        router.delete(`/attractions/${deleteConfirmationAttraction.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmationAttraction(null);
                router.reload();
            },
            onError: () => {
                alert('Failed to delete attraction');
            },
        });
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <Badge className={status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
            {status === 'active' ? '✓ Active' : '✗ Inactive'}
        </Badge>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attraction Management" />

            <div className="space-y-6 px-6 py-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-bold text-[#0F2A1D] dark:text-white flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#375534] to-[#0F2A1D] rounded-lg">
                                <Compass className="w-8 h-8 text-white" />
                            </div>
                            Attraction Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all tourist attractions in Badian</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="px-8 py-3 bg-gradient-to-r from-[#375534] to-[#0F2A1D] hover:shadow-lg text-white font-semibold rounded-xl flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Attraction
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Attractions</div>
                                <div className="text-4xl font-bold text-[#375534] dark:text-[#AEC3B0] mt-2">{stats.total_attractions}</div>
                            </div>
                            <div className="p-3 bg-[#375534]/10 dark:bg-[#375534]/20 rounded-lg">
                                <Compass className="w-8 h-8 text-[#375534] dark:text-[#AEC3B0]" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active</div>
                                <div className="text-4xl font-bold text-green-600 mt-2">{stats.active_attractions}</div>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Star className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Inactive</div>
                                <div className="text-4xl font-bold text-red-600 mt-2">{stats.inactive_attractions}</div>
                            </div>
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attractions Table */}
                <div className="bg-white dark:bg-[#1F3A2F] rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#0F2A1D] dark:to-[#1F3A2F] border-b-2 border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Location</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Entry Fee</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Rating</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {attractions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Compass className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No attractions found</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">Create one to get started!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attractions.map((attraction) => (
                                        <tr key={attraction.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-[#375534]/30 dark:hover:to-transparent transition duration-200 border-l-4 border-transparent hover:border-[#375534]">
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{attraction.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                        {attraction.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0] flex-shrink-0" />
                                                {attraction.location}
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className="bg-gradient-to-r from-[#AEC3B0] to-[#375534] text-white font-semibold">{attraction.category}</Badge>
                                            </td>
                                            <td className="px-6 py-5 text-gray-700 dark:text-gray-300 text-sm font-medium">
                                                {attraction.entry_fee ? `₱${parseFloat(attraction.entry_fee.toString()).toFixed(2)}` : '—'}
                                            </td>
                                            <td className="px-6 py-5">
                                                {attraction.rating ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < Math.floor(attraction.rating!)
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{attraction.rating}/5</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={attraction.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(attraction)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition duration-200 hover:scale-110"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(attraction)}
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
                                        <Compass className="w-6 h-6 text-[#375534] dark:text-[#AEC3B0]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-white">
                                        {editingAttraction ? 'Edit Attraction' : 'Add New Attraction'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setIsEditModalOpen(false);
                                        setEditingAttraction(null);
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={editingAttraction ? handleSaveEdit : handleSaveNew} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Attraction Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Canyoneering Adventure"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Badian, Cebu"
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
                                        placeholder="Describe the attraction in detail..."
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition resize-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Best Time to Visit
                                    </label>
                                    <textarea
                                        name="best_time_to_visit"
                                        value={formData.best_time_to_visit}
                                        onChange={handleFormChange}
                                        placeholder="e.g., Best visited from November to March for dry season..."
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Adventure">Adventure</option>
                                            <option value="Beach">Beach</option>
                                            <option value="Nature">Nature</option>
                                            <option value="Water Sports">Water Sports</option>
                                            <option value="Cultural">Cultural</option>
                                            <option value="Scenic">Scenic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Entry Fee (₱)
                                        </label>
                                        <input
                                            type="number"
                                            name="entry_fee"
                                            value={formData.entry_fee}
                                            onChange={handleFormChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setIsEditModalOpen(false);
                                            setEditingAttraction(null);
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
                                            editingAttraction ? 'Update Attraction' : 'Create Attraction'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && deleteConfirmationAttraction && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#1F3A2F] rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-[#0F2A1D] dark:text-white mb-2">Delete Attraction</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Are you sure you want to delete <span className="font-semibold">"{deleteConfirmationAttraction.name}"</span>? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F2A1D]">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteConfirmationAttraction(null);
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
