import React, { createContext, useState, useCallback, useContext } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const id = `${Date.now()}-${Math.random()}`;
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Auto-remove after 5 seconds (but keep in list as unread)
        if (notification.type !== 'error' && notification.type !== 'warning') {
            setTimeout(() => {
                // Don't auto-remove, just keep in notification history
            }, 5000);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                removeNotification,
                markAsRead,
                markAllAsRead,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
