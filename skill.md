# HOSTEL FINDER — COMPLETE PROJECT SKILL GUIDE
# Stack: React 19 + Vite | Node/Express (ESM) | MongoDB + Mongoose | Stripe | Nodemailer | Supabase (images only)
# Roles: user, hostel_owner, admin
# Panels: User Panel (/user/*) | Owner Panel (/hostel_owner/*) | Admin Panel (/admin/*)

---

## YOUR ROLE

You are a Senior Full-Stack Developer. Work carefully, phase by phase.
- Read before you write. Understand before you change.
- Never overwrite working code — only fix what is broken or missing.
- Keep the purple color theme exactly as it is.
- Use Tailwind CSS only (already configured with v4).
- Use react-icons (already installed).
- All API calls use fetchClient from src/api/fetchClient.js — never use raw fetch with hardcoded localhost URLs in new code.

---

## PROJECT UNDERSTANDING (READ THIS FIRST)

### What exists and works:
- Auth: JWT-based login/signup for user, hostel_owner, admin
- Password reset via email (nodemailer already configured in config/nodemailer.js)
- Hostel CRUD: owner can add hostel (3-step form: GeneralDetails → Specifications → Facilities)
- Booking: user books hostel → owner accepts/rejects → user goes to payment page
- Payment: Stripe checkout session + Manual payment (JazzCash/Easypaisa with receipt screenshot uploaded to Supabase)
- Real-time chat: Socket.io between user and owner
- Admin panel: manage users, owners, hostels, bookings, chats
- MyBookings: desktop table + mobile cards (already responsive)
- Navbar: already has hamburger menu for mobile
- Supabase: used ONLY for image storage (hostel images + payment receipts)

### What is broken/missing:
1. PaymentPage.jsx — advance amount shows PKR 0 (wrong API call)
2. PaymentPage.jsx — hostel/room data not loading properly
3. UserSidebar.jsx — Payments link goes to /user/my-bookings instead of /user/payments
4. No /user/payments page exists
5. Hostel edit/delete control: owner can add but not edit/delete; admin has no full control
6. No email notifications on booking or payment
7. Many pages not mobile responsive (Owner panel, Admin panel, HostelDetails, etc.) — MUST be fully fixed
8. Not deployed live

### Key file locations:
- Backend entry: server.js → app.js
- Auth middleware: middleware/authMiddleware.js (exports: protect, checkRole)
- DB config: config/db.js
- Email config: config/nodemailer.js (transporter already set up, uses EMAIL + EMAIL_PASS from .env)
- Stripe: initialized in controllers/paymentController.js
- Models: models/ (User, Booking, Hostel, Payment, Conversation, Message)
- Frontend API helper: src/api/fetchClient.js (uses VITE_API_URL env var, sends JWT automatically)
- Frontend pages: src/pages/ (admin/, user/, PostHostel/)
- Color theme: purple-600 primary, gray-50/white backgrounds

### Current .env (Backend) has:
- MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- EMAIL=husnazaheer518@gmail.com, EMAIL_PASS (app password already set)
- GOOGLE_API_KEY (for geocoding)

### MongoDB Models summary:
- User: { name, email, password, role: [user|hostel_owner|admin], isVerified, isBlocked, resetPasswordToken }
- Hostel: { name, type, location(GeoJSON), address, rooms[{roomId, title, type, advanceAmount, seatPrice, totalSeats, reservedSeats}], floors, facilities, images, ownerId, contact, jazzCashNumber, easypaisaNumber, isBlocked }
- Booking: { hostelId, userId, roomId, roomType, name, contactNo, email, people, status[pending|accepted|rejected|cancelled|reserved|completed], paymentStatus[unpaid|pending|pending_verification|paid|verified|rejected], proposedStatus }
- Payment: { bookingId, userId, ownerId, hostelId, roomId, amount, method[stripe|jazzcash|easypaisa], stripePaymentIntentId, stripeSessionId, receiptScreenshot, status[pending|pending_verification|paid|verified|failed|rejected], paidAt }
- Settings (NEW — singleton): { siteName, logoUrl, supportEmail, supportPhone, primaryCity, featuredHostelLimit, advancePercent, platformCommission, stripeEnabled, jazzCashEnabled, easypaisaEnabled, maintenanceMode, allowUserRegistration, allowOwnerRegistration, termsAndConditions, privacyPolicy, updatedBy }

---

## IMPORTANT — KEY DECISIONS FOR THIS PROJECT (READ CAREFULLY)

### DECISION 1: Hostel Edit/Delete Control Model
This project uses a **shared control model** for hostels:
- **Owner**: can ADD their hostel AND EDIT their own hostel (name, description, address, rent, facilities, rooms). Owner can also delete their OWN hostel.
- **Admin**: has FULL OVERRIDE — admin can edit ANY hostel, delete ANY hostel, and block/unblock any hostel. Admin acts as the final authority (to remove fake, spam, or inappropriate listings).

Why this model:
- Owners need day-to-day control of their own listings (natural, reduces admin workload).
- Admin needs override power for safety (remove fraud/abuse, fix bad data).
- This is the standard pattern used by real marketplace platforms.

Implementation rule:
- Owner edit/delete endpoints check `hostel.ownerId === req.user._id`.
- Admin edit/delete/block endpoints do NOT check ownership — admin can act on any hostel.

### DECISION 2: Mobile Responsiveness is MANDATORY (not optional)
The ENTIRE web app MUST be fully mobile responsive. Every single page on all 3 panels (User, Owner, Admin) must look perfect and work correctly at 375px width (iPhone SE). This is a hard requirement — no page may be skipped. See Phase 4 for the full checklist.

### DECISION 3: Admin Panel = Central Control
The Admin panel is the most important control center. Admin must have complete, dynamic, real-time control over ALL users, ALL owners, ALL hostels, ALL bookings, ALL chats, AND the platform's general settings. Nothing in the admin panel should be hardcoded/fake. See Phase 8, Phase 9, and Phase 11.

---

## PHASE 1 — MERGE FRONTEND AND BACKEND INTO ONE REPO

### Goal: Put both projects in one folder for easier management and deployment.

```
hostel-finder/          ← new root folder
├── backend/            ← move FYP-Backend contents here
├── frontend/           ← move FYP-Frontend contents here
└── README.md
```

What to do:
1. Create new folder `hostel-finder`
2. Move backend contents into `hostel-finder/backend/`
3. Move frontend contents into `hostel-finder/frontend/`
4. Create root `.gitignore` to exclude both `.env` files and both `node_modules` folders.
5. Create a root `README.md` with a basic project description.
6. DO NOT change any code — just restructure folders.
7. Verify both still run independently from their folders.

---

## PHASE 2 — FIX EXISTING BUGS

### BUG 1: PaymentPage.jsx — Advance Amount shows PKR 0
What to fix: The payment page loads payment data using the wrong API call. It fetches the payment record (an array) instead of the booking details, so the hostel/room data never loads and the advance amount stays 0.

What needs to happen:
- Fetch the booking by its ID first (the booking's hostelId is populated with rooms, jazzCashNumber, easypaisaNumber).
- Set the hostel from that populated booking so the advance amount calculation works.
- Fetch the payment status separately and handle that it may come back as an array (take the first item).
- Use fetchClient for the booking fetch.

Result: once the hostel is set correctly, the existing advance amount logic will display the right value.

### BUG 2: UserSidebar.jsx — Payments link points to the wrong route
What to fix: The "Payments" link in the user sidebar navigates to `/user/my-bookings` instead of `/user/payments`. Change the link target to `/user/payments`.

### BUG 3: Create the missing /user/payments page
What to do:
- Create a new PaymentsPage for the user panel that shows the user's full payment history.
- It should fetch the user's payments from a new backend endpoint (`/payments/my-payments`).
- Show a desktop table (hostel, amount, method, status, date) and mobile cards (same data) — fully responsive.
- Use status color badges (paid/verified = green, pending = yellow, under review = blue, rejected/failed = red).
- Show a friendly empty state when there are no payments.
- Register the new route under the user routes in App.jsx.
- Add the backend route + controller (`getMyPayments`) that returns payments for the logged-in user, populated with hostel name and booking info, sorted newest first.

### BUG 4: Hostel Edit/Delete — OWNER + ADMIN model (see DECISION 1)
Owner can add but currently cannot edit or delete. Implement the shared control model.

**Owner side (backend — hostelController.js):**
- `updateHostel`: owner edits their OWN hostel. Must verify the hostel belongs to the logged-in owner before updating.
- `deleteHostel`: owner deletes their OWN hostel. Must verify ownership. On delete, also cancel any related bookings.
- `getMyHostels`: returns only the logged-in owner's hostels, newest first.

**Owner routes (hostelRoutes.js):** add owner-protected routes for get-my-hostels, update, and delete (all behind `checkRole("hostel_owner")` and ownership checks).

**Owner frontend (OwnerHostelListing.jsx):**
- Fetch from `/hostels/my-hostels`.
- Add an Edit button → opens a modal with the hostel's current data pre-filled (name, description, address, starting rent, facilities, rooms).
- Add a Delete button → Swal confirmation → calls the owner delete endpoint → removes the hostel from the list on success.

**Admin side (covered in Phase 9):** admin gets its OWN override endpoints to edit/delete/block ANY hostel without ownership checks. Do NOT reuse the owner endpoints for admin — admin endpoints live under `/api/admin/*` and skip the ownership check.

---

## PHASE 3 — EMAIL NOTIFICATIONS

Nodemailer is already configured. Import the transporter from config/nodemailer.js. EMAIL and EMAIL_PASS are already in .env.

Add these notifications:

1. **Booking created → email the user**: confirmation that their booking request was received (hostel name, people count, status = pending). Populate the hostel to get its name.

2. **Booking created → email the owner**: notify the hostel owner of a new booking request (hostel name, guest name, contact, email, people). Look up the owner via the hostel's ownerId.

3. **Payment verified → email the user**: confirmation that payment was verified (hostel name, amount, method, status = confirmed, seat reserved). Populate booking → user and hostel name.

4. **Stripe payment success (via webhook) → email the user**: same confirmation email as #3, triggered from the Stripe webhook after the booking status is updated.

**IMPORTANT rule for all emails:** every send must be fire-and-forget (do NOT await it) so it never blocks or delays the API response. Wrap each send in its own try-catch so a mail failure never breaks the booking/payment flow.

---

## PHASE 4 — MOBILE RESPONSIVENESS (MANDATORY — ENTIRE WEB APP)

This is a HARD requirement. The ENTIRE web app must be fully mobile responsive. Every page on all 3 panels (User, Owner, Admin) MUST look perfect and function correctly at 375px width (iPhone SE). No page may be skipped or left half-done. Color theme stays purple-600 — DO NOT change colors, only add responsive classes.

### Rule: Mobile-first. Use Tailwind responsive prefixes: sm: md: lg: xl:

### Pages that MUST be made fully responsive (verify each one at 375px):

**User Panel:**
- Home.jsx — hero text scales (text-3xl md:text-5xl), feature cards 1→2→4 columns, stats 2→4 columns
- AllHostels.jsx — hostel grid 1→2→3 columns, search/filter bar stacks on mobile
- HostelDetails.jsx — image gallery full width, info section stacks (flex-col md:flex-row), room cards 1→2 columns, booking button full width on mobile
- MyBookings.jsx — already responsive (cards on mobile, table on desktop) — verify it still holds
- PaymentsPage.jsx — desktop table + mobile cards (built in Phase 2)
- PaymentPage.jsx — form fields stack, buttons full width on mobile
- UserSidebar.jsx — hidden by default on mobile, slides in as overlay when toggled, dark backdrop closes it
- UserDashboard.jsx — stat cards stack, charts shrink, recent-bookings table → cards on mobile

**Owner Panel:**
- OwnerSidebar.jsx — hidden by default on mobile, slides in as overlay when toggled, dark backdrop closes it
- OwnerDashboard.jsx — stat cards 2→3→6 columns, chart responsive, recent bookings table → cards on mobile
- OwnerHostelListing.jsx — grid 1→2→3→4 columns, edit modal scrollable and margin on mobile (max-h-[92vh] overflow-y-auto, mx-4)
- OwnerBookings.jsx — table wrapped in overflow-x-auto on desktop, full mobile card view (same pattern as MyBookings)

**Admin Panel:**
- AdminLayout.jsx — sidebar overlay on mobile (same pattern as user/owner sidebars), content margin adjusts for collapsed sidebar
- Dashboard.jsx — stat/KPI cards 1→2→4 columns, all charts responsive, tables wrapped in overflow-x-auto
- UserManagement.jsx — desktop table + mobile cards
- OwnerManagement.jsx — desktop table + mobile cards
- HostelManagement.jsx — desktop table + mobile cards
- BookingManagement.jsx — desktop table + mobile cards
- ChatMonitoring.jsx — list + full-screen chat modal on mobile
- SettingsPage.jsx — tabbed settings form; tabs scroll horizontally on mobile, inputs/toggles stack full width (built in Phase 11)

### Sidebar pattern (apply to all 3 sidebars — User, Owner, Admin):
- On mobile (< md): sidebar hidden by default, slides in as an overlay when toggled open.
- Add a dark backdrop (black/50) that closes the sidebar when tapped.
- Use the existing `isOpen` prop to control it.
- On desktop: keep current collapse/expand behavior.

### General rules to apply to EVERY page:
- Padding: use `p-4 md:p-6 lg:p-8` (never just `p-8`)
- Headings: `text-xl md:text-2xl` or `text-2xl md:text-3xl`
- Action buttons: `w-full sm:w-auto`
- Forms: stack fields vertically on mobile (`flex-col md:flex-row`)
- Tables: ALWAYS wrap in an `overflow-x-auto` div, and provide a mobile card view (`hidden md:block` table + `md:hidden` cards)
- Images: `w-full object-cover` with a fixed height
- Modals: `mx-4 md:mx-auto`, `max-w-full md:max-w-2xl`, scrollable (`max-h-[90vh] overflow-y-auto`)
- Grids: start at 1 column on mobile, scale up (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/4`)

### Verification step (do this before marking Phase 4 done):
Open every page above at 375px width and confirm: no horizontal scroll, no overflowing text, no cut-off buttons, all tables readable (as cards), all modals fit on screen, both/all sidebars work as overlays.

---

## PHASE 5 — LIVE DEPLOYMENT

### Architecture:
- Backend → Render.com (free tier, Node.js)
- Frontend → Vercel (free tier, Vite/React)
- Database → MongoDB Atlas (free tier)

### Step 1: MongoDB Atlas
- Create a free cluster, a DB user, and whitelist all IPs (0.0.0.0/0) for simplicity.
- Get the connection string and replace `MONGO_URI` in the backend env.

### Step 2: Backend on Render
- Push backend to GitHub.
- Create a Render Web Service pointing at the backend folder.
- Build command: `npm install`. Start command: `node server.js`. Node 18+.
- Add all environment variables (MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, EMAIL, EMAIL_PASS, CLIENT_URL, CORS_ORIGIN).
- Ensure the backend `package.json` start script is `"start": "node server.js"`.

### Step 3: Frontend on Vercel
- Push frontend to GitHub.
- Import into Vercel pointing at the frontend folder.
- Build command: `npm run build`. Output directory: `dist`.
- Add env vars: VITE_API_URL (the Render backend URL + /api), VITE_STRIPE_PUBLISHABLE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.

### Step 4: Fix hardcoded URLs (MUST DO BEFORE DEPLOY)
Search the entire frontend for `http://localhost:3000` and replace ALL occurrences — ideally route everything through fetchClient, or fall back to `import.meta.env.VITE_API_URL`. Known files with hardcoded URLs: MyBookings.jsx, BookingRow.jsx, OwnerHostelListing.jsx, OwnerBookings.jsx — and search for any others.

### Step 5: Stripe for live
- Keep test keys for testing; switch to live keys for production.
- Update the Stripe webhook endpoint URL to the Render backend `/api/payments/webhook`, subscribe to `payment_intent.succeeded` and `checkout.session.completed`, and update STRIPE_WEBHOOK_SECRET in Render env vars.

### Step 6: Password reset URL for production
The reset URL in the password controller must use `process.env.CLIENT_URL` (not localhost). Add CLIENT_URL to the backend env and Render env vars.

### Step 7: CORS
Ensure the backend CORS origin uses `process.env.CORS_ORIGIN` and set it in Render to the Vercel frontend URL.

---

## PHASE 6 — (REMOVED)

The Private Room Rental / landlord feature has been intentionally removed from this project. Do NOT add a landlord role, private rooms, room inquiries, or any related pages, models, routes, or navigation links. The project stays focused on the existing three roles only: user, hostel_owner, admin.

---

## PHASE 7 — FINAL CHECKLIST

Before calling done, verify:

### Backend:
- [ ] All hardcoded localhost removed — use env vars
- [ ] `package.json` start script: `"start": "node server.js"`
- [ ] All new routes imported and registered in `app.js`
- [ ] CORS origin uses `process.env.CORS_ORIGIN`
- [ ] All email sends are fire-and-forget (don't block response)
- [ ] Owner edit/delete endpoints verify ownership
- [ ] Admin override endpoints (edit/delete/block any hostel) work WITHOUT ownership check
- [ ] Admin can create users (clients + owners) and change any user's role
- [ ] Platform settings exist, are admin-editable, and actually take effect (maintenance mode, registration + payment-method toggles, advance %)

### Frontend:
- [ ] No `http://localhost:3000` anywhere — all use fetchClient or VITE_API_URL
- [ ] All new pages imported and routes added in `App.jsx`
- [ ] UserSidebar Payments link → `/user/payments`
- [ ] PaymentsPage exists and route added
- [ ] PaymentPage loads correct advance amount
- [ ] Owner can edit and delete their own hostels
- [ ] Admin can add users, change roles, and edit the platform settings page
- [ ] **EVERY page on all 3 panels is mobile responsive (tested at 375px)** — this is mandatory
- [ ] Navbar hamburger works on mobile
- [ ] All 3 sidebars (User, Owner, Admin) work as overlay on mobile

### Testing:
- [ ] Full booking flow: browse → book → owner accepts → payment page shows correct amount → stripe payment works
- [ ] Manual payment: submit receipt → owner verifies → emails sent
- [ ] Email received on: booking created, payment verified
- [ ] Owner can edit and delete own hostels; admin can edit/delete/block ANY hostel
- [ ] Admin panel has full control over users, owners, hostels, bookings, chats, and settings
- [ ] Admin-created user/owner can log in; a changed role takes effect on next login
- [ ] Turning maintenance mode on blocks non-admins; disabling a payment method hides/blocks it
- [ ] All pages look good on 375px (iPhone SE)

---

## HOW TO USE THIS SKILL FILE

Paste this into your CLI (VS Code Claude / Command Code / DeepSeek):

```
I am giving you the complete skill guide for my Hostel Finder FYP project.
Read it fully and carefully — it explains the entire project architecture,
what works, what is broken, and what needs to be added.

[paste entire HOSTEL_FINDER_COMPLETE_SKILL.md content here]

Now follow it phase by phase:
- Phase 1: Merge frontend and backend into one folder
- Phase 2: Fix existing bugs (payment amount, sidebar link, payments page, owner+admin hostel CRUD)
- Phase 3: Add email notifications
- Phase 4: Make the ENTIRE webapp mobile responsive (mandatory, every page, all 3 panels)
- Phase 5: Deploy backend to Render, frontend to Vercel
- Phase 6: REMOVED — do not add the private room rental feature
- Phase 7: Final verification checklist
- Phase 8: Make all 3 dashboards fully dynamic (real data)
- Phase 9: Make the entire admin panel fully dynamic and powerful (full control over users, owners, hostels, bookings, chats — including creating users and changing roles)
- Phase 10: Professional Owner Bookings + User My Bookings redesign
- Phase 11: Platform / General Settings controlled by admin (site config, maintenance mode, registration + payment toggles, legal text)

Read every file before editing it.
Never break working code — only fix what's broken or add what's missing.
Keep the purple theme. Ask me if you are unsure about anything.
```

---

## PHASE 8 — DYNAMIC DASHBOARDS (REAL DATA)

All 3 dashboards currently show hardcoded/fake data. Make them fully dynamic with real data from MongoDB.

### Backend — New Dashboard APIs

Build (or replace) `controllers/dashboardController.js` to expose three endpoints, each returning real aggregated data:

**User dashboard (`GET /api/dashboard/user`):**
- Stats: total bookings, accepted (incl. reserved), pending, cancelled, rejected, total amount paid (verified/paid payments).
- Recent bookings (latest 4), populated with hostel name/address/images.
- Monthly bookings chart data for the last 6 months.
- The logged-in user's name and email.

**Owner dashboard (`GET /api/dashboard/owner`):**
- Stats: total hostels, total bookings, pending, accepted, rejected, count of payments awaiting verification, total revenue (verified/paid).
- Recent bookings (latest 5), populated with hostel name and guest name/email.
- Pending manual payments to verify (populated with booking + user).
- Monthly bookings chart data for the last 6 months (across the owner's hostels).
- Per-hostel booking counts (top hostels by bookings).

**Admin dashboard (`GET /api/dashboard/admin`):**
- Counts: total users, total owners, total hostels, total bookings, pending, accepted, cancelled, total chats/conversations.
- Today's bookings count.
- Total platform revenue (verified/paid payments).
- Weekly bookings chart (last 7 days).
- Monthly trend (last 6 months: bookings + cancellations).
- Top hostels by booking count (use an aggregation that joins hostels).
- Acceptance vs rejection rate (for a pie chart).
- Recent signups (latest 5 regular users).

Add helper functions for the time-bucketed aggregations (monthly per user, monthly per owner, weekly, monthly trend).

### Backend — Dashboard Routes
Expose the three endpoints in `routes/dashboardRoutes.js`, each protected and role-checked (`user`, `hostel_owner`, `admin` respectively). Keep any existing `/profile` route for compatibility. Make sure the router is registered at `/api/dashboard` in app.js.

### Frontend — User Dashboard (UserDashboard.jsx)
Problems to fix: wrong API endpoint, hardcoded chart data, fake "change %" badges, messages count always 0, and the status badge checks for "confirmed" but the real status is "accepted".
What to do:
- Fetch everything from `/dashboard/user` via fetchClient.
- Drive stat cards from real data (accepted stays, pending, total paid).
- Drive the bar chart from the real monthly data (remove the hardcoded array).
- Remove the fake green "+12%/+5%/+24%" change badges.
- Fix the status badge to recognize accepted/reserved (green), pending (yellow), else red.

### Frontend — Owner Dashboard (OwnerDashboard.jsx)
This file is fully hardcoded. Rebuild it to:
- Fetch from `/dashboard/owner`.
- Show real stat cards: My Hostels, Total Bookings, Pending, Accepted, Rejected, Revenue.
- Show a real monthly bookings bar chart (last 6 months).
- Show real recent booking requests (desktop table + mobile cards) with real guest names and hostels.
- Keep the PendingPayments section.
- Fully responsive.

### Frontend — Admin Dashboard (Dashboard.jsx)
All KPIs, charts, and top-hostels are hardcoded. Replace with real API data:
- Fetch from `/dashboard/admin`.
- KPI cards driven by real counts (users, owners, hostels, bookings, pending, cancelled, chats, today's bookings, total revenue).
- Weekly chart from real last-7-days data.
- Monthly trend chart from real data (bookings + cancellations).
- Top hostels from the real aggregation.
- Pie chart from the real acceptance/rejection rate.
- Remove every hardcoded array. If the chat-activity chart has no real source, either wire it to real conversation counts or hide it.
- Fully responsive.

### SUMMARY — What becomes dynamic:

| Dashboard | Before | After |
|-----------|--------|-------|
| User — stat cards | Partial real, wrong API | Fully real (accepted, pending, total paid) |
| User — bar chart | Hardcoded fake data | Real monthly bookings last 6 months |
| User — recent bookings | Real but wrong endpoint | Real, correct endpoint |
| Owner — all stats | Completely fake | Real (hostels, bookings, revenue) |
| Owner — recent bookings | Hardcoded names | Real student names and hostels |
| Owner — bar chart | Did not exist | Real monthly bookings |
| Admin — KPI cards | All fake | Real counts from MongoDB |
| Admin — weekly chart | Fake | Real bookings last 7 days |
| Admin — trend chart | Fake | Real monthly bookings + cancellations |
| Admin — top hostels | Fake | Real hostels ranked by bookings |
| Admin — pie chart | Fake | Real acceptance/rejection rate |

---

## PHASE 9 — FULLY DYNAMIC & POWERFUL ADMIN PANEL (CENTRAL CONTROL)

The admin panel is the central control center of the whole app. All 5 admin pages are currently hardcoded with fake data. Make them ALL fully dynamic, real-time, and give admin COMPLETE control over users, owners, hostels, bookings, and chats. Nothing here should be fake. (Platform-wide General Settings are a separate admin power — see Phase 11.)

### Current state (all fake — must be replaced):
- UserManagement → hardcoded users
- OwnerManagement → hardcoded owners
- HostelManagement → hardcoded hostels
- BookingManagement → hardcoded bookings
- ChatMonitoring → hardcoded chats

### Admin powers required (the full control admin must have):
- **Users**: create new accounts (both clients AND owners), view all, search, block/unblock, delete, and change role — promote a client to owner, or move anyone between user / hostel_owner / admin.
- **Owners**: view all (with their hostel count + booking stats + acceptance rate), block/unblock, delete.
- **Hostels**: view all (with owner info, room/seat counts, booking count), block/unblock, AND full override edit + delete on ANY hostel (per DECISION 1 — admin skips ownership checks).
- **Bookings**: view all, force-cancel any booking, see payment status/amount per booking.
- **Chats**: view (read-only) all conversations and their messages between users and owners.

### Backend — expand adminController.js with these functions:
- `adminCreateUser` — admin creates a new account directly. Takes name, email, password, and role (`user` or `hostel_owner`). Reject if the email already exists, hash the password, and mark the account as verified (admin-created accounts are pre-verified). Email the new person their login details (using the existing transporter, fire-and-forget). A newly created owner then also appears under OwnerManagement.
- `changeUserRole` — set a user's role to one of `user` / `hostel_owner` / `admin` (validate the value). This lets the admin hand out owner or client roles freely. (Can be its own endpoint or done via the existing update-role function.)
- `toggleUserBlock` — block/unblock a user (toggles `isBlocked`).
- `getAllOwners` — all owners enriched with hostelCount, totalBookings, acceptanceRate, isBlocked, joined date.
- `getAllHostels` — all hostels enriched with owner name/email, room count, available seats, booking count, isBlocked.
- `toggleHostelBlock` — block/unblock a hostel.
- `adminUpdateHostel` — admin edits ANY hostel (NO ownership check — this is the admin override per DECISION 1).
- `adminDeleteHostel` — admin deletes ANY hostel (NO ownership check) and cancels related bookings.
- `getAllBookings` — all bookings with user, hostel, room type, people, status, payment status + amount.
- `forceCancelBooking` — admin force-cancels any booking.
- `getAllConversations` — all chats with participants, message count, last message + activity, and the recent messages for the viewer modal (read-only).

Also ensure the `isBlocked` boolean field exists on both the User model and the Hostel model (default false).

### Backend — update adminRoutes.js (all behind protect + checkRole("admin")):
- Users: **create**, list, get-by-id, delete, **update-role / change-role**, toggle-block.
- Owners: list, toggle-block (reuse user toggle), delete (reuse user delete).
- Hostels: list, toggle-block, **admin-update (override edit)**, **admin-delete (override delete)**.
- Bookings: list, force-cancel.
- Chats: list conversations.

### Frontend — make each admin page dynamic (keep existing UI structure, only swap fake data for real + wire actions):

**UserManagement.jsx**
- Fetch real users, search by name/email.
- Stat cards: total, active, blocked, joined this month.
- **"+ Add User" button** at the top → opens a modal with name, email, password, and a **role dropdown (Client / Hostel Owner)** → calls the create endpoint → refreshes the list + toast. (A new owner will also show up in OwnerManagement.)
- Per-user actions: **Change Role** (dropdown user ↔ owner ↔ admin, Swal confirm → calls change-role), Block/Unblock, Delete → call real API → Swal confirm → toast → update local state.
- Show the current role as a small badge (Client / Owner / Admin).
- Either add role tabs/filter (All / Clients / Owners / Admins) here, or keep clients here and let owners surface in OwnerManagement — pick one and stay consistent.
- Desktop table + mobile cards.

**OwnerManagement.jsx**
- Fetch real owners from `/admin/owners`.
- Stat cards: total owners, active, blocked, total hostels (sum of hostelCount).
- Columns: owner (name+email), hostels, total bookings, acceptance rate (bar), joined, status, actions.
- Block/Unblock + Delete. Desktop table + mobile cards.

**HostelManagement.jsx**
- Fetch real hostels from `/admin/hostels`.
- Stat cards: total, active, blocked. Tabs: All / Active / Blocked. Search by name/owner/address.
- Columns: hostel (name+rent), owner, location, rooms, available seats, bookings, status, actions.
- Actions: Block/Unblock, **Edit (admin override)**, **Delete (admin override)**.
- Remove any "pending/approved" approval concept — this project only has Active/Blocked.
- Desktop table + mobile cards.

**BookingManagement.jsx**
- Fetch real bookings from `/admin/bookings`.
- Stat cards (computed): total, pending, accepted, rejected, cancelled.
- Tabs: All / Pending / Accepted / Rejected / Cancelled (remove "Confirmed"/"Completed" tabs that don't match real statuses; reserved maps to confirmed display).
- Columns: user (name+email), hostel, room type, people, status, payment status, amount, date, actions.
- Payment badge colors: unpaid/pending = yellow, pending_verification = blue, verified/paid = green, rejected = red.
- Force Cancel action (only when status is not already cancelled).
- Desktop table + mobile cards.

**ChatMonitoring.jsx**
- Fetch real conversations from `/admin/conversations`. READ-ONLY (admin can view, never send).
- Stat cards: total conversations, active (messages in last 7 days), total messages.
- Columns: user (name+email), owner, message count, last message (truncated), last activity, actions.
- "View Chat" opens a modal with the real messages; user messages left (gray), owner messages right (blue), sender name above each bubble, "Read-only mode" notice at the bottom.
- Mobile: stacked cards, View Chat opens a full-screen modal.

### Key rules for all admin pages:
- Always use fetchClient — never hardcode localhost URLs.
- Every action (create, block, delete, force-cancel, edit, change role) calls the real API, then updates local state.
- Show a loading spinner while fetching.
- Show a Swal confirmation before any destructive action (delete, block, force-cancel, role change).
- Show a toast on success/error.
- Keep the existing UI design — only replace fake data with real and wire up actions; don't redesign.
- Provide mobile cards for every page (responsive is mandatory — see Phase 4).

### SUMMARY — Admin Panel Before vs After:

| Page | Before | After |
|------|--------|-------|
| UserManagement | Fake users, no API | Real users; create users (client+owner), change role, block/unblock/delete |
| OwnerManagement | Fake owners, fake stats | Real owners with hostel count + acceptance rate |
| HostelManagement | Fake hostels | Real hostels; block/unblock + admin override edit/delete |
| BookingManagement | Fake bookings | All real bookings; force cancel works |
| ChatMonitoring | Fake chats | Real conversations + real messages (read-only) |

---

## PHASE 10 — PROFESSIONAL BOOKING MANAGEMENT (OWNER + USER)

Goal: make OwnerBookings.jsx and the user's MyBookings.jsx fully professional, like a real booking platform. Keep the purple theme. Fully mobile responsive.

### Backend changes:
- `getSingleBooking`: populate the hostel with its rooms (and jazzCash/easypaisa numbers, contact, images, startingRent) and the user (name/email). Also attach the latest payment for that booking.
- `getOwnerBookings`: populate hostel (name, rooms) + user (name/email), and attach each booking's latest payment so the table can show payment status/amount/receipt.
- `getUserBookings`: populate hostel (name, images, startingRent, rooms) and attach each booking's latest payment.
- Add `markBookingCompleted` (sets status to "completed") with a PATCH route. Ensure "completed" and "reserved" are valid statuses in the status updater.

### Frontend — Owner Bookings (OwnerBookings.jsx) — professional redesign:
- Stat cards at top: Total Bookings, Pending, Confirmed, This Month Revenue.
- Search bar + status tabs/filter (All, Pending, Accepted, Rejected, Completed).
- Professional table: Student (name/email/phone), Hostel/Room, People, Amount (real advance from room), Payment Proof (receipt thumbnail/View), Payment status badge (with amount breakdown like "PKR 4,050 / PKR 13,500"), Booking status badge, and an Actions (⋯) menu.
- Actions menu: Accept Booking, Reject Booking, Verify Payment, Reject Payment (with reason), Send Email, Copy Phone, Mark as Completed — each shown only when relevant to that booking's state.
- Receipt image viewer (lightbox).
- Full mobile card view with the same actions.

### Frontend — User My Bookings (MyBookings.jsx + BookingRow.jsx) — professional redesign:
- Remove the confusing separate "Payment" and "Status" columns — combine into ONE clear status per booking that tells the whole story (e.g. "Pending Approval", "Accepted — Pay Now", "Payment Under Review", "Confirmed & Reserved", "Payment Rejected", "Cancelled").
- Use a clean card layout (color-coded top strip per status) showing hostel name, room type, people, booked-on date, payment status, and advance amount.
- Smart actions that appear only when relevant: Pay Now (accepted + unpaid), Retry Payment (payment rejected), Cancel (pending). Never show "No Action" text.
- Show the rejection reason clearly in a red box when a payment was rejected.
- Mini stats at top (Total, Pending, Accepted, Pay Now) + filter pills.
- Fully mobile responsive.
- Delete `src/components/BookingRow.jsx` — it is replaced by the BookingCard component built into MyBookings.

### SUMMARY — Before vs After:

| Component | Before | After |
|-----------|--------|-------|
| OwnerBookings | Basic table, no stats, no payment actions | Professional: stats, search, payment verify/reject, receipt viewer, mobile cards |
| MyBookings | Two confusing badges | Clean cards, one unified status story, smart actions |
| BookingRow | Confusing split badges | Deleted — replaced by BookingCard inside MyBookings |
| Payment flow | Unclear when to pay | Clear "Pay Now" appears only when accepted |
| Receipt viewing | Owner only in PendingPayments | In OwnerBookings table + lightbox |

---

## PHASE 11 — PLATFORM / GENERAL SETTINGS (ADMIN-CONTROLLED)

Goal: give the admin one place to control the whole app's general settings. These are NOT cosmetic — they must actually change how the app behaves. This is the "general settings" power referenced in DECISION 3. Keep the purple theme. Fully mobile responsive.

### Settings the admin can control (grouped into tabs):
- **General / Branding**: site name, logo image URL, support email, support phone, primary city, number of featured hostels shown on the homepage.
- **Booking & Payments**: advance percentage (the % of seat price taken as advance), platform commission %, and an on/off toggle for each payment method (Stripe / JazzCash / Easypaisa).
- **Access Control**: maintenance mode (on/off), allow new user (client) registration (on/off), allow new owner registration (on/off).
- **Legal**: Terms & Conditions text, Privacy Policy text.

### Backend — what to build:
- A **single global Settings document** (a singleton — only one config row ever exists; create it automatically on first read if missing). Fields are listed in the Models summary at the top.
- `getSettings` (admin) — return the global settings document.
- `updateSettings` (admin) — partial update of only the allowed fields; record who updated it.
- `getPublicSettings` (PUBLIC, no auth) — return only the safe fields the frontend/public needs: site name, logo, support info, maintenance flag, registration toggles, payment-method toggles, advance %, and legal text.

### Backend — routes:
- `GET /api/admin/settings` and `PUT /api/admin/settings` — admin only.
- `GET /api/settings/public` — public (no auth), mounted in app.js.

### Backend — make the settings ACTUALLY take effect (this is the important part):
- **Maintenance mode**: when it's on, block every non-admin request (allow login/auth routes and admins through) and return a clear "site under maintenance" message. Read the flag from settings (cache it briefly for performance and refresh it after an update).
- **Registration toggles**: in signup/register, reject a new client signup when user registration is off, and reject a new owner signup when owner registration is off — with a clear message.
- **Payment-method toggles**: in the payment flow, reject or hide a method (Stripe / JazzCash / Easypaisa) when its toggle is off.
- **Advance %**: wherever the advance amount is computed, read the percentage from settings instead of any hardcoded number.

### Frontend — Settings page (new SettingsPage.jsx in the admin panel):
- A tabbed form with the four tabs above (General · Booking & Payments · Access Control · Legal).
- Text inputs for names/contacts/URLs, number inputs for percentages and limits, on/off toggle switches for the boolean flags, and textareas for the legal text.
- Load current values from `/admin/settings`; one **Save** button sends the changes to the update endpoint; show a toast on success/error.
- Fully mobile responsive (tabs scroll horizontally, fields stack — see Phase 4).
- Add a **Settings** link in the admin sidebar and register the `/admin/settings` route in the admin layout/router.

### Frontend — use the public settings across the app (optional but recommended):
- On app load, read `/api/settings/public` once and use it to show the site name + logo in the navbar, and to show a maintenance banner when maintenance mode is on.

### SUMMARY — what the admin gains in Phase 11:

| Setting group | Admin can control |
|---------------|-------------------|
| General / Branding | Site name, logo, support email/phone, primary city, featured-hostels count |
| Booking & Payments | Advance %, commission %, enable/disable Stripe / JazzCash / Easypaisa |
| Access Control | Maintenance mode, open/close user registration, open/close owner registration |
| Legal | Terms & Conditions, Privacy Policy text |

### Build notes:
- Build the singleton Settings model + the three endpoints first, then wire the enforcement (maintenance gate, registration + payment toggles, advance %), then the admin Settings page last.
- Verify it works end to end: flip maintenance mode on → a normal user is blocked, admin still works; disable a payment method → it disappears/rejects in checkout; change advance % → the payment page reflects the new amount.

