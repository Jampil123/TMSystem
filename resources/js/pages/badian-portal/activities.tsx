import MainLayout from '@/layouts/portal/MainLayouts';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';

type ActivityItem = {
    id: number;
    name: string;
    location: string;
    description: string;
    price: number;
    image?: string | null;
};

type ActivityPageProps = {
    activities: ActivityItem[];
    filters?: {
        search?: string;
    };
};

const storageUrl = (path?: string | null) => {
    if (!path) return '/images/background.jpg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/storage/')) return path;
    return `/storage/${path.replace(/^\/+/, '')}`;
};

export default function ActivitiesPage() {
    const { activities = [], filters } = usePage<ActivityPageProps>().props;
    const [search, setSearch] = useState(filters?.search ?? '');

    const onSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/activities',
            { search },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const hasActivities = useMemo(() => activities.length > 0, [activities]);

    return (
        <div className="w-full" style={{ backgroundColor: 'rgb(227, 238, 212)' }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#0F2A1D' }}>
                            Activities
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#375534' }}>
                            Discover exciting activities in Badian.
                        </p>
                    </div>

                    <form onSubmit={onSearch} className="flex w-full md:w-auto gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search activities..."
                            className="w-full md:w-72 rounded-xl border px-4 py-2.5 text-sm outline-none"
                            style={{ borderColor: '#AEC3B0', color: '#0F2A1D', backgroundColor: '#fff' }}
                        />
                        <button
                            type="submit"
                            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                            style={{ backgroundColor: '#375534' }}
                        >
                            Search
                        </button>
                    </form>
                </div>

                {!hasActivities ? (
                    <div className="rounded-2xl border p-8 text-center" style={{ borderColor: '#AEC3B0', backgroundColor: '#fff' }}>
                        <p className="text-base" style={{ color: '#375534' }}>
                            No activities found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="overflow-hidden rounded-2xl border shadow-sm"
                                style={{ borderColor: '#AEC3B0', backgroundColor: '#fff' }}
                            >
                                <img
                                    src={storageUrl(activity.image)}
                                    alt={activity.name}
                                    className="h-48 w-full object-cover"
                                />

                                <div className="p-4 space-y-2">
                                    <h2 className="text-lg font-bold" style={{ color: '#0F2A1D' }}>
                                        {activity.name}
                                    </h2>
                                    <p className="text-sm" style={{ color: '#6B9071' }}>
                                        {activity.location}
                                    </p>
                                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#375534' }}>
                                        {activity.description}
                                    </p>

                                    <div className="pt-2 flex items-center justify-between">
                                        <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>
                                            ₱{activity.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <Link
                                            href="/badian-portal/services"
                                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white"
                                            style={{ backgroundColor: '#375534' }}
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

ActivitiesPage.layout = (page: ReactNode) => <MainLayout children={page} />;

