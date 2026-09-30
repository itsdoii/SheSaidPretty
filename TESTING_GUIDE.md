# She Said Pretty - Quick Testing Guide

## Before You Start
Verify both servers are running:
- ✅ Backend: `http://localhost:5000/api/health`
- ✅ Frontend: `http://localhost:5173/`

---

## Test Case 1: Create a Reservation (Customer Flow)

### Steps:
1. Navigate to: `http://localhost:5173/`
2. Click on a date (e.g., Aug 25)
3. Select a time (e.g., 2:00 PM)
4. Enter name and social media
5. Click "BOOK RESERVATION"

### Expected Results:
✅ Confirmation page displays with booking details
✅ Confirmation message shows: "Thank you, [Name]. Your She Said Pretty appointment has been reserved."

### Verification:
- Check backend terminal for: `POST http://localhost:5000/api/reservations 201`
- Check `db.json` file to confirm reservation was saved

---

## Test Case 2: View Reservation in Admin Dashboard

### Steps:
1. Navigate to: `http://localhost:5173/admin`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. View the Dashboard

### Expected Results:
✅ Statistics cards show updated counts
✅ "Recent Reservations" shows latest bookings
✅ Your new customer appears in the table

### Example:
```
Customer Name    Social Media    Date          Time        Status
John Smith       @johnsmith      2026-08-25    2:00 PM     pending
```

---

## Test Case 3: Update Reservation Status

### Steps:
1. From Admin Dashboard, click "Reservations" in sidebar
2. Click "View details" for a reservation
3. Change the Status dropdown to "confirmed"
4. (Optional) Add admin notes
5. Click "Save Changes"

### Expected Results:
✅ Success message appears: "Reservation updated successfully"
✅ Modal closes automatically
✅ Dashboard statistics update immediately
✅ Status badge changes color (yellow → green)

### Verification:
- Refresh the page (F5)
- Status should remain "confirmed" (proves persistence)
- Check `db.json` to confirm status was saved

---

## Test Case 4: Search & Filter Reservations

### Steps:
1. Go to Admin Dashboard → Reservations page
2. In "Search" box, type a customer name
3. Try the "Status" dropdown filter
4. Use the "Sort by" dropdown for different orders

### Expected Results:
✅ Table updates in real-time as you type
✅ Results counter shows filtered count
✅ Sorting changes order of reservations

---

## Test Case 5: Verify Availability Checking

### Steps:
1. Create a booking at a specific time (e.g., Aug 20, 2:00 PM)
2. Try to book the same time again
3. The time slot should show as "BOOKED"

### Expected Results:
✅ Second booking attempt shows error
✅ Time slot is disabled for selection
✅ Error message: "That appointment time is no longer available."

---

## Test Case 6: Verify Data Persistence

### Steps:
1. Create a new reservation
2. Refresh the page (F5)
3. Check Admin Dashboard

### Expected Results:
✅ New reservation still appears
✅ Status changes persist
✅ Admin notes are saved

---

## API Testing (Advanced)

### Test the API directly with curl commands:

#### Get all reservations:
```bash
curl http://localhost:5000/api/reservations
```

#### Create a new reservation:
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_name\": \"Test User\",
    \"social_media_name\": \"@testuser\",
    \"reservation_date\": \"2026-08-25\",
    \"reservation_time\": \"3:00 PM\",
    \"duration_minutes\": 120
  }"
```

#### Update a reservation status:
```bash
curl -X PUT http://localhost:5000/api/reservations/local-123 \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"confirmed\",
    \"admin_notes\": \"VIP client\"
  }"
```

---

## Troubleshooting Checklist

### ❌ "Cannot connect to backend"
- [ ] Is `node server.js` running?
- [ ] Is it running on port 5000?
- [ ] Are there any error messages in the terminal?

### ❌ "404 Not Found" when creating reservation
- [ ] Backend server must be running
- [ ] Check backend terminal for error messages
- [ ] Verify all required fields are filled

### ❌ Reservation not showing in admin
- [ ] Refresh the admin dashboard (F5)
- [ ] Check backend server is running
- [ ] Check browser console (F12 → Console tab) for errors

### ❌ Modal won't open when clicking "View details"
- [ ] Reload admin page (F5)
- [ ] Check browser console for JavaScript errors
- [ ] Try a different reservation

### ❌ Status update not saving
- [ ] Verify backend server is still running
- [ ] Check browser console for error messages
- [ ] Verify the new status is one of: pending, confirmed, completed, cancelled

---

## Performance Notes

- Dashboard automatically refreshes every 30 seconds
- Search/filter is instant (client-side)
- API calls are typically <100ms
- Database grows over time (db.json file)

---

## Emergency Reset

If you need to start fresh:

1. **Stop all servers** (Ctrl+C in both terminals)
2. **Delete the database**:
   ```bash
   del d:\SheSaidPretty\db.json
   ```
3. **Restart the backend**:
   ```bash
   node server.js
   ```
   - This will automatically create a fresh `db.json` with initial mock data

---

## Success Checklist

Run through all test cases and verify:

- [ ] Test 1: Customer can create a reservation
- [ ] Test 2: Reservation appears in admin dashboard
- [ ] Test 3: Admin can update reservation status
- [ ] Test 4: Search and filter work correctly
- [ ] Test 5: Availability checking prevents double-booking
- [ ] Test 6: Data persists after page refresh
- [ ] All statistics are correct and update in real-time

**If all checkboxes pass: ✅ SYSTEM IS WORKING CORRECTLY**

---

## Still Having Issues?

Check these in order:
1. Browser console (F12 → Console tab) for error messages
2. Backend terminal for API errors
3. Verify `db.json` file exists and is readable
4. Check that both ports (5000, 5173) are not in use by other applications
5. Try restarting both servers

