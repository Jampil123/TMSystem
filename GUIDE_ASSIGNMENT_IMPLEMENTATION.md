# Guide Assignment Logic - 5.3 Implementation

## Overview
The Guide Assignment Logic (5.3) is a comprehensive system for assigning qualified guides to guest lists based on availability, certifications, expertise, and compliance status. This implementation follows a structured workflow with multiple safety checks to ensure guest safety and guide compliance.

## System Architecture

### Database Tables

#### 1. **guide_assignments** Table
Stores all guide assignments with comprehensive tracking:
- `id` - Primary key
- `guest_list_id` - Foreign key to guest_lists
- `guide_id` - Foreign key to guides
- `assignment_date` - Date of the assignment
- `start_time` - Start time of the tour
- `end_time` - End time of the tour
- `guest_count` - Number of guests
- `assignment_status` - Pending | Confirmed | Completed | Cancelled
- `service_type` - Type of service (e.g., Hiking, Cultural Tour)
- `compliance_status` - Good | Warning | Flagged
- `has_certification_warning` - Boolean flag for expiring certs
- `has_availability_conflict` - Boolean flag for scheduling conflicts
- `assigned_by` - Foreign key to the admin who made the assignment
- `assigned_at` - Timestamp of assignment

### Models

#### **GuideAssignment Model** (`app/Models/GuideAssignment.php`)
- Relationships: `guestList()`, `guide()`, `assignedBy()`
- Scopes: `pending()`, `confirmed()`, `active()`, `flagged()`
- Methods:
  - `isValid()` - Validates assignment integrity
  - `confirm()` - Confirms a pending assignment
  - `complete()` - Marks assignment as completed
  - `cancel()` - Cancels an assignment

### Services

#### **GuideAssignmentService** (`app/Services/GuideAssignmentService.php`)
Core service handling all assignment logic:

**Key Methods:**

1. **`getEligibleGuides(GuestList $guestList, array $filters = []): Collection`**
   - Returns all guides eligible for assignment
   - Applies all filtering rules

2. **`assignGuide(GuestList $guestList, Guide $guide, array $data, $assignedBy): GuideAssignment`**
   - Manual assignment of a guide
   - Validates before assignment
   - Generates alerts if needed
   - Sends notifications to guide

3. **`autoAssignGuide(GuestList $guestList, array $filters = [], $assignedBy): ?GuideAssignment`**
   - Automatically selects best guide based on scoring
   - Uses scoring algorithm for selection

4. **`getGuideAvailabilityDetails(Guide $guide, ?string $date = null): array`**
   - Returns detailed availability information
   - Shows certification status
   - Lists current assignments

## Workflow Steps

### ✅ Step 1: Trigger Event
Assignment logic runs when:
- Guest list is submitted
- Activity date is confirmed  
- Operator clicks "Assign Guide"

### 🔍 Step 2: System Filters Eligible Guides

The system checks four critical criteria:

#### 1️⃣ **Availability Check**
```php
private function isUnavailable(Guide $guide, Carbon|string $visitDate): bool
```
- Guide must be marked as "Available"
- No overlapping assignments
- Not on leave

#### 2️⃣ **Certification Check**
```php
private function hasExpiredCertification(Guide $guide): bool
private function hasCertification(Guide $guide, string $certificationName): bool
```
- Guide must have required certification
- **Certification must NOT be expired**
- If certification expiring soon (≤30 days): adds to warnings

#### 3️⃣ **Expertise Match**
```php
private function matchesSpecialty(Guide $guide, string $serviceType): bool
```
- Guide specialization matches service type
- Examples:
  - Canyoneering → trained canyoneering guide
  - Cultural tour → local heritage guide

#### 4️⃣ **Capacity Rule**
```php
// Currently: 1 guide per guest list
// Can be modified for different policies
```
- System validates guide capacity
- Prevents overloading

### 🌪️ Critical Safety Rule
**NEVER assign a guide if:**
- ❌ Certification expired
- ❌ Already assigned at same time (time conflict)
- ❌ Marked unavailable
- ❌ Compliance status = Flagged

```php
private function isGuideEligible(Guide $guide, GuestList $guestList, array $filters): bool
{
    // Step-by-step safety checks
    if ($guide->status !== 'Approved') return false;
    if ($this->hasExpiredCertification($guide)) return false;
    if ($this->hasTimeConflict($guide, $guestList->visit_date)) return false;
    if ($this->isUnavailable($guide, $guestList->visit_date)) return false;
    if ($this->hasComplianceIssue($guide)) return false;
    // ... additional checks
    return true;
}
```

### 3️⃣ Step 3: Guide Selection Logic

#### **Option A: Manual Selection**
Operator sees filtered list and chooses a guide:
```php
public function assignGuide(
    GuestList $guestList,
    Guide $guide,
    array $data,
    $assignedBy = null
): GuideAssignment
```

#### **Option B: Auto-Assignment**
System selects guide based on scoring:
```php
public function autoAssignGuide(
    GuestList $guestList,
    array $filters = [],
    $assignedBy = null
): ?GuideAssignment
```

**Scoring Algorithm:**
- Base score: 100
- Minus 10 points per current assignment
- Minus 15 points if cert expiring soon
- Plus 0.5 points per year of experience
- Plus 5 points if completely available

Higher score = better choice

### 4️⃣ Step 4: Assignment Confirmation

Creates assignment record with status updates:
```php
GuideAssignment::create([
    'guest_list_id' => $guestList->id,
    'guide_id' => $guide->id,
    'assignment_date' => $guestList->visit_date,
    'start_time' => $data['start_time'],
    'end_time' => $data['end_time'],
    'guest_count' => $guestList->total_guests,
    'assignment_status' => 'Pending',
    'assigned_by' => $assignedBy?->id,
    'assigned_at' => now(),
    'compliance_status' => $complianceStatus, // Good | Warning | Flagged
]);
```

**Status Transitions:**
- Created as: `Pending` → Requires confirmation
- Operator confirms: `Confirmed` → Ready for execution
- After tour: `Completed` → Archived
- If needed: `Cancelled` → Removed

### 5️⃣ Step 5: Generate Alerts

System triggers notifications:

**Operator Alert** (if conflict found):
```php
OperatorAlert::create([
    'operator_id' => $guestList->operator_id,
    'alert_type' => 'Assignment Warning',
    'subject' => "Assignment Alert: {$guide->full_name}",
    'message' => implode(', ', $alerts),
    'reference_type' => 'GuideAssignment',
    'reference_id' => $assignment->id,
]);
```

**Guide Notification**:
```php
$guide->notify(new GuideAssignedNotification($assignment, $guestList));
```

**Compliance Warning**:
- If certification expiring: `⚠️ Certification expiring soon`
- If schedule conflict: `⚠️ Potential schedule conflict`

## API Endpoints

### Get Eligible Guides
```
GET /guest-lists/{guestList}/eligible-guides?service_type=hiking
```
Returns list of filtered guides with availability details

### Assign Guide (Manual)
```
POST /guest-lists/{guestList}/assign-guide
Body: {
    guide_id: 123,
    start_time: "08:00",
    end_time: "17:00",
    service_type: "Hiking",
    notes: "Optional notes"
}
```

### Auto-Assign Guide
```
POST /guest-lists/{guestList}/auto-assign-guide
Body: {
    service_type: "Hiking",
    required_certification: "Rock Climbing"
}
```

### Confirm Assignment
```
POST /guide-assignments/{assignment}/confirm
```

### Complete Assignment
```
POST /guide-assignments/{assignment}/complete
```

### Cancel Assignment
```
POST /guide-assignments/{assignment}/cancel
Body: { reason: "Optional cancellation reason" }
```

### Get Assignment Details
```
GET /guide-assignments/{assignment}
```

## React Components

### 1. **EligibleGuides Component**
Displays filtered list of eligible guides:
- Shows guide details, experience, specializations
- Displays certification status (expired/expiring)
- Shows current assignments
- Filter by warnings
- Auto-assign button

### 2. **AssignmentConfirmModal Component**
Modal for confirming assignment:
- Guide information display
- Time input fields
- Notes field
- Warning acknowledgment checkbox
- Submit/Cancel buttons

### 3. **AssignmentStatus Component**
Displays current assignment status:
- Guide and assignment details
- Status badges (Pending/Confirmed/Completed)
- Compliance status indicator
- Action buttons (Confirm/Complete/Cancel)
- Warning alerts

## Controller Methods

All methods in `GuideController`:

1. **`getEligibleGuides(Request $request, GuestList $guestList)`**
   - Filters and returns eligible guides

2. **`assignGuide(Request $request, GuestList $guestList)`**
   - Manual assignment endpoint

3. **`autoAssignGuide(Request $request, GuestList $guestList)`**
   - Automatic assignment endpoint

4. **`confirmAssignment(GuideAssignment $assignment)`**
   - Confirms pending assignment

5. **`completeAssignment(GuideAssignment $assignment)`**
   - Marks assignment as completed

6. **`cancelAssignment(GuideAssignment $assignment, Request $request)`**
   - Cancels assignment with optional reason

7. **`getAssignmentDetails(GuideAssignment $assignment)`**
   - Returns assignment details with warnings

## Error Handling & Validation

### Pre-Assignment Validation
```php
if (!$this->isGuideEligible($guide, $guestList, [])) {
    throw new \Exception('Guide is not eligible for assignment due to conflicts or compliance issues.');
}
```

### Validation Checks
- Expired certifications
- Time conflicts
- Unavailability
- Compliance flags
- Required certifications

### Warning Generation
- Certification expiring soon
- Schedule conflicts
- Compliance concerns

## Security & Compliance

### Safety Rules (NEVER ASSIGN IF)
1. ❌ Certification expired
2. ❌ Already assigned at same time
3. ❌ Marked unavailable
4. ❌ Compliance status = Flagged

### Validation Points
- Each assignment checked against 4+ criteria
- Warnings generated for compliance issues
- Admin must acknowledge warnings
- All actions logged with timestamps and user IDs

## Testing & Verification

Test scenarios:
1. Assign guide with valid certifications
2. Prevent assignment of guide with expired cert
3. Prevent time conflicts
4. Allow assignment with expiring cert (with warning)
5. Auto-assign and verify scoring
6. Cancel and confirm transitions
7. Notification delivery

## Future Enhancements

Possible improvements:
1. Group assignments (multiple guides per large group)
2. Capacity-based routing (1 guide per X guests)
3. Dynamic pricing based on guide expertise
4. Guide performance ratings integration
5. Advance booking with guide preferences
6. Automated guide swapping for conflicts
7. Multi-language and regional certifications

## Final Result ✅

After successful execution:
- ✅ Guide officially assigned
- ✅ Schedule updated
- ✅ Compliance verified
- ✅ Alerts generated (if needed)
- ✅ Operator sees status = Confirmed
- ✅ Guide receives notification
- ✅ Assignment ready for execution
