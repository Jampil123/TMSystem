import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { Calendar, MapPin, Users, DollarSign, Check, Clock, MoreVertical } from 'lucide-react';

const bookings = [
    {
        id: 1,
        title: 'Island Hopping Tour - Bali',
        location: 'Bali, Indonesia',
        type: 'Activity',
        date: '2026-03-15',
        guests: 2,
        totalPrice: '$90',
        status: 'Confirmed',
        confirmation: 'BK001234',
    },
    {
        id: 2,
        title: 'Luxury Ocean Resort',
        location: 'Maldives',
        type: 'Accommodation',
        date: '2026-03-20',
        nights: 5,
        totalPrice: '$1,250',
        status: 'Confirmed',
        confirmation: 'BK001235',
    },
    {
        id: 3,
        title: 'Scuba Diving Adventure',
        location: 'Coral Triangle',
        type: 'Activity',
        date: '2026-03-25',
        guests: 1,
        totalPrice: '$65',
        status: 'Pending',
        confirmation: 'BK001236',
    },
    {
        id: 4,
        title: 'Eiffel Tower Tour',
        location: 'Paris, France',
        type: 'Attraction',
        date: '2026-02-14',
        guests: 2,
        totalPrice: '$32',
        status: 'Completed',
        confirmation: 'BK001220',
    },
    {
        id: 5,
        title: 'Boutique City Hotel',
        location: 'Barcelona, Spain',
        type: 'Accommodation',
        date: '2026-02-10',
        nights: 3,
        totalPrice: '$360',
        status: 'Completed',
        confirmation: 'BK001221',
    },
];

const statusBadges = {
    Confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800',
    Pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800',
    Completed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800',
};

export default function BookingHistory() {
    return (
        <TouristLayout>
            <Head title="Booking History" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Booking History & Management</h1>
                    <p className="text-[#E3EED4]">View and manage all your reservations and bookings</p>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white">{booking.title}</h3>
                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {booking.location}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadges[booking.status as keyof typeof statusBadges]}`}>
                                            {booking.status === 'Confirmed' && <Check className="w-3 h-3 inline mr-1" />}
                                            {booking.status === 'Pending' && <Clock className="w-3 h-3 inline mr-1" />}
                                            {booking.status}
                                        </span>
                                        <button className="p-2 text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Date</p>
                                        <p className="text-sm font-medium text-[#0F2A1D] dark:text-white flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {booking.date}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">
                                            {booking.type === 'Accommodation' ? 'Duration' : 'Guests'}
                                        </p>
                                        <p className="text-sm font-medium text-[#0F2A1D] dark:text-white flex items-center gap-2">
                                            {booking.type === 'Accommodation' ? (
                                                <>
                                                    <Calendar className="w-4 h-4" />
                                                    {booking.nights} nights
                                                </>
                                            ) : (
                                                <>
                                                    <Users className="w-4 h-4" />
                                                    {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Confirmation</p>
                                        <p className="text-sm font-medium text-[#0F2A1D] dark:text-white">{booking.confirmation}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Total Price</p>
                                        <p className="text-sm font-semibold text-[#C84B59] dark:text-[#E89BA3]">{booking.totalPrice}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <button className="px-4 py-2 rounded-lg bg-[#375534] text-white hover:bg-[#2d4227] transition-colors font-medium text-sm">
                                        View Details
                                    </button>
                                    {booking.status === 'Confirmed' && (
                                        <button className="px-4 py-2 rounded-lg bg-white dark:bg-[#1a3a2e] border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors font-medium text-sm">
                                            Modify Reservation
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TouristLayout>
    );
}
