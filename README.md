# 🚀 Orbit — AI-Powered Travel Planning

**Orbit** (codename: SmartTrip) is a full-stack, conversational travel-planning application. Users chat in plain English with an AI assistant to build a complete, day-by-day, geospatially-rendered travel itinerary — from intent to packed bags.

---

## ✨ Features

### 🤖 Conversational AI Planning
- **Chat-first interface** — describe your trip in plain English ("4 days in Goa, party vibe")
- AI gathers **origin, destination, travel dates, traveler count, and trip vibe** one question at a time
- Automatically detects when enough context has been collected and triggers the booking flow

### ✈️ Real-Time Flight Search (Duffel API)
- Searches **live commercial flight availability** via the Duffel API
- Automatically falls back to AI-generated realistic options (with accurate pricing, airlines, flight numbers) when Duffel has no IATA mapping or returns no results
- Results are **cached for 15 minutes** to reduce API calls
- Displays up to 3 options tagged: *Cheapest*, *Recommended*, *Best Value*

### 🏨 Real-Time Hotel Search (Duffel Stays API)
- Geocodes the destination city to get precise lat/lon via **LocationIQ / Nominatim**
- Queries the **Duffel Stays API** for real accommodation options within a 5 km radius
- Falls back to AI-generated hotel options matched to the user's trip vibe
- Results are cached and tagged: *Budget Friendly*, *Vibe Match*, *Trending*

### 🗺️ Interactive Geospatial Itinerary
- Generates a **day-by-day JSON itinerary** (flights, transfers, hotel check-in, activities) using the AI engine
- Each itinerary event is **geocoded to real-world lat/lon** via LocationIQ, then rendered as markers on an interactive **MapLibre GL** map
- Day selector switches the map view between trip days
- Events include time, duration, price, and color-coded activity-type badges

### 🔐 Authentication & User Accounts
- **Firebase Authentication** with email/password and Google Sign-In support
- **Forgot password** email flow
- All backend routes are protected via `verifyToken` middleware using the **Firebase Admin SDK**
- Zustand-based auth store with real-time `onAuthStateChanged` listener

### 👤 User Profile & Preferences
- Editable profile: name, bio, home city, preferred currency, travel style
- Avatar upload stored on **Cloudinary CDN** via `multer-storage-cloudinary`
- Preferences: travel style (luxury, budget, backpacking, adventure, family), favorite destinations

### 📋 Trip History
- Saved trips stored in **MongoDB** with full itinerary JSON, selected flight, selected hotel, and chat history
- Trip history dashboard: list, favorite toggle, delete
- Trip status lifecycle: `active → generated → booked → completed`

### ⚙️ Pluggable AI Engine
- Supports **Google Gemini** (`gemini-3.8-flash` by default) and **Groq** (`openai/gpt-oss-120b`) via a single config block
- Switch providers by setting `GEMINI_API_KEY` or `GROQ_API_KEY` in `.env` — no code changes needed
- Automatic retry: if the AI provider's strict JSON mode fails (HTTP 400), retries without `response_format` constraint and uses `safeParseJSON` to extract the JSON from free-text responses

---

## 📂 Project Structure

```text
Orbit-main/
├── backend/                   # Node.js / Express API server
│   ├── config/                # MongoDB connection, Firebase Admin init
│   ├── controllers/
│   │   ├── aiController.ts    # AI chat, context extraction, options, itinerary
│   │   ├── tripsController.ts # CRUD for saved trips
│   │   ├── profileController.ts
│   │   └── preferencesController.ts
│   ├── middleware/
│   │   ├── auth.ts            # Firebase token verification
│   │   ├── validate.ts        # express-validator middleware
│   │   └── rateLimit.ts       # express-rate-limit
│   ├── models/
│   │   ├── User.ts            # User schema (Mongoose)
│   │   ├── Trip.ts            # Trip schema with itinerary JSON
│   │   └── Preferences.ts
│   ├── routes/
│   │   ├── ai.ts              # /api/ai/* (chat, context, options, itinerary)
│   │   ├── trips.ts           # /api/trips (CRUD + favorites)
│   │   ├── profile.ts         # /api/profile
│   │   └── preferences.ts     # /api/preferences
│   ├── services/
│   │   ├── duffelService.ts   # Duffel flights + hotels (with caching)
│   │   └── geocode.ts         # LocationIQ / Nominatim geocoding
│   ├── index.ts               # Express entry point (PORT 4000)
│   ├── .env                   # Local environment variables (not committed)
│   └── .env.example           # Template for environment setup
│
├── frontend/                  # React 19 / Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── orbit/
│   │   │   │   ├── OrbitDashboard.tsx   # Main app shell + AI orchestration logic
│   │   │   │   ├── ChatInterface.tsx    # Chat panel with inline flight/hotel cards
│   │   │   │   ├── CityMap.tsx          # MapLibre GL interactive map
│   │   │   │   ├── Timeline.tsx         # Day-by-day event list
│   │   │   │   ├── PlanCard.tsx         # Trip summary card
│   │   │   │   ├── OrbitLayout.tsx      # Layout wrapper for inner pages
│   │   │   │   └── NewTripModal.tsx     # New trip session reset modal
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── SignupPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── PreferencesPage.tsx
│   │   │   │   └── TripHistoryPage.tsx
│   │   │   └── ui/                      # Reusable UI primitives (Button, Input, etc.)
│   │   ├── hooks/
│   │   │   ├── useTrips.ts
│   │   │   ├── useProfile.ts
│   │   │   └── usePreferences.ts
│   │   ├── lib/
│   │   │   ├── ai.ts           # API wrappers for /api/ai/* endpoints
│   │   │   ├── api.ts          # Axios instance with Firebase token interceptor
│   │   │   ├── firebase.ts     # Firebase client SDK init
│   │   │   ├── maps.ts         # MapLibre style URL helper
│   │   │   └── utils.ts        # Tailwind class merge utility
│   │   ├── store/
│   │   │   ├── tripStore.ts    # Zustand: chat, context, flights, hotels, itinerary
│   │   │   └── authStore.ts    # Zustand: Firebase auth state
│   │   ├── router/
│   │   │   └── ProtectedRoute.tsx
│   │   └── App.tsx             # React Router v6 route definitions
│   └── index.html
│
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 (TypeScript) | UI framework |
| Vite | Build tool & dev server |
| Zustand | Client state management |
| React Router v6 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| MapLibre GL | Interactive map rendering |
| Lucide React | Icon library |
| Axios | HTTP client with auto Firebase token injection |
| Firebase Client SDK | Authentication (email + Google) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server (port 4000) |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database (trips, users, preferences) |
| Firebase Admin SDK | Server-side token verification |
| Duffel API | Live flights and hotel search |
| Groq / Google Gemini | AI chat, context extraction, itinerary generation |
| LocationIQ / Nominatim | Forward geocoding for map markers |
| Cloudinary | User avatar / media storage |
| Multer | Multipart upload middleware |
| express-validator | Request validation |
| express-rate-limit | API rate limiting |
| Helmet | HTTP security headers |

---

## 🤖 AI Engine Configuration

The backend supports two AI providers via a single environment variable switch — no code changes needed.

### Option A: Google Gemini (Default / Recommended)
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```
Get a free API key at [aistudio.google.com](https://aistudio.google.com).

### Option B: Groq
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
Get a free API key at [console.groq.com](https://console.groq.com).

If `GEMINI_API_KEY` is set, Gemini is used automatically. If only `GROQ_API_KEY` is set, Groq is used. The endpoint, authentication header, and model are switched internally — the OpenAI-compatible chat completions format is used for both.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- A Firebase project (for auth)
- A Groq **or** Google Gemini API key

---

### 1. Clone the Repository
```bash
git clone https://github.com/kishuvansh/SmartTrip
cd Orbit-main
```

---

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# → Edit .env with your keys (see Environment Variables below)
npm run dev
```
Server starts on `http://localhost:4000`.

---

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App starts on `http://localhost:5173`.

---

## 🔑 Environment Variables

Copy the provided example files and fill in your own keys:

```bash
cp backend/.env.example backend/.env
```

See [`backend/.env.example`](./backend/.env.example) for the full list of required variables with descriptions.

---

## 📡 API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | ✅ | Conversational chat response |
| `POST` | `/api/ai/chat/context` | ✅ | Extract travel context from conversation |
| `POST` | `/api/ai/options` | ✅ | Generate flight or hotel options |
| `POST` | `/api/ai/itinerary` | ✅ | Generate full day-by-day itinerary |
| `GET` | `/api/trips` | ✅ | Get all trips for current user |
| `POST` | `/api/trips` | ✅ | Save a new trip |
| `PUT` | `/api/trips/:id/favorite` | ✅ | Toggle trip favorite |
| `DELETE` | `/api/trips/:id` | ✅ | Delete a trip |
| `GET` | `/api/profile` | ✅ | Get user profile |
| `PUT` | `/api/profile` | ✅ | Update user profile |
| `POST` | `/api/profile/avatar` | ✅ | Upload avatar to Cloudinary |
| `GET` | `/api/preferences` | ✅ | Get travel preferences |
| `PUT` | `/api/preferences` | ✅ | Update preferences |
| `GET` | `/health` | ❌ | Health check |

---

## 📜 Scripts

### Backend (`cd backend`)
| Script | Description |
|---|---|
| `npm run dev` | Start dev server with `ts-node-dev` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/index.js` |

### Frontend (`cd frontend`)
| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
