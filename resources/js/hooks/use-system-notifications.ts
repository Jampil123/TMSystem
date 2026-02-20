import { useNotifications } from '@/contexts/NotificationContext';
import { useCallback } from 'react';

export function useSystemNotifications() {
    const { addNotification } = useNotifications();

    const success = useCallback(
        (title: string, message: string) => {
            addNotification({
                title,
                message,
                type: 'success',
            });
        },
        [addNotification]
    );

    const error = useCallback(
        (title: string, message: string) => {
            addNotification({
                title,
                message,
                type: 'error',
            });
        },
        [addNotification]
    );

    const warning = useCallback(
        (title: string, message: string) => {
            addNotification({
                title,
                message,
                type: 'warning',
            });
        },
        [addNotification]
    );

    const info = useCallback(
        (title: string, message: string) => {
            addNotification({
                title,
                message,
                type: 'info',
            });
        },
        [addNotification]
    );

    return { success, error, warning, info };
}
