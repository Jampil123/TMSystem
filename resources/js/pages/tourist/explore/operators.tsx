import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { Mail, Users, ArrowRight } from 'lucide-react';

interface Operator {
    id: number;
    name: string;
    email: string;
    username: string;
}

interface Props {
    operators: {
        data: Operator[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function TouristOperators({ operators }: Props) {
    return (
        <TouristLayout>
            <Head title="Tour Operators" />
            
            <div className="min-h-screen bg-[#E3EED4] dark:bg-[#0F2A1D] p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-8 h-8 text-[#C84B59]" />
                            <h1 className="text-4xl font-bold text-[#0F2A1D] dark:text-white">
                                Tour Operators
                            </h1>
                        </div>
                        <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0] mb-2">
                            Connect with professional tour operators for your travel needs
                        </p>
                        <div className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                            Total Operators: <span className="font-semibold text-[#C84B59]">{operators.total}</span>
                        </div>
                    </div>

                    {/* Operators Grid */}
                    {operators.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {operators.data.map((operator) => (
                                    <div
                                        key={operator.id}
                                        className="group rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                                    >
                                        {/* Header Background */}
                                        <div className="h-24 bg-gradient-to-r from-[#C84B59] to-[#E89BA3] dark:from-[#C84B59] dark:to-[#6B8071]"></div>

                                        {/* Content */}
                                        <div className="px-6 pb-6">
                                            {/* Avatar */}
                                            <div className="flex justify-center -mt-12 mb-4">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-[#0F2A1D] shadow-md">
                                                    {operator.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="text-center mb-4">
                                                <h3 className="text-xl font-bold text-[#0F2A1D] dark:text-white mb-1">
                                                    {operator.name}
                                                </h3>
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                    @{operator.username}
                                                </p>
                                            </div>

                                            {/* Email */}
                                            <div className="bg-[#E3EED4] dark:bg-[#375534]/30 rounded-lg p-3 mb-4">
                                                <div className="flex items-start gap-2">
                                                    <Mail className="w-4 h-4 text-[#C84B59] flex-shrink-0 mt-0.5" />
                                                    <a 
                                                        href={`mailto:${operator.email}`}
                                                        className="text-sm text-[#0F2A1D] dark:text-white hover:text-[#C84B59] dark:hover:text-[#E89BA3] break-all transition-colors"
                                                    >
                                                        {operator.email}
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Contact Button */}
                                            <button className="w-full px-4 py-3 bg-[#C84B59] text-white font-medium rounded-lg hover:bg-[#B03A47] transition-colors flex items-center justify-center gap-2 group/btn">
                                                <span>Get in Touch</span>
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {operators.last_page > 1 && (
                                <div className="flex flex-wrap justify-center items-center gap-2">
                                    <button 
                                        disabled={operators.current_page === 1}
                                        className="px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: operators.last_page }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`px-3 py-2 rounded-lg transition-colors ${
                                                operators.current_page === i + 1
                                                    ? 'bg-[#C84B59] text-white'
                                                    : 'border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        disabled={operators.current_page === operators.last_page}
                                        className="px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#0F2A1D] dark:text-white hover:bg-white dark:hover:bg-[#375534]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-lg p-12 text-center">
                            <Users className="w-12 h-12 text-[#6B8071] dark:text-[#AEC3B0] mx-auto mb-4 opacity-50" />
                            <p className="text-[#6B8071] dark:text-[#AEC3B0] text-lg">
                                No tour operators available at the moment
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </TouristLayout>
    );
}
