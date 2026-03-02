# Guide Management System Documentation

## Overview

The Guide Management System enables guides to register for the platform and allows administrators to review, approve, or reject applications. The system includes:

- **Guide Registration Form** - Public form for guides to register with personal, professional, and certification details
- **Admin Dashboard** - Complete guide management interface with filtering, searching, and approval/rejection workflow
- **Certification Tracking** - Automatic tracking of certificate expiry dates with warnings
- **Email Notifications** - Optional notifications for approval/rejection status

## Features

### 1. Guide Registration Form (`/guides/register`)

**Fields:**
- **Personal Details:**
  - Full Name (required)
  - Email (required, unique)
  - Contact Number (required)
  - ID Type (National ID, Passport, Driver's License, Other)
  - ID Number (required, unique)
  - ID Image (optional upload)

- **Professional Details:**
  - Years of Experience (0-70)
  - Specialty Areas (checkbox selection - at least one required)
    - Hiking, Cultural Tours, Marine Activities, Mountain Climbing, Water Sports, Historical Sites, Wildlife Safari, Adventure Sports, Food & Wine, Photography Tours

- **Certifications & Trainings (optional, can add multiple):**
  - Certification Name
  - Issued By
  - Issued Date
  - Expiry Date (optional)
  - Certificate File Upload (PDF, JPG, PNG)

**Default Status:** Pending

### 2. Admin Guide Management Dashboard (`/guides`)

**Views:**
- Table view with all guides
- Summary cards showing: Total, Pending, Approved, Rejected counts
- Search functionality (by name, email, phone)
- Filter by status (All, Pending, Approved, Rejected)
- Export to CSV

**Actions per Guide:**
- **View Details** - Open full guide profile
- **Approve** - Mark as approved (status changes to Approved)
- **Reject** - Reject with reason (status changes to Rejected + stores reason)

**Visual Indicators:**
- Certification expiry warnings (icon badges on table)
- Status color-coding
- Relative timestamps

### 3. Guide Detail View (`/guides/{id}`)

**Shows:**
- Personal information with ID verification
- Professional background
- All certifications with:
  - Status (Valid, Expiring Soon, Expired)
  - Days until expiry
  - File download links
- Review information (reviewed by, date)
- Rejection reason (if applicable)

**Admin Actions:**
- Approve button (if Pending)
- Reject button with modal (if Pending)

### 4. Certification Management

**Tracking:**
- Valid: No expiry or future expiry date
- Expiring Soon: Expires within 30 days
- Expired: Past expiry date

**Warnings:**
- 🔔 Icon on guide list if expiring soon
- ⚠️ Icon on guide list if expired
- Color-coded status badges

## Database Schema

### guides table
```
- id (primary key)
- full_name (string)
- email (unique email)
- contact_number (string)
- id_type (National ID, Passport, Driver's License, Other)
- id_number (unique string)
- id_image_path (nullable string)
- years_of_experience (integer)
- specialty_areas (JSON array)
- status (Pending, Approved, Rejected)
- rejection_reason (nullable text)
- reviewed_by (foreign key to users, nullable)
- reviewed_at (timestamp, nullable)
- created_at, updated_at (timestamps)
```

### guide_certifications table
```
- id (primary key)
- guide_id (foreign key)
- certification_name (string)
- issued_by (string)
- issued_date (date)
- expiry_date (nullable date)
- certificate_file_path (string)
- status (Valid, Expiring Soon, Expired)
- created_at, updated_at (timestamps)
```

## Setup Instructions

### 1. Run Migrations

```bash
php artisan migrate
```

This creates the `guides` and `guide_certifications` tables.

### 2. File Storage

Create storage directories for uploads:
```bash
mkdir -p storage/app/public/guides/id-images
mkdir -p storage/app/public/guides/certifications
chmod -R 755 storage/app/public/guides
```

Link storage to public:
```bash
php artisan storage:link
```

### 3. Update Navigation

The "Guide Management" link is already added to the admin sidebar in `app-sidebar.tsx`.

## API Routes

### Public Routes
```
GET  /guides/register                    - Show registration form
POST /guides/register                    - Submit registration
GET  /guides/registration-success/{id}   - Success page
```

### Admin Routes (requires auth)
```
GET  /guides                             - List all guides with filters
GET  /guides/{guide}                     - View guide details
POST /guides/{guide}/approve             - Approve guide
POST /guides/{guide}/reject              - Reject guide with reason
GET  /guides/export/csv                  - Export guides to CSV
```

## Controllers

### GuideController
- `create()` - Show registration form
- `store()` - Process registration (validates, stores guide & certifications)
- `registrationSuccess()` - Show success message
- `show()` - Display guide details (public endpoint)

### GuideManagementController (Admin)
- `index()` - List guides with filters/search
- `show()` - View full guide profile
- `approve()` - Approve pending guide
- `reject()` - Reject with reason
- `export()` - Export CSV

## Models

### Guide
```php
// Relationships
- certifications() -> HasMany
- reviewer() -> BelongsTo User

// Scopes
- pending() -> Where status = Pending
- approved() -> Where status = Approved
- rejected() -> Where status = Rejected
- orderByPriority() -> Order by status, date

// Methods
- approve(User $admin) -> Update status to Approved
- reject(User $admin, string $reason) -> Update status to Rejected
- hasExpiringCertifications() -> Check certificates expiring in 30 days
- hasExpiredCertifications() -> Check expired certificates
- expiringCertifications() -> Get expiring certificates
```

### GuideCertification
```php
// Relationships
- guide() -> BelongsTo Guide

// Methods
- isExpired() -> Boolean
- isExpiringSOon() -> Boolean
- daysUntilExpiry() -> Integer | null
```

## Policies

### OperatorAlertPolicy
Ensures:
- Users can only view their own alerts
- Users can only update/delete their own alerts
- Guides are currently not restricted (can be modified)

## File Upload Handling

**Supported Formats:**
- ID Image: JPG, JPEG, PNG (max 5MB)
- Certificates: PDF, JPG, JPEG, PNG (max 5MB)

**Storage Path:**
- ID Images: `storage/app/public/guides/id-images/{filename}`
- Certificates: `storage/app/public/guides/certifications/{filename}`

## Email Notifications (Optional)

To implement email notifications for approval/rejection:

1. Create mailable classes:
```bash
php artisan make:mail GuideApprovedMail
php artisan make:mail GuideRejectedMail
```

2. Send in controller:
```php
// In GuideManagementController approve() method
Mail::to($guide->email)->send(new GuideApprovedMail($guide));

// In reject() method
Mail::to($guide->email)->send(new GuideRejectedMail($guide, $reason));
```

## UI Components

### Guide Registration Form
- Multi-step form with sections
- File upload dropzones
- Checkbox specialty selection
- Dynamic certification addition/removal
- Form validation with error messages
- Comprehensive error handling

### Admin Dashboard
- Summary statistics cards
- Advanced filtering (status, search)
- Responsive table with actions
- Pagination controls
- Certification warning indicators
- Export functionality

### Guide Details Page
- Sidebar with review status
- Approval/Rejection actions modal
- Certificate viewer with download links
- Expiry date warnings
- Professional and personal information display

## Customization

### Adding New Specialty Areas

Edit `GuideController::create()`:
```php
'specialtyOptions' => [
    'Hiking',
    'Your New Specialty',
    // ...
],
```

### Changing Certification Expiry Warning Period

In `GuideCertification::isExpiringSOon()`:
```php
if ($this->expiry_date->diffInDays(now()) <= 60) { // Change 30 to desired days
    return 'Expiring Soon';
}
```

### Modifying Status Workflow

Add new statuses in migrations:
```php
$table->enum('status', ['Pending', 'Approved', 'Rejected', 'Suspended'])->default('Pending');
```

## Troubleshooting

**Issue:** File uploads not working
- **Solution:** Run `php artisan storage:link` and ensure storage/app/public directory exists

**Issue:** Certification status not updating
- **Solution:** Check that expiry date is properly set and database migration ran successfully

**Issue:** CSV export not working
- **Solution:** Ensure PHP has write permissions to temporary files directory

## Future Enhancements

1. **Background Jobs:**
   - Automatic certificate expiry status updates
   - Bulk email notifications for expiring certificates

2. **Guide Assignments:**
   - Link guides to tourist bookings
   - Track guide utilization

3. **Rating & Reviews:**
   - Tourist reviews of guides
   - Guide performance metrics

4. **Availability Calendar:**
   - Guides set their availability
   - Integration with booking system

5. **Training Programs:**
   - Admin create training programs
   - Track guide training completion

## API Documentation

### Guide Registration Endpoint

## Guide Availability

Admins can manage guide availability which is used by assignment workflows. Key fields include:

- **guide_id** (foreign key)
- **start_date** / **end_date** (date-time range)
- **full_day** (boolean)
- **status** (Available / Unavailable / On Leave)
- **notes** (optional)

System logic prevents overlapping entries for the same guide and highlights conflicts when assignments are made. The availability data is stored in the `guide_availabilities` table.

**Endpoints:**

```php
// list with filters
GET /guides/availability?guide_id=&status=&date=

// create
POST /guides/availability

// update
PUT /guides/availability/{availability}

// delete
DELETE /guides/availability/{availability}
```

---

### Guide Registration Endpoint

**POST /guides/register**

Request:
```json
{
  "full_name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "contact_number": "+63 9123456789",
  "id_type": "National ID",
  "id_number": "1234567890",
  "years_of_experience": 5,
  "specialty_areas": ["Hiking", "Mountain Climbing"],
  "certifications": [
    {
      "certification_name": "First Aid",
      "issued_by": "Red Cross",
      "issued_date": "2023-01-15",
      "expiry_date": "2026-01-15"
    }
  ]
}
```

Response (Success):
```json
{
  "message": "Guide registration submitted successfully!"
}
```

Response (Error - 422):
```json
{
  "errors": {
    "email": ["The email field is required."],
    "specialty_areas": ["The specialty areas field is required."]
  }
}
```

---

For detailed implementation questions or customization needs, please refer to the controller and model files.
