# Guide Assignment System - Operator Usage Guide

## Quick Start

The Guide Assignment System allows you to assign qualified guides to guest lists with a single click. The system automatically validates availability, certifications, and expertise.

## Workflow Overview

```
1. Guest List Submitted
       ↓
2. Click "Assign Guide"
       ↓
3. View Eligible Guides
       ↓
4. Select Guide (Manual) OR Auto-Assign
       ↓
5. Confirm Assignment Details
       ↓
6. Assignment Created (Pending)
       ↓
7. Confirmation & Notifications Sent
       ↓
✅ Assignment Ready for Execution
```

## Step-by-Step Guide

### Step 1: View Guest List

Navigate to your guest submissions and click on a guest list that needs a guide assignment.

### Step 2: View Eligible Guides

Click the **"View Eligible Guides"** button. The system will show all guides who meet these criteria:

- ✅ Guide is Approved
- ✅ No expired certifications
- ✅ No scheduling conflicts
- ✅ Available on the tour date
- ✅ No compliance flags

**Understand the Information Displayed:**

| Field | Meaning |
|-------|---------|
| **Experience** | Years of guiding experience |
| **Specialties** | Areas of expertise (e.g., Hiking, Cultural Tours) |
| **Status** | Available/Unavailable |
| **Current Assignments** | Other tours they're already guiding |
| **Certification Status** | Expiring soon/All valid/Expired |

### Step 3: Choose Assignment Method

#### **Option A: Manual Selection** *(Recommended for specific needs)*

1. Review each eligible guide's details
2. Click on a guide card to select them
3. Click **"Confirm Assignment"** button
4. Fill in assignment details:
   - **Start Time**: When the tour begins
   - **End Time**: When the tour ends
   - **Service Type**: Type of activity (optional)
   - **Notes**: Special instructions (optional)
5. If warnings exist, read and acknowledge them
6. Click **"Assign Guide"** to confirm

#### **Option B: Auto-Assign** *(Fastest option)*

1. Click **"Auto-Assign Best Match"** button
2. System automatically:
   - Scores eligible guides
   - Selects best option based on:
     - Fewer current assignments
     - More experience
     - Better availability
     - Newer certifications
3. Confirmation message appears with selected guide

### Step 4: Confirm Assignment Details

The confirmation modal shows:

**Guide Information:**
- Full name and contact details
- Years of experience
- Specialty areas

**Assignment Details:**
- Assignment date (auto-filled from guest list)
- Start time (must be set)
- End time (must be after start time)
- Guest count (auto-filled from guest list)

**Optional Information:**
- Service type (helps for record-keeping)
- Special notes or instructions

### Step 5: Acknowledge Warnings (if any)

If the guide has any of these conditions, you'll see a warning:

🟡 **Certification Expiring Soon**
- Guide's certification expires within 30 days
- You must check the acknowledgment box to proceed
- *Recommended:* Ensure renewal is scheduled before tour date

⚠️ **Schedule Conflict**
- Minor timing overlap detected
- Verify availability with guide
- You can proceed despite this warning

### Step 6: Assignment Created

Once confirmed, the system:
1. Creates assignment record (Status: **Pending**)
2. Sends notification to guide
3. Generates alerts for any issues
4. Updates guide's schedule

## Assignment Status Management

### Status Flow

```
Pending → Confirm → Confirmed → Complete → Completed
                                    ↓
                                (Active)
    ↓ (at any time)
  Cancel → Cancelled
```

### Available Actions

**When Status = Pending:**
- ✅ **Confirm**: Locks in the assignment
- ❌ **Cancel**: Remove the assignment

**When Status = Confirmed:**
- ✅ **Complete**: Mark tour as finished
- ❌ **Cancel**: Remove if needed

**When Status = Completed:**
- View only (no changes)

**When Status = Cancelled:**
- View only (no changes)

## Understanding Warnings & Flags

### 🟢 Green (Good Status)
Everything is perfect. No concerns.

### 🟡 Yellow (Warning)
Minor concerns that don't prevent assignment:
- Certification expiring within 30 days
- Minor schedule overlap
- Multiple assignments same day

**Action**: Assignment allowed but review recommended

### 🔴 Red (Flagged)
Cannot assign because of:
- Expired certification
- Time conflict
- Marked unavailable
- Recent compliance issues

**Action**: Cannot proceed. System blocks assignment.

## Important Notes

### ✅ Guide Will Always Receive Notification

When you assign a guide, they receive:
- Email notification with assignment details
- Time, date, guest count
- Any special instructions from notes
- Warning if certification expiring

### ⚠️ Cancel Wisely

When you cancel an assignment:
- Guide gets cancellation notification
- Schedule is cleared
- Original guest list needs new guide
- You'll need to reassign

### 📋 Keep Records

Always include notes for:
- Special guest needs or dietary restrictions
- Specific tour requests
- Any concerns or preferences
- Accessibility requirements

## Common Scenarios

### Scenario 1: Urgent Assignment
*"Guests arriving in 2 days, need guide ASAP"*

Solution:
1. Click guest list
2. Click "Auto-Assign Best Match"
3. Confirm details
4. Done! ✅

### Scenario 2: Specific Guide Request
*"Guests want John because they had him before"*

Solution:
1. Click "View Eligible Guides"
2. Find John in the list
3. Check if he's eligible (green status)
4. Click John's card
5. Confirm details
6. Click "Assign Guide"

### Scenario 3: Guide Has Warning
*"Selected guide's cert expires in 15 days"*

Solution:
1. Review the warning message
2. Check if you want to proceed
3. Check "I acknowledge this warning..." if okay
4. Click "Assign Guide"
5. Consider follow-up reminder to guide about renewal

### Scenario 4: No Eligible Guides
*"Message: No eligible guides available"*

Solution:
Options:
- Wait for guide certifications to be processed
- Request guide availability updates
- Contact admin to onboard more guides
- Defer guest list to later date

## Compliance & Safety

### System Safety Checks

The system **NEVER** allows:
- ❌ Assignment of guide with expired certification
- ❌ Double-booking (same guide, same time)
- ❌ Assignment to unavailable guide
- ❌ Assignment to flagged guides

These are hard blocks - no exceptions.

### Your Responsibility

As operator, you should:
- ✅ Review all assignment warnings
- ✅ Communicate special needs to guide
- ✅ Confirm guide can handle group size
- ✅ Note any accessibility requirements
- ✅ Provide sufficient advance notice

## Troubleshooting

### "No Eligible Guides Found"
**Possible Reasons:**
- All guides have certification issues
- All guides already assigned that day
- All guides unavailable that day
- Guest list date is in the past

**Solution:**
- Check guide availability calendar
- Update guide availability if needed
- Check certification expiry dates
- Choose a different date

### "Assignment Fails After Confirmation"
**Possible Reasons:**
- Guide just got assigned by another operator
- Guide marked unavailable
- System validation error

**Solution:**
- Refresh and try again
- Select different guide
- Contact support if persists

### "Guide Didn't Receive Notification"
**Possible Reasons:**
- Guide email not configured
- Guide hasn't confirmed profile
- Email server issue

**Solution:**
- Contact guide directly
- Verify guide email address
- Contact system administrator

## Quick Tips

1. **⏰ Assign Early**: Assign guides at least 3-5 days before tour
2. **📞 Communicate**: Contact guide directly with expectations
3. **📝 Document**: Use notes field for all special requests
4. **✅ Confirm**: Always confirm start/end times match activity duration
5. **🔔 Monitor**: Check assignment status day before tour

## Getting Help

If you encounter issues:
1. Check "Assignment Details" view for complete information
2. Review warning/error messages carefully
3. Contact tour guide directly (contact info shown)
4. Reach out to system administrator

---

**System Status**: 🟢 Online and Operational  
**Last Updated**: March 3, 2026  
**Version**: 5.3 - Guide Assignment Logic
