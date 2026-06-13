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
├── backend/                # Backend Node.js/Express server
│   ├── config/             # Database (MongoDB) and Firebase Admin configurations
│   ├── controllers/        # Request handlers for routes
│   ├── middleware/         # Auth, validation, and rate-limiting middlewares
│   ├── models/             # Mongoose schemas for Users, Trips, and Preferences
│   ├── routes/             # API route definitions
│   ├── index.ts            # Express server entry point
│   ├── package.json        # Backend package configuration
│   └── .env                # Backend local environment variables
├── frontend/               # Frontend React application
│   ├── public/             # Static assets (images, icons)
│   ├── src/                # Frontend source code
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # API clients, Firebase connection, Map utils
│   │   └── App.tsx         # Main frontend entry component
│   ├── package.json        # Frontend package configuration
│   ├── vite.config.ts      # Vite build configuration
│   └── .env                # Frontend local environment variables
├── .gitignore              # Main gitignore
└── README.md               # Project documentation
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
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start backend server
npm run dev
```

## 📜 Scripts

For both Frontend and Backend, standard NPM scripts are available inside their respective directories:
- `npm run dev`: Starts the local development server (Vite for frontend, ts-node-dev for backend).
- `npm run build`: Compiles/builds the project (Vite build for frontend, tsc compilation for backend).

