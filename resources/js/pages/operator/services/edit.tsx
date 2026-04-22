import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Services', href: '/operator/services' },
    { title: 'Edit Service', href: '/operator/services/edit' },
];

interface Attraction {
    id: number;
    name: string;
}

interface ServiceTypes {
    [key: string]: string;
}

interface EditServiceProps {
    service: any;
    attractions: Attraction[];
    serviceTypes: ServiceTypes;
}

export default function EditService({ service, attractions, serviceTypes }: EditServiceProps) {
    const { data, setData, put, processing, errors } = useForm({
        service_name: service.service_name || '',
        service_type: service.service_type || '',
        tourist_spot_id: service.tourist_spot_id || '',
        description: service.description || '',
        facebook_url: service.facebook_url || '',
        // Activity fields
        price_per_person: service.activity?.price_per_person || '',
        duration_minutes: service.activity?.duration_minutes || '',
        max_participants: service.activity?.max_participants || '',
        required_equipment: service.activity?.required_equipment || '',
        // Accommodation fields
        room_type: service.accommodation?.room_type || '',
        capacity: service.accommodation?.capacity || '',
        price_per_night: service.accommodation?.price_per_night || '',
        total_rooms: service.accommodation?.total_rooms || '',
    });

    const [descriptionLength, setDescriptionLength] = useState(service.description?.length || 0);
    const [activeTab, setActiveTab] = useState<'activity' | 'accommodation' | null>(null);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setData('description', value);
        setDescriptionLength(value.length);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/operator/services/${service.service_id}`);
    };

    const isActivityType = data.service_type === 'adventure' || data.service_type === 'tour';
    const isAccommodationType = data.service_type === 'accommodation' || data.service_type === 'restaurant';

    React.useEffect(() => {
        if (isActivityType) setActiveTab('activity');
        else if (isAccommodationType) setActiveTab('accommodation');
        else setActiveTab(null);
    }, [isActivityType, isAccommodationType]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Service" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/operator/services"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-[#375534] hover:bg-[#E3EED4] dark:text-[#AEC3B0] dark:hover:bg-[#375534]/20 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4]">Edit Service</h1>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-3xl">
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Service Name */}
                            <div>
                                <label htmlFor="service_name" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    Service Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="service_name"
                                    type="text"
                                    value={data.service_name}
                                    onChange={(e) => setData('service_name', e.target.value)}
                                    placeholder="e.g., Canyoneering Adventure, Guided Tour"
                                    className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                />
                                {errors.service_name && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.service_name}
                                    </p>
                                )}
                            </div>

                            {/* Service Type */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="service_type" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Service Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="service_type"
                                        value={data.service_type}
                                        onChange={(e) => setData('service_type', e.target.value)}
                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                    >
                                        <option value="">Select a service type</option>
                                        {Object.entries(serviceTypes).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.service_type && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.service_type}
                                        </p>
                                    )}
                                </div>

                                {/* Tourist Spot */}
                                <div>
                                    <label htmlFor="tourist_spot_id" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Tourist Spot / Attraction <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="tourist_spot_id"
                                        value={data.tourist_spot_id}
                                        onChange={(e) => setData('tourist_spot_id', e.target.value)}
                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                    >
                                        <option value="">Select an attraction</option>
                                        {attractions.map((attraction) => (
                                            <option key={attraction.id} value={attraction.id}>
                                                {attraction.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tourist_spot_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.tourist_spot_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                        {descriptionLength}/500
                                    </span>
                                </div>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={handleDescriptionChange}
                                    maxLength={500}
                                    placeholder="Describe your service in detail. What does it include? What can customers expect?"
                                    rows={5}
                                    className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0] resize-vertical"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Facebook URL */}
                            <div>
                                <label htmlFor="facebook_url" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    Facebook URL <span className="text-gray-400 text-xs">(Optional)</span>
                                </label>
                                <input
                                    id="facebook_url"
                                    type="url"
                                    value={data.facebook_url}
                                    onChange={(e) => setData('facebook_url', e.target.value)}
                                    placeholder="https://facebook.com/your-page"
                                    className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                />
                                {errors.facebook_url && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.facebook_url}
                                    </p>
                                )}
                            </div>

                            {/* Service Type Specific Details - Tabbed */}
                            {(isActivityType || isAccommodationType) && (
                                <div className="pt-4 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    {/* Tab Buttons */}
                                    <div className="flex gap-2 mb-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                        {isActivityType && (
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('activity')}
                                                className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
                                                    activeTab === 'activity'
                                                        ? 'border-[#375534] text-[#375534] dark:border-[#AEC3B0] dark:text-[#AEC3B0]'
                                                        : 'border-transparent text-[#6B8071] dark:text-[#AEC3B0]/60 hover:text-[#375534] dark:hover:text-[#AEC3B0]'
                                                }`}
                                            >
                                                Activity Details
                                            </button>
                                        )}
                                        {isAccommodationType && (
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('accommodation')}
                                                className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
                                                    activeTab === 'accommodation'
                                                        ? 'border-[#375534] text-[#375534] dark:border-[#AEC3B0] dark:text-[#AEC3B0]'
                                                        : 'border-transparent text-[#6B8071] dark:text-[#AEC3B0]/60 hover:text-[#375534] dark:hover:text-[#AEC3B0]'
                                                }`}
                                            >
                                                Accommodation Details
                                            </button>
                                        )}
                                    </div>

                                    {/* Activity Tab Content */}
                                    {isActivityType && activeTab === 'activity' && (
                                        <div className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {/* Price per Person */}
                                                <div>
                                                    <label htmlFor="price_per_person" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Price per Person <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-2 text-[#0F2A1D] dark:text-[#E3EED4]">₱</span>
                                                        <input
                                                            id="price_per_person"
                                                            type="number"
                                                            step="0.01"
                                                            value={data.price_per_person}
                                                            onChange={(e) => setData('price_per_person', e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 pl-8 pr-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                        />
                                                    </div>
                                                    {errors.price_per_person && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.price_per_person}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Duration */}
                                                <div>
                                                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Duration (minutes) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="duration_minutes"
                                                        type="number"
                                                        value={data.duration_minutes}
                                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                                        placeholder="e.g., 120"
                                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                    />
                                                    {errors.duration_minutes && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.duration_minutes}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Max Participants */}
                                                <div>
                                                    <label htmlFor="max_participants" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Max Participants <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="max_participants"
                                                        type="number"
                                                        value={data.max_participants}
                                                        onChange={(e) => setData('max_participants', e.target.value)}
                                                        placeholder="e.g., 10"
                                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                    />
                                                    {errors.max_participants && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.max_participants}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Required Equipment */}
                                                <div>
                                                    <label htmlFor="required_equipment" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Required Equipment <span className="text-gray-400 text-xs">(Optional)</span>
                                                    </label>
                                                    <input
                                                        id="required_equipment"
                                                        type="text"
                                                        value={data.required_equipment}
                                                        onChange={(e) => setData('required_equipment', e.target.value)}
                                                        placeholder="e.g., Helmet, Rope, Harness"
                                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                    />
                                                    {errors.required_equipment && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.required_equipment}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Accommodation Tab Content */}
                                    {isAccommodationType && activeTab === 'accommodation' && (
                                        <div className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {/* Room Type */}
                                                <div>
                                                    <label htmlFor="room_type" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Room Type <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        id="room_type"
                                                        value={data.room_type}
                                                        onChange={(e) => setData('room_type', e.target.value)}
                                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                    >
                                                        <option value="">Select room type</option>
                                                        <option value="single">Single Room</option>
                                                        <option value="double">Double Room</option>
                                                        <option value="twin">Twin Room</option>
                                                        <option value="suite">Suite</option>
                                                        <option value="dormitory">Dormitory</option>
                                                    </select>
                                                    {errors.room_type && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.room_type}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Capacity */}
                                                <div>
                                                    <label htmlFor="capacity" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Capacity (persons) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="capacity"
                                                        type="number"
                                                        value={data.capacity}
                                                        onChange={(e) => setData('capacity', e.target.value)}
                                                        placeholder="e.g., 2"
                                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                    />
                                                    {errors.capacity && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.capacity}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price per Night */}
                                                <div>
                                                    <label htmlFor="price_per_night" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Price per Night <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-2 text-[#0F2A1D] dark:text-[#E3EED4]">₱</span>
                                                        <input
                                                            id="price_per_night"
                                                            type="number"
                                                            step="0.01"
                                                            value={data.price_per_night}
                                                            onChange={(e) => setData('price_per_night', e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 pl-8 pr-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                        />
                                                    </div>
                                                    {errors.price_per_night && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.price_per_night}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Total Rooms */}
                                                <div>
                                                    <label htmlFor="total_rooms" className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                        Total Rooms Available <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="total_rooms"
                                                        type="number"
                                                        value={data.total_rooms}
                                                        onChange={(e) => setData('total_rooms', e.target.value)}
                                                        placeholder="e.g., 10"
                                                        className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                                    />
                                                    {errors.total_rooms && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.total_rooms}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 bg-[#E3EED4] dark:bg-[#375534]/10 px-6 py-4 flex items-center justify-between">
                            <Link
                                href="/operator/services"
                                className="inline-flex items-center rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 px-4 py-2 text-sm font-medium text-[#375534] dark:text-[#AEC3B0] hover:bg-white dark:hover:bg-[#375534]/20 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-lg bg-[#375534] hover:bg-[#2d4429] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 font-medium transition-colors"
                            >
                                {processing ? 'Updating...' : 'Update Service'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
