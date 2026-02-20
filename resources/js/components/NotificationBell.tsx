import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, X, Check } from 'lucide-react';
import { useState } from 'react';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-[#0F2A1D] dark:text-white hover:bg-[#E3EED4] dark:hover:bg-[#375534] rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#C84B59] rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F2A1D] rounded-lg shadow-lg border border-[#AEC3B0]/20 dark:border-[#375534]/40 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[#AEC3B0]/20 dark:border-[#375534]/40">
                        <h3 className="font-semibold text-[#0F2A1D] dark:text-white">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-[#C84B59] hover:text-[#B03A47] dark:text-[#E89BA3] dark:hover:text-[#C84B59]"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-[#E3EED4] dark:hover:bg-[#375534] rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-[#AEC3B0]/10 dark:border-[#375534]/20 hover:bg-[#F5F5F5] dark:hover:bg-[#1A3A2A] transition-colors ${
                                        !notification.read ? 'bg-[#F9F9F9] dark:bg-[#162319]' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getTypeColor(notification.type)}`}
                                        >
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-[#0F2A1D] dark:text-white text-sm">
                                                    {notification.title}
                                                </p>
                                                <button
                                                    onClick={() => removeNotification(notification.id)}
                                                    className="text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-[#6B8071] dark:text-[#8BA98F]">
                                                    {notification.timestamp.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs text-[#C84B59] hover:text-[#B03A47] dark:text-[#E89BA3] dark:hover:text-[#C84B59]"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 mx-auto text-[#AEC3B0] dark:text-[#6B8071] mb-2" />
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Close on outside click */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
