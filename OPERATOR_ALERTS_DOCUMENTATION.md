# Operator Alerts System Documentation

## Overview
The Operator Alerts System is a comprehensive alert management feature designed for external operators to manage and respond to various operational alerts including safety issues, guide assignments, schedule conflicts, and service updates.

## Features

### Alert Types
1. **Safety Issue** - Critical safety-related alerts
2. **Guide Assignment** - Alerts related to guide allocation and availability
3. **Schedule Conflict** - Alerts about scheduling conflicts
4. **Service Update** - Notifications about service changes

### Priority Levels
- **High** - Requires immediate attention (red highlighting)
- **Medium** - Important but not critical (yellow highlighting)
- **Low** - Informational (blue highlighting)

### Alert Status
- **Active** - New, unresolved alert
- **Acknowledged** - Alert reviewed but not yet resolved
- **Resolved** - Alert has been handled

### Suggested Actions
- **View** - Review alert details
- **Acknowledge** - Mark as reviewed
- **Resolve** - Close the alert with optional notes

## Database Schema

### operator_alerts Table
```
id                      - Alert ID (Primary Key)
operator_id             - Foreign key to users table
alert_type              - Enum: Safety Issue, Guide Assignment, Schedule Conflict, Service Update
priority_level          - Enum: High, Medium, Low
tourist_group_name      - String (name of tourist group)
number_of_tourists      - Integer
assigned_guide_name     - String (nullable)
activity_service_name   - String
activity_date_time      - DateTime
description             - Text (alert details)
suggested_action        - Enum: View, Resolve, Acknowledge
status                  - Enum: Active, Acknowledged, Resolved
resolution_notes        - Text (nullable, for resolution details)
created_at              - Timestamp
updated_at              - Timestamp
```

## API Endpoints

### List Alerts
```
GET /operator/alerts
```
Returns a paginated list of all alerts for the authenticated operator.

**Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "alertType": "Safety Issue",
      "priorityLevel": "High",
      "touristGroupName": "Adventure Seekers",
      "numberOfTourists": 5,
      "assignedGuideName": "Juan Dela Cruz",
      "activityServiceName": "Canyoneering",
      "activityDateTime": "Mar 03, 2026 09:00",
      "description": "Insufficient guides assigned",
      "suggestedAction": "Resolve",
      "status": "Active",
      "createdAt": "Mar 02, 2026 14:30"
    }
  ],
  "activeCount": 5,
  "highPriorityCount": 2
}
```

### Get Alerts (JSON API)
```
GET /operator/alerts/api
```
Returns active alerts as JSON (useful for dashboard widgets).

### View Single Alert
```
GET /operator/alerts/{id}
```
Returns details for a specific alert.

### Acknowledge Alert
```
POST /operator/alerts/{id}/acknowledge
```
Mark an alert as acknowledged.

### Resolve Alert
```
POST /operator/alerts/{id}/resolve
Body: {
  "resolution_notes": "Optional notes about resolution"
}
```
Mark an alert as resolved with optional notes.

### Create Alert (Admin/Testing)
```
POST /operator/alerts
Body: {
  "alert_type": "Safety Issue",
  "priority_level": "High",
  "tourist_group_name": "Group Name",
  "number_of_tourists": 5,
  "assigned_guide_name": "Guide Name",
  "activity_service_name": "Activity Name",
  "activity_date_time": "2026-03-03 09:00",
  "description": "Alert description",
  "suggested_action": "View"
}
```

## Model Methods

### OperatorAlert Model

#### Scopes
```php
// Get active alerts
OperatorAlert::active()->get();

// Get high priority alerts
OperatorAlert::highPriority()->get();

// Order by priority (High -> Medium -> Low) and date
OperatorAlert::orderByPriority()->get();
```

#### Instance Methods
```php
// Mark alert as acknowledged
$alert->acknowledge();

// Mark alert as resolved with notes
$alert->resolve('Resolution details');

// Get related operator
$alert->operator();
```

## React Component Features

### Main Alerts Page (`operator/alerts/index.tsx`)

#### Summary Cards
- Active Alerts Count
- High Priority Alerts Count
- Total Alerts Count

#### Filtering
- By Status (All, Active, Resolved)
- By Priority (High, Medium, Low)

#### Alert Display
Each alert card displays:
- Alert type with icon
- Priority level badge
- Status indicator
- Tourist group size
- Assigned guide information
- Activity/Service name
- Activity date & time
- Description
- Suggested action buttons
- Creation timestamp
- Resolution notes (if available)

#### Actions
- **Acknowledge Button** - Shows modal to confirm acknowledgment
- **Resolve Button** - Shows modal with option to add resolution notes

## Authorization

The system uses Laravel policies to ensure operators can only manage their own alerts.

**OperatorAlertPolicy.php:**
```php
- view()    - Check if user owns the alert
- update()  - Check if user owns the alert
- delete()  - Check if user owns the alert
```

## UI/UX Features

### Visual Hierarchy
- High priority alerts highlighted in red with emphasis
- Medium priority alerts in yellow
- Low priority alerts in blue
- Resolved alerts appear faded

### Color Scheme
- Uses the project's green color scheme (#375534, #AEC3B0, #E3EED4)
- Supports dark mode with appropriate color variants
- Alert-specific colors (red, yellow, green) for quick visual scanning

### Status Indicators
- Active: Red alert circle
- Acknowledged: Yellow clock icon
- Resolved: Green check circle

## Integration Points

### Sidebar Navigation
- Added "Alerts" menu item in operator sidebar
- Positioned after "Guest Submission" and before "Notifications"
- Uses Bell icon for consistency

### Data Flow
1. Controller retrieves alerts from database
2. Maps data to frontend-friendly format
3. Inertia renders React component
4. User filters/acknowledges/resolves alerts
5. Ajax POST requests update status
6. Page refreshes with updated data

## Setup Instructions

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Register AuthServiceProvider (Already done in bootstrap/providers.php)
The policy is automatically registered in the AuthServiceProvider

### 3. Seed Sample Data (Optional)
```bash
php artisan db:seed --class=OperatorAlertSeeder
```

### 4. Build Frontend Assets
```bash
npm run build
```

## Testing

### Manual Testing
1. Navigate to `/operator/alerts`
2. View the alerts list with filters
3. Test acknowledge functionality
4. Test resolve with notes
5. Verify status updates

### Creating Test Alerts via API
```bash
curl -X POST http://localhost/operator/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "alert_type": "Safety Issue",
    "priority_level": "High",
    "tourist_group_name": "Test Group",
    "number_of_tourists": 5,
    "assigned_guide_name": "Test Guide",
    "activity_service_name": "Test Activity",
    "activity_date_time": "2026-03-03 09:00",
    "description": "Test alert for demonstration",
    "suggested_action": "View"
  }'
```

## Future Enhancements

1. **Email Notifications** - Send email alerts for high-priority issues
2. **SMS Alerts** - Critical alerts via SMS
3. **Dashboard Widget** - Show recent alerts on operator dashboard
4. **Alert History** - Archive resolved alerts for historical reporting
5. **Bulk Actions** - Acknowledge/resolve multiple alerts at once
6. **Custom Alert Rules** - Let operators define their own alert triggers
7. **Alert Comments** - Add discussion threads to alerts
8. **Auto-resolution** - Some alerts could auto-resolve based on conditions

## Troubleshooting

### Alerts not showing
1. Verify operator has alerts in database
2. Check that user is authenticated
3. Confirm alert operator_id matches logged-in user id
4. Check browser console for JavaScript errors

### Acknowledge/Resolve not working
1. Verify CSRF token is being sent
2. Check server-side route is properly defined
3. Verify authorization policy allows the action
4. Check Laravel logs for errors

### Database migration failures
1. Ensure MySQL/MariaDB supports datetime fields
2. Check previous migrations ran successfully
3. Verify user table exists and has id column
