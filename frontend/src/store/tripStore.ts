import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import api from '../lib/api';
import type { ChatMessage, FlightOption, HotelOption, PlanEvent } from '../data/mocks';
import { INITIAL_CHAT } from '../data/mocks';

interface TravelContext {
  origin: string;
  destination: string;
  dates: string;
  vibe: string;
  numDays: number;
}

interface TripState {
  // Persisted state
  messages: ChatMessage[];
  travelContext: TravelContext;
  dynamicFlights: FlightOption[];
  dynamicHotels: HotelOption[];
  selectedFlight: FlightOption | null;
  selectedHotel: HotelOption | null;
  itinerary: Record<number, PlanEvent[]>;
  currentDay: number;

  // Transient state
  isThinking: boolean;
  thinkingActivity: string | undefined;
  isGeneratingPlan: boolean;
  isSavingTrip: boolean;
  isLoadingSession: boolean;
  activeMongoId: string | null;
  isNewTripModalOpen: boolean;

  // Actions
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setTravelContext: (ctx: Partial<TravelContext>) => void;
  setDynamicFlights: (flights: FlightOption[]) => void;
  setDynamicHotels: (hotels: HotelOption[]) => void;
  setSelectedFlight: (flight: FlightOption | null) => void;
  setSelectedHotel: (hotel: HotelOption | null) => void;
  setItinerary: (itinerary: Record<number, PlanEvent[]>) => void;
  setCurrentDay: (day: number) => void;
  setIsThinking: (isThinking: boolean) => void;
  setThinkingActivity: (activity: string | undefined) => void;
  setIsGeneratingPlan: (isGenerating: boolean) => void;
  setIsSavingTrip: (isSaving: boolean) => void;
  setIsNewTripModalOpen: (open: boolean) => void;
  triggerNewTripFlow: () => void;
  
  loadActiveTrip: () => Promise<void>;
  saveActiveTrip: () => Promise<void>;
  resetSession: () => Promise<void>;
  clearLocalSession: () => void;
}

export const useTripStore = create<TripState>()(
  subscribeWithSelector((set, get) => ({
    messages: [], 
    travelContext: { origin: '', destination: '', dates: '', vibe: '', numDays: 3 },
    dynamicFlights: [],
    dynamicHotels: [],
    selectedFlight: null,
    selectedHotel: null,
    itinerary: {},
    currentDay: 1,

    isThinking: false,
    thinkingActivity: undefined,
    isGeneratingPlan: false,
    isSavingTrip: false,
    isLoadingSession: true,
    activeMongoId: null,
    isNewTripModalOpen: false,

    setMessages: (updater) => set((state) => ({ messages: typeof updater === 'function' ? updater(state.messages) : updater })),
    setTravelContext: (ctx) => set((state) => ({ travelContext: { ...state.travelContext, ...ctx } })),
    setDynamicFlights: (dynamicFlights) => set({ dynamicFlights }),
    setDynamicHotels: (dynamicHotels) => set({ dynamicHotels }),
    setSelectedFlight: (selectedFlight) => set({ selectedFlight }),
    setSelectedHotel: (selectedHotel) => set({ selectedHotel }),
    setItinerary: (itinerary) => set({ itinerary }),
    setCurrentDay: (currentDay) => set({ currentDay }),
    setIsThinking: (isThinking) => set({ isThinking }),
    setThinkingActivity: (thinkingActivity) => set({ thinkingActivity }),
    setIsGeneratingPlan: (isGeneratingPlan) => set({ isGeneratingPlan }),
    setIsSavingTrip: (isSavingTrip) => set({ isSavingTrip }),
    setIsNewTripModalOpen: (isNewTripModalOpen) => set({ isNewTripModalOpen }),

    triggerNewTripFlow: () => {
      const state = get();
      const hasContent = (state.messages && state.messages.length > 1) ||
                         Object.keys(state.itinerary || {}).length > 0 ||
                         state.selectedFlight !== null ||
                         state.selectedHotel !== null;
      if (hasContent) {
        set({ isNewTripModalOpen: true });
      } else {
        get().resetSession();
      }
    },

    loadActiveTrip: async () => {
      set({ isLoadingSession: true });
      try {
        const { data } = await api.get('/trips/active');
        if (data) {
          const mappedMessages: ChatMessage[] = (data.chatHistory || []).map((msg: any, i: number) => ({
            id: i.toString(),
            sender: msg.role === 'user' ? 'user' : 'ai',
            text: msg.content,
            timestamp: msg.timestamp || 'Now'
          }));

          set({
            activeMongoId: data._id,
            messages: mappedMessages.length > 0 ? mappedMessages : INITIAL_CHAT,
            travelContext: {
              origin: data.origin || '',
              destination: data.destination || '',
              dates: data.dates || '',
              vibe: data.vibe || '',
              numDays: Math.min(data.numDays || (data.itineraryJson ? Object.keys(data.itineraryJson).length : 3), 7)
            },
            dynamicFlights: data.flightOptions || [],
            dynamicHotels: data.hotelOptions || [],
            selectedFlight: data.selectedFlight || null,
            selectedHotel: data.selectedHotel || null,
            itinerary: data.itineraryJson || {},
            currentDay: data.currentDay || 1,
            isLoadingSession: false
          });
        } else {
          set({
            activeMongoId: null,
            messages: INITIAL_CHAT,
            travelContext: { origin: '', destination: '', dates: '', vibe: '', numDays: 3 },
            dynamicFlights: [],
            dynamicHotels: [],
            selectedFlight: null,
            selectedHotel: null,
            itinerary: {},
            currentDay: 1,
            isLoadingSession: false
          });
        }
      } catch (error) {
        console.error('Failed to load active trip', error);
        set({
          activeMongoId: null,
          messages: INITIAL_CHAT,
          isLoadingSession: false
        });
      }
    },

    saveActiveTrip: async () => {
      const state = get();
      if (state.isLoadingSession) return;

      const payload = {
        chatHistory: state.messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
          timestamp: m.timestamp
        })),
        origin: state.travelContext.origin,
        destination: state.travelContext.destination,
        dates: state.travelContext.dates,
        vibe: state.travelContext.vibe,
        numDays: state.travelContext.numDays,
        flightOptions: state.dynamicFlights,
        hotelOptions: state.dynamicHotels,
        selectedFlight: state.selectedFlight,
        selectedHotel: state.selectedHotel,
        itineraryJson: state.itinerary,
        currentDay: state.currentDay,
      };

      try {
        const { data } = await api.put('/trips/active', payload);
        if (data && data._id && !state.activeMongoId) {
            set({ activeMongoId: data._id });
        }
      } catch (error) {
        console.warn('Failed to save active trip silently', error);
      }
    },

    resetSession: async () => {
      try {
        await api.delete('/trips/active');
      } catch (e) {
        console.warn('Failed to delete active trip from backend', e);
      }
      set({
        activeMongoId: null,
        messages: INITIAL_CHAT,
        travelContext: { origin: '', destination: '', dates: '', vibe: '', numDays: 3 },
        dynamicFlights: [],
        dynamicHotels: [],
        selectedFlight: null,
        selectedHotel: null,
        itinerary: {},
        currentDay: 1,
        isNewTripModalOpen: false,
      });
    },

    clearLocalSession: () => {
      set({
        activeMongoId: null,
        messages: INITIAL_CHAT,
        travelContext: { origin: '', destination: '', dates: '', vibe: '', numDays: 3 },
        dynamicFlights: [],
        dynamicHotels: [],
        selectedFlight: null,
        selectedHotel: null,
        itinerary: {},
        currentDay: 1,
      });
    }
  }))
);

let saveTimeout: any;

export const flushActiveTripSave = () => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
        useTripStore.getState().saveActiveTrip();
    }
}

useTripStore.subscribe(
  (state) => ({
    messages: state.messages,
    travelContext: state.travelContext,
    dynamicFlights: state.dynamicFlights,
    dynamicHotels: state.dynamicHotels,
    selectedFlight: state.selectedFlight,
    selectedHotel: state.selectedHotel,
    itinerary: state.itinerary,
    currentDay: state.currentDay,
  }),
  (newState, oldState) => {
    if (JSON.stringify(newState) !== JSON.stringify(oldState)) {
      const { isLoadingSession } = useTripStore.getState();
      if (!isLoadingSession) {
          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            useTripStore.getState().saveActiveTrip();
          }, 2000);
      }
    }
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
);
