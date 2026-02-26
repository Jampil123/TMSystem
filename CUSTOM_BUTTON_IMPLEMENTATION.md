# Service Action Button - Custom Implementation

## Overview
A reusable custom button component (`ServiceActionButton`) has been created to handle service management actions following the three-state workflow.

## Component Location
- **File**: `resources/js/components/service-action-button.tsx`
- **Usage**: Integrated into admin service detail views

## Features

### Three Action Types:

#### 1. **APPROVED** ✓
- **Status**: Changes to `Approved`
- **Fields Set**: 
  - `approved_by` = admin_id
  - `approved_at` = timestamp
- **System Action**: Makes service visible in Tourist View
- **UI**: Green button with Check icon

#### 2. **REJECTED** ✗
- **Status**: Changes to `Rejected`
- **Fields Set**:
  - `remarks` = reason (required)
  - Examples: "Overpricing compared to LGU standard rate"
- **System Action**: Operator receives notification
- **UI**: Red button with X icon

#### 3. **REVISION REQUIRED** ⚠
- **Status**: Changes to `Revision Required`
- **Fields Set**:
  - `remarks` = feedback/requirements (required)
  - Examples: "Please reduce pricing to meet LGU standards"
- **System Action**: Operator allowed to edit and resubmit
- **UI**: Blue button with AlertTriangle icon

## Button Behavior

### When Status = "Pending":
- Shows three action buttons: Approve, Revise, Reject
- Clicking any button opens a confirmation state
- For Reject/Revise: Requires remarks text input
- For Approve: Optional remarks (approval notes)
- Confirm button triggers the appropriate route

### When Status != "Pending":
- Buttons are hidden
- Shows read-only status badge
- Displays review information (who approved, when, remarks)

## Component Props

```typescript
interface ServiceActionButtonProps {
    serviceId: number;           // The service ID to action
    currentStatus: string;       // Current service status
    onSuccess?: () => void;      // Callback after successful action
}
```

## API Routes Called

- **Approve**: `POST /services/{service_id}/approve`
- **Reject**: `POST /services/{service_id}/reject`
- **Request Revision**: `POST /services/{service_id}/request-revision`

## Integration Example

```tsx
import ServiceActionButton from '@/components/service-action-button';

// In your component:
<ServiceActionButton 
    serviceId={service.service_id}
    currentStatus={service.status}
    onSuccess={() => {
        // Handle success - page will refresh via Inertia
    }}
/>
```

## Files Modified
1. **NEW**: `resources/js/components/service-action-button.tsx` - Custom button component
2. **UPDATED**: `resources/js/pages/admin/services/show.tsx` - Integrated custom button
3. **UNCHANGED**: Backend controllers already support the workflow

## Styling
- Uses project's color scheme (#375534, #E3EED4, #0F2A1D)
- Dark mode support built-in
- Responsive design with icon-only display on mobile (sm hidden)
- Lucide React icons for visual consistency

## Notifications (TODO)
- System should dispatch notifications to operators when:
  - Service is Approved → ServiceApprovedNotification
  - Service is Rejected → ServiceRejectedNotification
  - Service needs Revision → ServiceRevisionRequestedNotification
