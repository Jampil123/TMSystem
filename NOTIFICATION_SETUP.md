# Notification System Documentation

## Overview
The notification system provides a centralized way to display system alerts and notifications to users. Notifications are managed through React Context and can be triggered from any component.

## Components

### NotificationContext
Located at: `resources/js/contexts/NotificationContext.tsx`

Manages:
- Notification state (array of notifications)
- Methods to add, remove, and mark notifications as read
- Unread count tracking

### NotificationBell
Located at: `resources/js/components/NotificationBell.tsx`

A UI component that:
- Displays a bell icon in the header
- Shows badge with unread count
- Opens a dropdown to view all notifications
- Allows marking notifications as read/unread
- Supports notification removal

## Usage

### 1. Using the Hook

In any component, import and use the `useSystemNotifications` hook:

```tsx
import { useSystemNotifications } from '@/hooks/use-system-notifications';

export function MyComponent() {
    const { success, error, warning, info } = useSystemNotifications();

    const handleSave = async () => {
        try {
            // Your save logic
            success('Success', 'Changes saved successfully');
        } catch (err) {
            error('Error', 'Failed to save changes');
        }
    };

    return <button onClick={handleSave}>Save</button>;
}
```

### 2. Notification Types

- **success**: For successful operations (green)
- **error**: For errors (red)
- **warning**: For warnings (yellow)
- **info**: For informational messages (blue)

### 3. Adding Notifications to Events

Example: Attraction Creation
```tsx
const handleCreated = async (data) => {
    try {
        await api.post('/attractions', data);
        success('Created', 'Attraction created successfully');
    } catch (error) {
        error('Failed', 'Could not create attraction');
    }
};
```

### 4. Example in Dashboard

The tourist dashboard can show welcome notifications:

```tsx
useEffect(() => {
    info('Welcome', 'Explore amazing attractions and accommodations');
}, []);
```

## Features

✅ **Persistent Storage**: Notifications stay until user removes them
✅ **Mark as Read**: Users can mark individual or all notifications as read
✅ **Badge Counter**: Shows unread notification count on bell icon
✅ **Timestamps**: Each notification shows when it was created
✅ **Responsive**: Works on all screen sizes
✅ **Dark Mode**: Supports light/dark theme
✅ **Auto-close Dropdown**: Closes when clicking outside

## Best Practices

1. **Be Specific**: Use clear, concise titles and messages
2. **Right Type**: Use the correct notification type for context
3. **Timing**: Show notifications for all important system events
4. **Error Handling**: Always show error notifications on failure
5. **User Actions**: Show confirmations for significant user actions

## Integration Points

Add notifications to:
- ✅ Form submissions (success/error)
- ✅ Attraction/Activity creation
- ✅ Profile updates
- ✅ Booking confirmations
- ✅ Error scenarios
- ✅ Important system events

