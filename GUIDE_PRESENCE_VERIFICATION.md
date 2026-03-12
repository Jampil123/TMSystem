# Guide Presence Verification System

## Overview
The **Guide Presence Verification System** ensures that every guest group entering the site has a valid assigned guide before entry is allowed. This is a critical safety requirement that prevents unauthorized guest access without proper guide supervision.

---

## System Architecture

### 1. **Verification Method: `verifyGuidePresence()`**

**Location:** `app/Http/Controllers/QRCodeArrivalController.php` (Private Method)

**Purpose:** Centralized, reusable guide verification logic

**Parameters:**
- `$guestListId` (integer): The ID of the guest list to verify

**Returns:**
- `GuideAssignment` object if guide is confirmed and valid
- `null` if no guide is assigned OR guide assignment status is not 'Confirmed'

**Verification Logic:**
```php
private function verifyGuidePresence($guestListId)
{
    $guideAssignment = GuideAssignment::where('guest_list_id', $guestListId)
        ->with('guide')
        ->first();

    // Step 1: Check if guide assignment exists
    if (!$guideAssignment) {
        return null;  // No guide assigned
    }

    // Step 2: Check if assignment is confirmed
    if ($guideAssignment->assignment_status !== 'Confirmed') {
        return null;  // Assignment not confirmed
    }

    return $guideAssignment;  // Valid guide found
}
```

---

## Verification Flow

```
┌─────────────────────────────────────────────────────┐
│  ENTRANCE STAFF SCANS QR CODE                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Step 1: Validate QR Token                          │
│  - Check token exists in guest_lists_qr_codes       │
│  - Verify not already used                          │
│  - Verify not expired                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Step 2: Retrieve Guest List                        │
│  - Get guest_list_id from QR code                   │
│  - Load guest list details                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Step 3: GUIDE PRESENCE VERIFICATION ⭐             │
│  - Check if guide assignment exists                 │
│  - Verify assignment_status = 'Confirmed'           │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
          ✅ PASSED             ❌ FAILED
               │                      │
               ▼                      ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │ ALLOW ENTRY          │  │ BLOCK ENTRY          │
    │                      │  │                      │
    │ - Create arrival log │  │ Response: 403        │
    │ - Update QR to used  │  │ Message:             │
    │ - Update guide       │  │ "Entry denied. No    │
    │   assignment status  │  │  confirmed guide     │
    │                      │  │  assigned for this   │
    │ Response: 200 ✅    │  │  guest group."       │
    │                      │  │                      │
    │                      │  │ Log: Entry denied    │
    └──────────────────────┘  └──────────────────────┘
```

---

## API Endpoints

### 1. **Process QR Code & Log Arrival**

**Endpoint:** `POST /staff/api/qr-arrival`

**Route Name:** `qr-arrival.process`

**Authentication:** Required (verified user)

**Request Body:**
```json
{
  "qr_token": "TR-BDN-2026-0008"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "✅ Arrival logged successfully!",
  "code": "SUCCESS",
  "guide_verified": true,
  "data": {
    "arrival_log_id": 42,
    "guest_list_id": 15,
    "guest_name": "John Smith",
    "guide_name": "Ahmed Hassan",
    "guide_verified": true,
    "arrival_time": "14:30:45",
    "arrival_date": "2026-03-12",
    "total_guests": 5,
    "service_name": "Mountain Hiking"
  }
}
```

**Failure Responses:**

*Guide Not Confirmed (403):*
```json
{
  "success": false,
  "message": "Entry denied. No confirmed guide assigned for this guest group.",
  "code": "GUIDE_NOT_CONFIRMED",
  "guide_verified": false
}
```

*QR Not Found (404):*
```json
{
  "success": false,
  "message": "❌ QR code not found in system",
  "code": "QR_NOT_FOUND"
}
```

*QR Already Used (422):*
```json
{
  "success": false,
  "message": "⚠️ This QR code has already been used. Duplicate entry blocked.",
  "code": "QR_ALREADY_USED"
}
```

---

### 2. **Pre-Scan Guide Verification**

**Endpoint:** `POST /staff/api/check-guide`

**Route Name:** `qr-arrival.verify-guide`

**Purpose:** Check if a guide is confirmed BEFORE scanning (optional step for entrance staff)

**Authentication:** Required (verified user)

**Request Body:**
```json
{
  "guest_list_id": 15
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "✅ Confirmed guide is assigned for this group",
  "code": "GUIDE_VERIFIED",
  "guide_present": true,
  "data": {
    "guest_list_id": 15,
    "guest_count": 5,
    "guide_name": "Ahmed Hassan",
    "guide_id": 8,
    "assignment_status": "Confirmed"
  }
}
```

**Failure Response (403):**
```json
{
  "success": false,
  "message": "Entry denied. No confirmed guide assigned for this guest group.",
  "code": "GUIDE_NOT_CONFIRMED",
  "guide_present": false
}
```

---

## Key Features

### ✅ **1. Centralized Verification Logic**
- Single method `verifyGuidePresence()` handles all guide verification
- Reusable across multiple endpoints
- Easier to maintain and update

### ✅ **2. Two-Step Guide Verification**
- **Check 1:** Guide assignment exists
- **Check 2:** Assignment status is 'Confirmed'

### ✅ **3. Entry Blocking**
- Prevents guest entry if guide not confirmed
- Returns HTTP 403 (Forbidden) status
- Clear, specific error message

### ✅ **4. Audit Logging**
```php
\Log::warning('Entry Denied - No Confirmed Guide', [
    'qr_token' => $token,
    'guest_list_id' => $guestList->id,
    'timestamp' => now(),
    'reason' => 'Guide presence verification failed',
]);
```

### ✅ **5. Data Consistency**
- Verification happens BEFORE arrival log is created
- Guarantees no arrivals without confirmed guide
- Maintains referential integrity

---

## Safety Compliance

### **Safety Requirement Met:**
✅ Each guest group entering the site has a valid assigned guide  
✅ Guide assignment status is explicitly verified as 'Confirmed'  
✅ No entry is logged without guide confirmation  
✅ All denied entries are logged for audit purposes  

### **Status Values:**
- `'Pending'` - Assignment created but not yet confirmed by guide
- `'Confirmed'` - ✅ Valid for entry (auto-set when assignment created)
- `'Completed'` - All guests have arrived and service completed
- `'Cancelled'` - Assignment was cancelled and should not allow entry

---

## Database Integrity

### **Constraints:**
- `guide_assignments.assignment_status` is an ENUM with 4 values
- Only 'Confirmed' status allows guest entry
- verification happens within a database transaction
- If verification fails, no data is modified

### **Related Tables:**
```
guest_lists_qr_codes
├── token (unique, indexed)
├── guest_list_id (foreign key)
├── status (ENUM: Active, Used, Expired)
└── expiration_date

guide_assignments
├── guest_list_id (foreign key)
├── guide_id (foreign key)
├── assignment_status (ENUM: Pending, Confirmed, Completed, Cancelled)
└── created_at

arrival_logs
├── guest_list_id (foreign key)
├── guide_id (foreign key)
├── arrival_time
├── status
└── created_at
```

---

## Error Handling

### **Verification Failure Scenarios:**

1. **No Guide Assigned**
   - Message: "Entry denied. No confirmed guide assigned for this guest group."
   - Code: `GUIDE_NOT_CONFIRMED`
   - HTTP Status: 403

2. **Guide Assignment Not Confirmed**
   - Message: "Entry denied. No confirmed guide assigned for this guest group."
   - Code: `GUIDE_NOT_CONFIRMED`
   - HTTP Status: 403

3. **QR Code Issues** (before verification)
   - Invalid token: 404
   - Already used: 422
   - Expired: 422

---

## Frontend Integration

### **Success Case:**
```javascript
if (response.success && response.guide_verified) {
  // Entry approved
  showSuccessMessage(`Guest ${response.data.guest_name} with guide ${response.data.guide_name}`);
  logArrival();
}
```

### **Failure Case:**
```javascript
if (!response.success && response.code === 'GUIDE_NOT_CONFIRMED') {
  // Entry blocked
  showErrorMessage('Entry denied. No confirmed guide assigned for this guest group.');
  blockEntry();
  playAlertSound();
}
```

---

## Testing Guide

### **Test Scenario 1: Valid Entry with Confirmed Guide**
1. Assign guide to guest list
2. Guide confirms assignment (status = 'Confirmed')
3. Scan QR code
4. ✅ Expected: Entry allowed, arrival logged

### **Test Scenario 2: Entry Denied - No Guide**
1. Create guest list without guide assignment
2. Scan QR code
3. ❌ Expected: Entry blocked with "No confirmed guide" message

### **Test Scenario 3: Entry Denied - Guide Not Confirmed**
1. Assign guide but status remains 'Pending'
2. Scan QR code
3. ❌ Expected: Entry blocked with "No confirmed guide" message

### **Test Scenario 4: Audit Log**
1. Attempt entry without confirmed guide
2. Check logs in `storage/logs/laravel.log`
3. ✅ Expected: Warning logged with entry denial details

---

## Performance Considerations

- Verification method uses indexed query on `guest_list_id`
- Eager loads guide relationships to prevent N+1 queries
- Single database query per verification
- No additional overhead on confirmed entries

---

## Future Enhancements

1. **Real-time Guide Status Dashboard**
   - Show which guides have confirmed assignments
   - Alert staff before scanning if guide not assigned

2. **Multiple Guide Support**
   - Allow multiple guides for large groups
   - Verify at least one confirmed guide is present

3. **Role-Based Access**
   - Different permissions for entrance staff vs. guides
   - Only authorized personnel can override

4. **Analytics**
   - Track entry denial rate
   - Identify guides with assignment issues
   - Generate safety compliance reports

---

## Support

For issues or questions:
- Check audit logs: `storage/logs/laravel.log`
- Verify guide assignment status in `guide_assignments` table
- Ensure QR code is active in `guest_lists_qr_codes` table
