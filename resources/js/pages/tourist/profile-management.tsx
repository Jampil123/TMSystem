import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { User, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { useState } from 'react';

export default function ProfileManagement() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Janny Wilson',
        email: 'janny@ourwebsite.com',
        phone: '+2 025 234 9123',
        country: 'United States',
        city: 'New York',
        bio: 'Travel enthusiast exploring the world and discovering new experiences.',
        avatar: 'https://via.placeholder.com/150x150/375534/ffffff?text=JW',
    });

    const [formData, setFormData] = useState(profileData);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        setProfileData(formData);
        setIsEditing(false);
    };

    return (
        <TouristLayout>
            <Head title="Profile Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Profile & Account Management</h1>
                        <p className="text-[#E3EED4]">Manage your personal information and preferences</p>
                    </div>
                    <button
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        className="px-6 py-3 rounded-lg bg-white text-[#375534] hover:bg-[#E3EED4] transition-colors font-medium flex items-center gap-2"
                    >
                        {isEditing ? (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-5 h-5" />
                                Edit Profile
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <div className="text-center mb-6">
                            <img
                                src={profileData.avatar}
                                alt={profileData.name}
                                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#375534]"
                            />
                            <h2 className="text-2xl font-semibold text-[#0F2A1D] dark:text-white">{profileData.name}</h2>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-2">Tourist Member</p>
                        </div>

                        {/* Member Stats */}
                        <div className="space-y-4 pt-6 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Member Since</p>
                                <p className="font-semibold text-[#0F2A1D] dark:text-white">January 2024</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Total Bookings</p>
                                <p className="font-semibold text-[#0F2A1D] dark:text-white">12 bookings</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Loyalty Points</p>
                                <p className="font-semibold text-[#C84B59] dark:text-[#E89BA3]">1,250 points</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <h3 className="text-xl font-semibold text-[#0F2A1D] dark:text-white mb-6">Personal Information</h3>

                        <div className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-[#0F2A1D] dark:text-white mb-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-[#0F2A1D] dark:text-white mb-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-[#0F2A1D] dark:text-white mb-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                                />
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[#0F2A1D] dark:text-white mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#0F2A1D] dark:text-white mb-2 block">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-sm font-medium text-[#0F2A1D] dark:text-white mb-2 block">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                    <h3 className="text-xl font-semibold text-[#0F2A1D] dark:text-white mb-6">Preferences</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#C84B59]" />
                            <span className="text-sm text-[#0F2A1D] dark:text-white">Email notifications for bookings</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#C84B59]" />
                            <span className="text-sm text-[#0F2A1D] dark:text-white">Travel tips and recommendations</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#C84B59]" />
                            <span className="text-sm text-[#0F2A1D] dark:text-white">Special deals and promotions</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded accent-[#C84B59]" />
                            <span className="text-sm text-[#0F2A1D] dark:text-white">Security alerts</span>
                        </label>
                    </div>
                </div>
            </div>
        </TouristLayout>
    );
}
