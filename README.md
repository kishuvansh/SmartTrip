# SmartTrip - Dynamic Travel Orchestration

SmartTrip is an AI-powered travel planning application that transforms natural language queries into comprehensive, dynamic travel itineraries. By leveraging advanced AI models and interactive mapping, SmartTrip provides an end-to-end, intent-first travel planning experience.

## ✨ Key Features

- **AI-Driven Travel Context Extraction:** A smart chatbot interface that understands user travel intent from natural language queries.
- **Real-Time Option Generation:** Uses the Groq API to dynamically generate real-time flight and hotel options based on user preferences.
- **Dynamic Itinerary Construction:** Automatically creates detailed, multi-day travel itineraries.
- **Interactive Mapping:** Visualizes the journey with accurate geocoordinates rendered on a MapLibre/MapTiler interface.
- **Modern & Responsive UI:** Built with React, Tailwind CSS, and Framer Motion for a stunning, fluid user experience.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 & Framer Motion
- **Icons:** Lucide React
- **Mapping:** MapLibre GL
- **AI Integration:** Groq API

## 🚀 How It Works

1. **User Input:** The user inputs their desired travel plans or ideas into the chat interface (e.g., "Plan a 5-day trip to Tokyo focusing on food and culture").
2. **Intent Parsing:** The AI processes the query, extracting key travel context such as destination, dates, preferences, and constraints.
3. **Data Generation:** Orbit interfaces with the Groq API to fetch relevant flight, hotel, and activity options in real-time.
4. **Itinerary Assembly:** A structured, day-by-day itinerary is dynamically constructed, complete with geographical data.
5. **Visualization:** The itinerary is presented to the user alongside an interactive map (MapLibre), plotting all key locations and routes for the trip.

## 📦 Installation & Setup

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone <https://github.com/kishuvansh/SmartTrip>
cd Orbit-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your necessary API keys (e.g., Groq API key, MapTiler key):
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_MAP_API_KEY=your_map_api_key_here
```

### 4. Start the Development Server
```bash
npm run dev
```
The application will now be running on `http://localhost:5173`.

## 📜 Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Compiles TypeScript and builds the application for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build for local preview.
