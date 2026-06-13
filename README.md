# SmartTrip - Dynamic Travel Orchestration

SmartTrip is an AI-powered travel planning application that transforms natural language queries into comprehensive, dynamic travel itineraries. By leveraging advanced AI models, interactive mapping, and a robust backend, SmartTrip provides an end-to-end, intent-first travel planning experience.

##  Key Features

- **AI-Driven Travel Context Extraction:** A smart chatbot interface that understands user travel intent from natural language queries using Groq API.
- **Real-Time Option Generation:** Dynamically generates flight and hotel options based on user preferences.
- **Dynamic Itinerary Construction:** Automatically creates detailed, multi-day travel itineraries with geographical data.
- **Interactive Mapping:** Visualizes the journey with accurate geocoordinates rendered on a MapLibre interface.
- **Secure Authentication:** Integrated Firebase authentication for user accounts and profile management.
- **User Profiles & Preferences:** Save and manage travel preferences and history.
- **Cloud Storage:** Image upload and management via Cloudinary.
- **Modern & Responsive UI:** Built with React 19, Tailwind CSS v4, and Framer Motion for a stunning user experience.

## 📂 Project Structure

```text
SmartTrip/
├── public/                 # Static assets (images, icons)
├── server/                 # Backend Node.js/Express server
│   ├── config/             # Database (MongoDB) and Firebase Admin configurations
│   ├── controllers/        # Request handlers for routes
│   ├── middleware/         # Auth, validation, and rate-limiting middlewares
│   ├── models/             # Mongoose schemas for Users, Trips, and Preferences
│   ├── routes/             # API route definitions
│   └── index.ts            # Express server entry point
├── src/                    # Frontend React application
│   ├── assets/             # Styles and SVGs
│   ├── components/         # Reusable UI (Radix/Shadcn) and Orbit-specific components
│   ├── data/               # Mock data and static constants
│   ├── hooks/              # Custom React hooks (useTrips, useProfile, etc.)
│   ├── lib/                # Core logic (AI integration, Firebase, Maps, API clients)
│   ├── router/             # React Router configuration and Protected Routes
│   ├── store/              # Global state management using Zustand
│   ├── types/              # TypeScript interfaces and type definitions
│   └── App.tsx             # Main application layout and logic
├── package.json            # Frontend dependencies and scripts
└── vite.config.ts          # Vite configuration
```

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (TypeScript)
- **State Management:** Zustand
- **Styling:** Tailwind CSS v4, Framer Motion
- **Icons:** Lucide React
- **Mapping:** MapLibre GL
- **AI Integration:** Groq API

### Backend
- **Runtime:** Node.js (Express)
- **Database:** MongoDB (Mongoose)
- **Authentication:** Firebase Auth / Firebase Admin SDK
- **File Storage:** Cloudinary
- **Validation:** Express Validator

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/kishuvansh/SmartTrip
cd Orbit-main
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create .env file
# VITE_GROQ_API_KEY=your_groq_api_key
# VITE_MAP_API_KEY=your_map_api_key
# VITE_FIREBASE_API_KEY=your_firebase_key

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Create .env file
# MONGO_URI=your_mongodb_uri
# FIREBASE_SERVICE_ACCOUNT_KEY=path_to_json
# CLOUDINARY_CLOUD_NAME=your_name

# Start backend server
npm run dev
```

## 📜 Scripts

- `npm run dev`: Starts the local development server (Vite).
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the codebase.
- `server: npm run dev`: Starts the backend development server with ts-node-dev.

