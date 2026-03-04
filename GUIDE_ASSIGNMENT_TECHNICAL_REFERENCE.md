# 5.3 Guide Assignment Logic - Technical Reference

## Database Schema

### guide_assignments Table

```sql
CREATE TABLE guide_assignments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Foreign Keys
    guest_list_id BIGINT UNSIGNED NOT NULL,
    guide_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NULL,
    
    -- Assignment Details
    assignment_date DATE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    guest_count INT NOT NULL,
    service_type VARCHAR(255) NULL,
    
    -- Status Fields
    assignment_status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    compliance_status VARCHAR(50) DEFAULT 'Good',
    
    -- Warning Flags
    has_certification_warning BOOLEAN DEFAULT FALSE,
    has_availability_conflict BOOLEAN DEFAULT FALSE,
    
    -- Notes & Metadata
    notes LONGTEXT NULL,
    compliance_notes LONGTEXT NULL,
    assigned_at DATETIME NULL,
    
    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_guide_assignment_date (guide_id, assignment_date),
    INDEX idx_guest_list (guest_list_id),
    INDEX idx_status (assignment_status),
    INDEX idx_compliance (compliance_status),
    
    -- Constraints
    UNIQUE KEY uq_guest_list (guest_list_id),
    FOREIGN KEY fk_guest_list_id (guest_list_id) 
        REFERENCES guest_lists(id) ON DELETE CASCADE,
    FOREIGN KEY fk_guide_id (guide_id) 
        REFERENCES guides(id) ON DELETE CASCADE,
    FOREIGN KEY fk_assigned_by (assigned_by) 
        REFERENCES users(id) ON DELETE SET NULL
);
```

## File Structure

```
app/
├── Models/
│   ├── GuideAssignment.php          # Assignment model with relationships
│   ├── Guide.php                    # Updated with assignments() relation
│   ├── GuideCertification.php       # Updated with scopes
│   └── GuestList.php                # Updated with assignment() relation
├── Services/
│   └── GuideAssignmentService.php   # Core assignment logic
├── Http/Controllers/
│   └── GuideController.php          # Assignment endpoints
└── Notifications/
    └── GuideAssignedNotification.php # Guide notification

database/
└── migrations/
    └── 2026_03_03_100000_create_guide_assignments_table.php

resources/js/
└── components/admin/guides/
    ├── EligibleGuides.tsx           # Guide selection UI
    ├── AssignmentConfirmModal.tsx   # Confirmation modal
    └── AssignmentStatus.tsx         # Status display & management

routes/
└── web.php                          # Assignment routes

docs/
├── GUIDE_ASSIGNMENT_IMPLEMENTATION.md   # Technical docs
├── GUIDE_ASSIGNMENT_USAGE_GUIDE.md      # User guide
└── GUIDE_ASSIGNMENT_TECHNICAL_REF.md    # This file
```

## Core Classes & Methods

### GuideAssignmentService

Complete public API:

```php
namespace App\Services;

class GuideAssignmentService {
    
    // Main assignment methods
    public function getEligibleGuides(GuestList $guestList, array $filters = []): Collection
    public function assignGuide(GuestList $guestList, Guide $guide, array $data, $assignedBy = null): GuideAssignment
    public function autoAssignGuide(GuestList $guestList, array $filters = [], $assignedBy = null): ?GuideAssignment
    
    // Validation methods
    public function getGuideAvailabilityDetails(Guide $guide, ?string $date = null): array
    public function getGuideAssignmentSummary(Guide $guide, ?string $date = null): array
    
    // Private validation methods (internal)
    private function isGuideEligible(Guide $guide, GuestList $guestList, array $filters): bool
    private function hasExpiredCertification(Guide $guide): bool
    private function hasCertification(Guide $guide, string $certificationName): bool
    private function hasTimeConflict(Guide $guide, Carbon|string $visitDate): bool
    private function isUnavailable(Guide $guide, Carbon|string $visitDate): bool
    private function matchesSpecialty(Guide $guide, string $serviceType): bool
    private function hasComplianceIssue(Guide $guide): bool
    private function hasCertificationExpiringSoon(Guide $guide): bool
    private function willCauseConflict(Guide $guide, GuestList $guestList): bool
    private function determineComplianceStatus(Guide $guide, bool $certWarning, bool $availabilityConflict): string
    private function generateAlerts(GuideAssignment $assignment, Guide $guide, GuestList $guestList, bool $certWarning, bool $availabilityConflict): void
    private function scoreGuide(Guide $guide, GuestList $guestList): float
}
```

### GuideAssignment Model

```php
namespace App\Models;

class GuideAssignment extends Model {
    
    // Relationships
    public function guestList(): BelongsTo
    public function guide(): BelongsTo
    public function assignedBy(): BelongsTo
    
    // Scopes
    public function scopePending($query)
    public function scopeConfirmed($query)
    public function scopeActive($query)
    public function scopeFlagged($query)
    
    // Methods
    public function isValid(): bool
    public function confirm(): void
    public function complete(): void
    public function cancel($reason = null): void
}
```

## API Reference

### Endpoints Summary

All endpoints return JSON with this structure:
```json
{
    "success": true|false,
    "message": "Human readable message",
    "data": { /* response data */ }
}
```

### 1. Get Eligible Guides

**Endpoint:** `GET /guest-lists/{guestList}/eligible-guides`

**Query Parameters:**
- `service_type` (optional): Filter by service type
- `required_certification` (optional): Filter by certification requirement

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "contact_number": "+1234567890",
            "years_of_experience": 5,
            "specialty_areas": ["Hiking", "Mountain Climbing"],
            "is_available": true,
            "expiry_status": "All Certifications Valid",
            "assignment_summary": {
                "total_assignments": 2,
                "total_guests": 15,
                "assignments": [...]
            },
            "expired_certifications": [],
            "expiring_soon_certifications": [
                {
                    "name": "Rock Climbing Certification",
                    "expiry_date": "2026-03-15",
                    "days_until_expiry": 12
                }
            ]
        }
    ],
    "count": 5
}
```

### 2. Assign Guide (Manual)

**Endpoint:** `POST /guest-lists/{guestList}/assign-guide`

**Request Body:**
```json
{
    "guide_id": 1,
    "start_time": "08:00",
    "end_time": "17:00",
    "service_type": "Hiking Tour",
    "notes": "Group has 2 children, requires slow pace"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Guide John Doe has been assigned successfully!",
    "data": {
        "assignment_id": 5,
        "status": "Pending",
        "compliance_status": "Warning",
        "has_warnings": true
    }
}
```

**Error Response:**
```json
{
    "success": false,
    "message": "Guide is not eligible for assignment due to conflicts or compliance issues."
}
```

### 3. Auto-Assign Guide

**Endpoint:** `POST /guest-lists/{guestList}/auto-assign-guide`

**Request Body:**
```json
{
    "service_type": "Cultural Tour",
    "required_certification": "Cultural Heritage"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Guide Jane Smith has been auto-assigned successfully!",
    "data": {
        "assignment_id": 6,
        "guide_id": 3,
        "guide_name": "Jane Smith",
        "status": "Pending",
        "compliance_status": "Good"
    }
}
```

### 4. Confirm Assignment

**Endpoint:** `POST /guide-assignments/{assignment}/confirm`

**Response:**
```json
{
    "success": true,
    "message": "Assignment confirmed successfully!",
    "data": {
        "assignment_id": 5,
        "status": "Confirmed"
    }
}
```

### 5. Complete Assignment

**Endpoint:** `POST /guide-assignments/{assignment}/complete`

**Response:**
```json
{
    "success": true,
    "message": "Assignment marked as completed!",
    "data": {
        "assignment_id": 5,
        "status": "Completed"
    }
}
```

### 6. Cancel Assignment

**Endpoint:** `POST /guide-assignments/{assignment}/cancel`

**Request Body:**
```json
{
    "reason": "Guest cancelled tour"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Assignment cancelled successfully!",
    "data": {
        "assignment_id": 5,
        "status": "Cancelled"
    }
}
```

### 7. Get Assignment Details

**Endpoint:** `GET /guide-assignments/{assignment}`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 5,
        "guest_list_id": 10,
        "guide": {
            "id": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "contact_number": "+1234567890",
            "specialty_areas": ["Hiking", "Mountain Climbing"],
            "years_of_experience": 5
        },
        "guest_list": {
            "id": 10,
            "visit_date": "2026-03-15",
            "total_guests": 8,
            "status": "Submitted"
        },
        "assignment_date": "2026-03-15",
        "start_time": "08:00",
        "end_time": "17:00",
        "guest_count": 8,
        "status": "Pending",
        "compliance_status": "Good",
        "has_certification_warning": false,
        "has_availability_conflict": false,
        "available_details": { /* availability details */ }
    }
}
```

## Validation Rules

### Pre-Assignment Validation

```php
// All must pass (AND logic)
$guide->status === 'Approved'                    // ✓ Guide approved
!$this->hasExpiredCertification($guide)          // ✓ No expired certs
!$this->hasTimeConflict($guide, $date)           // ✓ No time conflicts
!$this->isUnavailable($guide, $date)             // ✓ Available
!$this->hasComplianceIssue($guide)               // ✓ Not flagged
!$this->hasComplianceIssue($guide)               // ✓ No recent flags
```

### Certification Validation

```php
// Expired: expiry_date < NOW()
// Expiring Soon: NOW() <= expiry_date <= NOW() + 30 days
// Valid: expiry_date > NOW() + 30 days
```

### Time Conflict Detection

```php
// Looks for existing active assignments on same date
GuideAssignment::where('guide_id', $guideId)
    ->where('assignment_date', $visitDate)
    ->whereIn('assignment_status', ['Pending', 'Confirmed'])
    ->exists()
```

### Availability Check

```php
// Guide marked unavailable or on leave
GuideAvailability::where('guide_id', $guideId)
    ->where('status', '!=', 'Available')
    ->whereDate('start_date', '<=', $visitDate)
    ->whereDate('end_date', '>=', $visitDate)
    ->exists()
```

## Scoring Algorithm Details

```
Base Score: 100 points

Deductions:
- 10 points per current assignment
- 15 points if certification expiring soon

Bonuses:
+ 0.5 points per year of experience
+ 5 points if completely available

Final Score = 100 + bonuses - deductions
Highest score = best match
```

Example Scoring:
```
Guide A:
  Base: 100
  - Current assignments: 1 → -10
  - Cert expiring: yes → -15
  + Experience: 8 years → +4
  + Available: yes → +5
  = 84 points

Guide B:
  Base: 100
  - Current assignments: 0 → 0
  - Cert expiring: no → 0
  + Experience: 5 years → +2.5
  + Available: yes → +5
  = 107.5 points ← SELECTED

Guide C:
  Base: 100
  - Current assignments: 2 → -20
  - Cert expiring: yes → -15
  + Experience: 12 years → +6
  + Available: yes → +5
  = 76 points
```

## Error Codes & Messages

| Error | HTTP Code | Meaning |
|-------|-----------|---------|
| `"Guide is not eligible..."` | 400 | Validation failed, likely expired cert or conflict |
| `"No eligible guides available..."` | 404 | No guides pass all validation checks |
| `"Failed to assign guide..."` | 400 | System error during assignment |
| `"Failed to confirm assignment..."` | 400 | Assignment already confirmed or deleted |
| `"Guide not found..."` | 404 | Guide ID doesn't exist |
| `"Guest list not found..."` | 404 | Guest list ID doesn't exist |

## Performance Considerations

### Indexes
- `guide_id, assignment_date` - For conflict detection
- `guest_list_id` - For assignment lookup
- `assignment_status` - For filtering
- `compliance_status` - For alert generation

### Query Optimization
- Eager loading: `with(['certifications', 'availabilities'])`
- Indexes ensure O(log n) lookups
- Batch operations for bulk updates

### Scalability
- System handles 1000s of guides
- Direct DB queries vs. ORM loops
- Efficient scoping for filtering

## Deployment Checklist

- [ ] Run migration: `php artisan migrate`
- [ ] Clear cache: `php artisan cache:clear`
- [ ] Test eligible guides endpoint
- [ ] Test manual assignment
- [ ] Test auto-assign
- [ ] Verify notifications send
- [ ] Test all validation rules
- [ ] Test both status transitions
- [ ] Verify alert generation

## Related Features

- **Guide Management**: See `GUIDE_MANAGEMENT_DOCUMENTATION.md`
- **Operator Alerts**: See `OPERATOR_ALERTS_DOCUMENTATION.md`
- **Guest Lists**: Guest submission & management system
- **Notifications**: Email/database notifications to guides

---

**Implementation Date**: March 3, 2026  
**Version**: 5.3  
**Status**: ✅ Complete & Live
