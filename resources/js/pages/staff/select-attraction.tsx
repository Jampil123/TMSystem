import { Head, router } from '@inertiajs/react';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Attraction {
    id: number;
    name: string;
    location: string | null;
    category: string | null;
    image_url: string | null;
}

interface Props {
    attractions: Attraction[];
}

export default function SelectAttraction({ attractions }: Props) {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger float-in animation after mount
        const t = setTimeout(() => setVisible(true), 30);
        return () => clearTimeout(t);
    }, []);

    const handleConfirm = () => {
        if (!selected) return;
        setSubmitting(true);
        router.post(
            '/staff/select-attraction',
            { attraction_id: selected },
            { onFinish: () => setSubmitting(false) },
        );
    };

    return (
        <>
            <Head title="Select Your Attraction" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3EED4] via-[#d4e6c0] to-[#AEC3B0] p-6">
                {/* Floating card */}
                <div
                    className="w-full max-w-3xl"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0px)' : 'translateY(32px)',
                        transition: 'opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)',
                    }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-[#375534] via-[#6B8071] to-[#AEC3B0]" />

                        <div className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#375534] to-[#0F2A1D] mb-4 shadow-lg">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-[#0F2A1D]">
                                    Select Your Assigned Attraction
                                </h1>
                                <p className="text-sm text-[#6B8071] mt-2">
                                    Choose the tourist spot where you are stationed today.
                                </p>
                            </div>

                            {/* Attraction Grid */}
                            {attractions.length === 0 ? (
                                <div className="text-center py-12 text-[#6B8071]">
                                    No active attractions found. Please contact your administrator.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    {attractions.map((attraction, index) => {
                                        const isSelected = selected === attraction.id;
                                        return (
                                            <button
                                                key={attraction.id}
                                                onClick={() => setSelected(attraction.id)}
                                                className={`text-left rounded-2xl border-2 p-5 transition-all focus:outline-none ${
                                                    isSelected
                                                        ? 'border-[#375534] bg-[#375534] text-white shadow-lg scale-[1.02]'
                                                        : 'border-[#AEC3B0]/40 bg-[#F8FBF5] hover:border-[#375534]/60 hover:shadow-md hover:-translate-y-0.5'
                                                }`}
                                                style={{
                                                    opacity: visible ? 1 : 0,
                                                    transform: visible
                                                        ? isSelected ? 'scale(1.02)' : 'translateY(0px)'
                                                        : 'translateY(16px)',
                                                    transition: `opacity 0.4s ease ${0.15 + index * 0.07}s, transform 0.4s ease ${0.15 + index * 0.07}s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s`,
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                            isSelected ? 'bg-white/20' : 'bg-[#E3EED4]'
                                                        }`}
                                                    >
                                                        <MapPin
                                                            className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[#375534]'}`}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-semibold text-base leading-tight ${isSelected ? 'text-white' : 'text-[#0F2A1D]'}`}>
                                                            {attraction.name}
                                                        </p>
                                                        {attraction.location && (
                                                            <p className={`text-xs mt-1 truncate ${isSelected ? 'text-white/80' : 'text-[#6B8071]'}`}>
                                                                {attraction.location}
                                                            </p>
                                                        )}
                                                        {attraction.category && (
                                                            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E3EED4] text-[#375534]'}`}>
                                                                {attraction.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Confirm Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleConfirm}
                                    disabled={!selected || submitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-br from-[#375534] to-[#0F2A1D] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {submitting ? 'Loading...' : 'Confirm & Go to Dashboard'}
                                    {!submitting && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
