# Admin Dashboard Implementation Guide

## Overview

A comprehensive admin dashboard has been implemented for the "She Said Pretty" reservation management system. The admin area includes authentication, reservation management, dashboard statistics, and real-time data updates.

## Accessing the Admin Dashboard

### URL
Navigate to: `http://localhost:5173/admin`

### Login Credentials (Demo)
- **Username:** `admin`
- **Password:** `admin123`

The authentication is stored in `localStorage`, so you'll remain logged in until you click "Logout".

## Files Created

### Components (`src/components/`)
1. **AdminLayout.jsx** - Main sidebar layout component with navigation
2. **AdminAuthLogin.jsx** - Authentication login form
3. **AdminStats.jsx** - Statistics cards component showing key metrics
4. **AdminDashboardContent.jsx** - Main dashboard page with overview
5. **AdminReservations.jsx** - Reservations management page
6. **ReservationTable.jsx** - Reusable table component for displaying reservations
7. **ReservationDetailsModal.jsx** - Modal for viewing/editing reservation details

### Styles (`src/styles/`)
- **admin.css** - Complete admin dashboard styling (900+ lines)

### Pages (`src/pages/`)
- **AdminDashboard.jsx** - Updated to integrate all admin components with authentication

### Services (`src/services/`)
- **reservationService.js** - Enhanced with admin-specific queries and functions

### Data (`src/data/`)
- **mockReservations.js** - Updated to include `admin_notes` field

### Config (`src/main.jsx`)
- Updated to import admin.css

## Features

### 1. Authentication
- Login page with demo credentials (admin/admin123)
- localStorage-based session persistence
- Logout functionality
- Redirects unauthenticated users to login

### 2. Dashboard
Located at `/admin` after login

**Key Metrics:**
- Today's reservations count
- Pending reservations count
- Confirmed reservations count
- Cancelled reservations count

**Dashboard Cards:**
- Today's Reservations - Shows all non-cancelled reservations for today, sorted by time
- Recent Reservations - Shows the 5 most recently created reservations

**Auto-Refresh:** Dashboard data refreshes every 30 seconds

### 3. Reservations Management
`/admin` → Click "Reservations" in sidebar

**Features:**
- View all reservations in a sortable, filterable table
- Search by customer name, social media handle, or reservation ID
- Filter by reservation status (All, Pending, Confirmed, Completed, Cancelled)
- Filter by specific date using date picker
- Sort by:
  - Reservation date (newest/oldest)
  - Created date (newest/oldest)
  - Customer name (A-Z, Z-A)
- Responsive table showing:
  - Customer name
  - Social media handle
  - Reservation date
  - Reservation time
  - Duration
  - Status badge with color coding
  - Creation timestamp

### 4. Reservation Details Modal
Click on any reservation to open the details modal

**Capabilities:**
- View complete reservation information:
  - Customer name
  - Social media handle
  - Reservation date and time
  - Duration
  - Reservation ID
  - Creation date/time
- Change reservation status:
  - Pending
  - Confirmed
  - Completed
  - Cancelled
- Add/edit admin notes (internal notes only visible to admin)
- Save changes with validation
- Confirmation messages for successful updates

### 5. Sidebar Navigation
- Dashboard
- Reservations
- Customers (placeholder - expandable)
- Settings (placeholder - expandable)
- Logout button

## Data Model

### Reservation Object
```javascript
{
  id: string,                    // Unique identifier
  customer_name: string,         // Full name or business name
  social_media_name: string,     // @handle or social media identifier
  reservation_date: string,      // YYYY-MM-DD format
  reservation_time: string,      // e.g., "2:00 PM"
  duration_minutes: number,      // Service duration (typically 120)
  status: string,                // pending | confirmed | completed | cancelled
  created_at: ISO8601,          // Timestamp when reservation was created
  admin_notes: string,           // Internal admin notes (optional)
}
```

### Reservation Statuses
- **Pending** - Awaiting admin confirmation
- **Confirmed** - Confirmed appointment
- **Completed** - Service has been completed
- **Cancelled** - Reservation was cancelled

## API Functions

### In `reservationService.js`

**Query Functions:**
```javascript
getReservations()                    // Get all reservations
getReservationById(id)              // Get specific reservation
getReservationsByDate(date)         // Get reservations for a date
getReservationsByStatus(status)     // Get reservations by status
getReservationsSince(date)          // Get reservations created since date
getTodayReservations()              // Get today's reservations
getUpcomingReservations()           // Get upcoming reservations
```

**Mutation Functions:**
```javascript
createReservation(details)          // Create new reservation
updateReservation(id, updates)      // Update reservation
cancelReservation(id)               // Cancel a reservation
```

**Admin Functions:**
```javascript
getReservationStats()               // Get dashboard statistics
```

## Authentication & Security

### Current Implementation
- Simple login system with localStorage
- Demo credentials: admin/admin123
- Frontend-only authentication (suitable for development/demo)

### For Production
When moving to a real backend:

1. **Backend Authentication:**
   - Implement secure token-based auth (JWT)
   - Validate credentials on server
   - Use HTTPS only
   - Add password hashing (bcrypt)
   - Implement session timeouts

2. **Frontend:**
   - Store JWT token in secure httpOnly cookie
   - Implement token refresh mechanism
   - Add proper error handling for auth failures
   - Implement proper logout (clear tokens)

3. **Admin Authorization:**
   ```javascript
   // Route protection example
   const AdminRoute = ({ children }) => {
     const token = localStorage.getItem('auth_token')
     if (!token) return <Navigate to="/admin/login" />
     return children
   }
   ```

## Styling

### Theme Integration
All admin styles follow the existing "She Said Pretty" design system:
- Uses CSS variables from `global.css`
- Color scheme: Dark theme with accent colors
- Fonts: DM Sans (sans-serif) and Playfair Display (serif)
- Spacing: 8px base unit
- Breakpoints: Mobile (500px), Tablet (768px), Desktop (1200px)

### Responsive Design
- **Desktop:** Full sidebar + content layout (260px + 1fr)
- **Tablet:** Adjusted grid layouts and spacing
- **Mobile:** Horizontal navigation bar, optimized table views

## How Reservations Flow

### Customer to Admin
1. Customer books appointment on main website (`/`)
2. Creates new reservation via `ClientBooking.jsx`
3. Calls `reservationService.createReservation()`
4. Reservation stored in memory with `status: 'pending'`
5. Admin logs into `/admin` dashboard
6. Immediately sees new reservation in "Recent Reservations" card
7. Can filter to view pending reservations
8. Admin updates status to "confirmed"
9. Reservation updated immediately (frontend) via `updateReservation()`

### Data Persistence
Currently using in-memory storage (resets on page refresh). For production:
- Use backend API with database persistence
- Implement WebSockets or Server-Sent Events for real-time updates
- Otherwise, implement polling/manual refresh

## Testing the Admin Dashboard

### Step-by-step Guide

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to admin:**
   - Open `http://localhost:5173/admin`
   - You should see the login page

3. **Login:**
   - Username: `admin`
   - Password: `admin123`
   - Click "Login"

4. **Explore Dashboard:**
   - See statistics cards
   - View today's and recent reservations
   - Auto-refresh every 30 seconds

5. **Test Reservations Page:**
   - Click "Reservations" in sidebar
   - Use search box to find reservations
   - Apply filters by status or date
   - Sort reservations different ways
   - Click on a reservation to open details modal

6. **Test Reservation Update:**
   - In details modal, change the status dropdown
   - Add admin notes
   - Click "Save Changes"
   - See success message
   - Verify changes persisted on reservations table

7. **Test Creating New Reservation:**
   - Open main site: `http://localhost:5173/`
   - Create a new reservation
   - Go back to admin dashboard
   - New reservation appears in "Recent Reservations"
   - Can open and manage it

8. **Test Logout:**
   - Click logout button in sidebar
   - Redirected to login page
   - localStorage cleared

## Future Enhancements

### Phase 2
- [ ] Customers page - View customer profiles, contact history
- [ ] Settings page - Business hours, service types, pricing
- [ ] Ability to create reservations from admin interface
- [ ] Appointment reminders (SMS/email)
- [ ] Customer notes and preferences

### Phase 3
- [ ] Export reservations (CSV, PDF)
- [ ] Revenue analytics and reporting
- [ ] Multi-day/recurring appointments
- [ ] Resource/staff scheduling
- [ ] Waitlist management
- [ ] Admin audit logs

### Phase 4
- [ ] Real backend API (Node.js/Express or similar)
- [ ] Database (PostgreSQL/MongoDB)
- [ ] Proper authentication (JWT)
- [ ] API rate limiting and validation
- [ ] Email/SMS notifications
- [ ] Google Calendar integration
- [ ] Payment processing integration

## Troubleshooting

### Admin page shows blank/white screen
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh the page
- Ensure you're logged in

### Changes not persisting
- Check browser console for errors
- Reload page to see if changes were saved
- In production, check backend API calls

### Reservations not showing in admin
- Ensure customer created reservation on main site
- Check that reservation date is correct
- Filter by "All Statuses" if filtering by specific status
- Data is in-memory, so reloading page will reset demo data

### Login not working
- Use exact credentials: `admin` / `admin123`
- Check that localStorage is enabled
- Try clearing browser cache

## File Structure Summary

```
src/
├── components/
│   ├── AdminLayout.jsx              # Main admin layout
│   ├── AdminAuthLogin.jsx           # Login form
│   ├── AdminDashboardContent.jsx    # Dashboard page
│   ├── AdminReservations.jsx        # Reservations page
│   ├── AdminStats.jsx               # Stats cards
│   ├── ReservationTable.jsx         # Table component
│   └── ReservationDetailsModal.jsx  # Details modal
├── pages/
│   └── AdminDashboard.jsx           # Admin entry point
├── services/
│   └── reservationService.js        # Enhanced with admin functions
├── data/
│   └── mockReservations.js          # Updated with admin_notes
├── styles/
│   └── admin.css                    # Admin-specific styles
└── main.jsx                         # Updated with admin.css import
```

## Key Decisions

1. **In-Memory Storage:** Easy for demo, can be switched to backend API
2. **Frontend Authentication:** Suitable for development, requires backend for production
3. **localStorage Sessions:** Maintains login state across page refreshes
4. **Polling Over WebSockets:** Simpler implementation, easier to switch to SSE/WebSockets later
5. **Sidebar Navigation:** Professional dashboard UX, responsive on mobile
6. **Status Badges:** Color-coded for quick visual identification
7. **Modal for Details:** Non-disruptive editing without page navigation

## Performance Notes

- Dashboard data refreshes every 30 seconds (configurable)
- All operations are async (ready for real API integration)
- Filtering and sorting happen client-side (optimize with backend pagination in production)
- Large reservation lists (1000+) may benefit from virtualization/pagination

---

**Status:** ✅ Complete and ready for testing

**Last Updated:** 2026-08-19
