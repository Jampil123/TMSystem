import { useSystemNotifications } from '@/hooks/use-system-notifications';
import { useEffect } from 'react';

/**
 * Hook to demonstrate notification usage
 * Shows different notification types based on system events
 */
export function useNotificationExamples() {
    const notifications = useSystemNotifications();

    // Example: Show a success notification when component mounts
    useEffect(() => {
        // This would typically be triggered by actual events
        // notifications.success('Welcome!', 'You have successfully logged in to the dashboard');
    }, []);

    return notifications;
}

/**
 * Show a success notification
 * Usage: showSuccessNotification('Profile Updated', 'Your profile has been saved successfully');
 */
export function showSuccessNotification(title: string, message: string) {
    const notifications = useSystemNotifications();
    notifications.success(title, message);
}

/**
 * Show an error notification
 * Usage: showErrorNotification('Save Failed', 'An error occurred while saving your changes');
 */
export function showErrorNotification(title: string, message: string) {
    const notifications = useSystemNotifications();
    notifications.error(title, message);
}

/**
 * Show a warning notification
 * Usage: showWarningNotification('Unsaved Changes', 'You have unsaved changes');
 */
export function showWarningNotification(title: string, message: string) {
    const notifications = useSystemNotifications();
    notifications.warning(title, message);
}

/**
 * Show an info notification
 * Usage: showInfoNotification('Booking Created', 'Your booking has been created');
 */
export function showInfoNotification(title: string, message: string) {
    const notifications = useSystemNotifications();
    notifications.info(title, message);
}
