# Hostel Finder

A full-stack hostel booking platform for university students.

## Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express (ESM) + MongoDB + Mongoose
- **Payments**: Stripe + JazzCash/Easypaisa (manual)
- **Images**: Supabase Storage
- **Real-time chat**: Socket.io

## Roles
- `user` — browse and book hostels
- `hostel_owner` — list and manage hostels, accept/reject bookings, verify payments
- `admin` — full control over all users, owners, hostels, bookings, and chats

## Project Structure
```
hostel-finder/
├── backend/     # Express API (port 3000)
└── frontend/    # Vite React app (port 5173)
```

## Getting Started

### Install dependencies
```bash
npm install                  # root (concurrently)
cd backend && npm install
cd frontend && npm install
```

### Run both together
```bash
npm run dev
```

### Environment Variables

**backend/.env**
```
MONGO_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
EMAIL=
EMAIL_PASS=
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
