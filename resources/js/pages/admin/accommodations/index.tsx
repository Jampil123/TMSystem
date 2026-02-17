import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Trash2, Edit, X, AlertTriangle, Star, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accommodation Management',
        href: '/accommodations',
    },
];

interface Accommodation {
    id: number;
    name: string;
    description: string;
    type: string;
    location: string;
    image_url: string | null;
    rating: number | null;
    status: string;
}

interface PageProps {
    accommodations: Accommodation[];
    stats: {
        total_accommodations: number;
        active_accommodations: number;
        inactive_accommodations: number;
    };
}

export default function AccommodationManagement({ accommodations = [], stats = { total_accommodations: 0, active_accommodations: 0, inactive_accommodations: 0 } }: PageProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationAccommodation, setDeleteConfirmationAccommodation] = useState<Accommodation | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: '',
        location: '',
        image_url: '',
        rating: '',
        status: 'active',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddClick = () => {
        setFormData({
            name: '',
            description: '',
            type: '',
            location: '',
            image_url: '',
            rating: '',
            status: 'active',
        });
        setEditingAccommodation(null);
        setIsAdding(true);
    };

    const handleEditClick = (accommodation: Accommodation) => {
        setEditingAccommodation(accommodation);
        setFormData({
            name: accommodation.name,
            description: accommodation.description,
            type: accommodation.type,
            location: accommodation.location,
            image_url: accommodation.image_url || '',
            rating: accommodation.rating?.toString() || '',
            status: accommodation.status,
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

        router.post('/accommodations', formData, {
            onSuccess: () => {
                setIsAdding(false);
                setFormData({
                    name: '',
                    description: '',
                    type: '',
                    location: '',
                    image_url: '',
                    rating: '',
                    status: 'active',
                });
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to create accommodation');
            },
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccommodation) return;

        setIsSubmitting(true);
        router.put(`/accommodations/${editingAccommodation.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingAccommodation(null);
                setIsSubmitting(false);
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                alert('Failed to update accommodation');
            },
        });
    };

    const handleDeleteClick = (accommodation: Accommodation) => {
        setDeleteConfirmationAccommodation(accommodation);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirmationAccommodation) return;

        router.delete(`/accommodations/${deleteConfirmationAccommodation.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmationAccommodation(null);
                router.reload();
            },
            onError: () => {
                alert('Failed to delete accommodation');
            },
        });
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <Badge className={status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
            {status === 'active' ? '✓ Active' : '✗ Inactive'}
        </Badge>
    );

    const TypeBadge = ({ type }: { type: string }) => {
        const colorMap: Record<string, string> = {
            'hotel': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'resort': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'hostel': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'villa': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            'bed & breakfast': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return <Badge className={colorMap[type.toLowerCase()] || colorMap['hotel']}>{type}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accommodation Management" />

            <div className="space-y-6 px-6 py-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-bold text-[#0F2A1D] dark:text-white flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#375534] to-[#0F2A1D] rounded-lg">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            Accommodation Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all tourist accommodations in Badian</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="px-8 py-3 bg-gradient-to-r from-[#375534] to-[#0F2A1D] hover:shadow-lg text-white font-semibold rounded-xl flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Accommodation
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Accommodations</div>
                                <div className="text-4xl font-bold text-[#375534] dark:text-[#AEC3B0] mt-2">{stats.total_accommodations}</div>
                            </div>
                            <div className="p-3 bg-[#375534]/10 dark:bg-[#375534]/20 rounded-lg">
                                <Building2 className="w-8 h-8 text-[#375534] dark:text-[#AEC3B0]" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active</div>
                                <div className="text-4xl font-bold text-green-600 mt-2">{stats.active_accommodations}</div>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Building2 className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1F3A2F] dark:to-[#0F2A1D] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Inactive</div>
                                <div className="text-4xl font-bold text-red-600 mt-2">{stats.inactive_accommodations}</div>
                            </div>
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accommodations Table */}
                <div className="bg-white dark:bg-[#1F3A2F] rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#0F2A1D] dark:to-[#1F3A2F] border-b-2 border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Location</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Rating</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {accommodations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No accommodations found</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">Create one to get started!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    accommodations.map((accommodation) => (
                                        <tr key={accommodation.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-[#375534]/30 dark:hover:to-transparent transition duration-200 border-l-4 border-transparent hover:border-[#375534]">
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{accommodation.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                        {accommodation.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <TypeBadge type={accommodation.type} />
                                            </td>
                                            <td className="px-6 py-5 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                {accommodation.location}
                                            </td>
                                            <td className="px-6 py-5">
                                                {accommodation.rating ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < Math.floor(accommodation.rating!)
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{accommodation.rating}/5</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={accommodation.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(accommodation)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition duration-200 hover:scale-110"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(accommodation)}
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
                                        <Building2 className="w-6 h-6 text-[#375534] dark:text-[#AEC3B0]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-white">
                                        {editingAccommodation ? 'Edit Accommodation' : 'Add New Accommodation'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setIsEditModalOpen(false);
                                        setEditingAccommodation(null);
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={editingAccommodation ? handleSaveEdit : handleSaveNew} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Accommodation Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="e.g., Badian Beach Resort"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition"
                                            required
                                        >
                                            <option value="">Select type</option>
                                            <option value="Hotel">Hotel</option>
                                            <option value="Resort">Resort</option>
                                            <option value="Hostel">Hostel</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Bed & Breakfast">Bed & Breakfast</option>
                                        </select>
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
                                        placeholder="Describe the accommodation in detail..."
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#375534] focus:border-transparent dark:bg-[#0F2A1D] dark:text-white transition resize-none"
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

                                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setIsEditModalOpen(false);
                                            setEditingAccommodation(null);
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
                                            editingAccommodation ? 'Update Accommodation' : 'Create Accommodation'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && deleteConfirmationAccommodation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#1F3A2F] rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-[#0F2A1D] dark:text-white mb-2">Delete Accommodation</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Are you sure you want to delete <span className="font-semibold">"{deleteConfirmationAccommodation.name}"</span>? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0F2A1D]">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteConfirmationAccommodation(null);
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
