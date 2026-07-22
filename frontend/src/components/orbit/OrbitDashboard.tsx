import { useState, useEffect } from 'react';
import { OrbitLayout } from './OrbitLayout';
import { ChatInterface } from './ChatInterface';
import { CityMap } from './CityMap';
import { Timeline } from './Timeline';
import { NewTripModal } from './NewTripModal';
import type { ChatMessage, FlightOption, HotelOption } from '../../data/mocks';
import { generateChatResponse, generateFlights, generateHotels, generateItinerary, extractTravelContext } from '../../lib/ai';
import type { AIChatMessage } from '../../lib/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrips } from '../../hooks/useTrips';
import { useTripStore, flushActiveTripSave } from '../../store/tripStore';

export const OrbitDashboard = () => {
    const { saveTrip } = useTrips();
    const [isSavingTripUI, setIsSavingTripUI] = useState(false);

    const {
        messages, setMessages,
        isThinking, setIsThinking,
        thinkingActivity, setThinkingActivity,
        currentDay, setCurrentDay,
        isGeneratingPlan, setIsGeneratingPlan,
        dynamicFlights, setDynamicFlights,
        dynamicHotels, setDynamicHotels,
        itinerary, setItinerary,
        selectedFlight, setSelectedFlight,
        selectedHotel, setSelectedHotel,
        travelContext, setTravelContext,
        isLoadingSession, loadActiveTrip, clearLocalSession,
        triggerNewTripFlow
    } = useTripStore();

    useEffect(() => {
        loadActiveTrip();
        return () => {
            flushActiveTripSave();
        };
    }, []);

    // Computed
    const showDashboard = Object.keys(itinerary).length > 0;
    const activePlan = showDashboard ? (itinerary[currentDay] || []) : [];
    const totalDays = Object.keys(itinerary).length || 4;

    if (isLoadingSession) {
        return (
            <div className="h-screen w-full bg-[#00050A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orbit-700 border-t-accent-500 rounded-full animate-spin" />
            </div>
        );
    }

    const addAIMessage = (text: string, options?: FlightOption[] | HotelOption[], optionType?: 'flight' | 'hotel') => {
        const msg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'ai',
            text,
            timestamp: 'Just now',
            options,
            optionType
        };
        setMessages(prev => [...prev, msg]);
    };

    const advanceConversation = async (userText: string) => {
        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: userText,
            timestamp: 'Now'
        };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setIsThinking(true);

        try {
            // Build AI prompt from conversation history
            const aiMessages: AIChatMessage[] = updatedMessages.map(m => ({
                role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
                content: m.text
            }));

            const aiData = await generateChatResponse(aiMessages);
            setIsThinking(false);

            if (aiData.action === 'show_flights') {
                // Extract travel context from conversation using a simple AI call
                setThinkingActivity("Analyzing your travel preferences...");
                setIsThinking(true);

                try {
                    // Extract context from the conversation
                    const convMessages: AIChatMessage[] = updatedMessages.map(m => ({
                        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
                        content: m.text
                    }));

                    const ctx = await extractTravelContext(convMessages);
                    
                    setTravelContext({
                        origin: ctx.origin || 'Delhi',
                        destination: ctx.destination || 'Goa',
                        dates: ctx.dates || 'Next week',
                        vibe: ctx.vibe || 'Relaxed',
                        numDays: Math.min(ctx.numDays && ctx.numDays > 0 ? ctx.numDays : 3, 7),
                    });

                    // Now generate flights
                    setThinkingActivity("Scanning global flight databases...");
                    const flights = await generateFlights(
                        ctx.origin || 'Delhi',
                        ctx.destination || 'Goa',
                        ctx.dates || 'Next week'
                    );
                    setDynamicFlights(flights);

                    setIsThinking(false);
                    setThinkingActivity(undefined);

                    addAIMessage(
                        aiData.text || `I've found ${flights.length} great flights from ${ctx.origin} to ${ctx.destination}. Pick one!`,
                        flights,
                        'flight'
                    );
                } catch (err) {
                    console.error("Flight generation error:", err);
                    setIsThinking(false);
                    setThinkingActivity(undefined);
                    addAIMessage("I had trouble finding flights. Let me try a different approach — could you confirm your origin and destination cities?");
                }
            } else {
                addAIMessage(aiData.text);
            }
        } catch (error) {
            setIsThinking(false);
            setThinkingActivity(undefined);
            console.error("AI Error:", error);
            addAIMessage("Sorry, I encountered an error connecting to my core systems. Please try again.");
        }
    };

    const handleSendMessage = (text: string) => {
        advanceConversation(text);
    };

    const handleSelectOption = async (optionId: string, type: 'flight' | 'hotel') => {
        setIsThinking(true);

        if (type === 'flight') {
            const flight = dynamicFlights.find(f => f.id === optionId);
            if (!flight) { setIsThinking(false); return; }

            setSelectedFlight(flight);
            setThinkingActivity("Curating hotel options for your destination...");

            try {
                const hotels = await generateHotels(
                    travelContext.destination || 'Goa',
                    travelContext.vibe || 'Relaxed'
                );
                setDynamicHotels(hotels);

                setIsThinking(false);
                setThinkingActivity(undefined);

                addAIMessage(
                    `${flight.airline} confirmed! Now for your stay — here are the best hotels I found in ${travelContext.destination}.`,
                    hotels as unknown as FlightOption[],
                    'hotel'
                );
            } catch (err) {
                console.error("Hotel generation error:", err);
                setIsThinking(false);
                setThinkingActivity(undefined);
                addAIMessage("I had trouble finding hotels. Please try again.");
            }

        } else {
            const hotel = dynamicHotels.find(h => h.id === optionId);
            if (!hotel) { setIsThinking(false); return; }

            const currentFlight = selectedFlight;
            setSelectedHotel(hotel);
            setThinkingActivity("Finalizing your perfect itinerary...");

            addAIMessage(`Excellent! ${hotel.name} confirmed. Generating your full itinerary now...`);

            setIsThinking(false);
            setThinkingActivity(undefined);

            setTimeout(async () => {
                setIsGeneratingPlan(true);

                try {
                    const plan = await generateItinerary(
                        travelContext.origin || 'Delhi',
                        travelContext.destination || 'Goa',
                        currentFlight!,
                        hotel,
                        travelContext.numDays || 3,
                        travelContext.vibe || 'Relaxed'
                    );
                    setItinerary(plan);
                    setIsGeneratingPlan(false);
                } catch (err) {
                    console.error("Itinerary generation error:", err);
                    setIsGeneratingPlan(false);
                    addAIMessage("I had trouble generating the itinerary. Let me try again...");
                }
            }, 500);
        }
    };

    const handleSaveTrip = async () => {
        setIsSavingTripUI(true);
        try {
            await saveTrip({
                destination: travelContext.destination || 'Unknown Destination',
                origin: travelContext.origin || 'Unknown Origin',
                dates: travelContext.dates || 'Unknown Dates',
                itineraryJson: itinerary,
                selectedFlight: selectedFlight || undefined,
                selectedHotel: selectedHotel || undefined
            });
            clearLocalSession();
            alert("Trip saved successfully!");
        } catch (error) {
            console.error("Failed to save trip", error);
            alert("Failed to save trip");
        } finally {
            setIsSavingTripUI(false);
        }
    };

    const handleSwapTrigger = async (_id: string) => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: "I want to see other flight options.",
            timestamp: 'Now'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);
        setThinkingActivity("Retrieving alternative flights...");

        try {
            const flights = await generateFlights(
                travelContext.origin || 'Delhi',
                travelContext.destination || 'Goa',
                travelContext.dates || 'Next week'
            );
            setDynamicFlights(flights);
            setIsThinking(false);
            setThinkingActivity(undefined);
            addAIMessage("Here are some alternative flights I found:", flights, 'flight');
        } catch {
            setIsThinking(false);
            setThinkingActivity(undefined);
            addAIMessage("Sorry, I couldn't fetch alternative flights right now.");
        }
    };

    return (
        <>
            <OrbitLayout
                chatPanel={
                    <ChatInterface
                        messages={messages}
                        isThinking={isThinking}
                        thinkingText={thinkingActivity}
                        onSendMessage={handleSendMessage}
                        onSelectOption={handleSelectOption}
                        onNewTrip={triggerNewTripFlow}
                    />
                }
                dashboardPanel={
                    <div className="h-full p-6 md:p-10 overflow-y-auto relative">
                        <AnimatePresence mode="wait">
                            {isGeneratingPlan ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-orbit-950/80 backdrop-blur-sm z-50 text-center"
                                >
                                    <div className="relative w-24 h-24 mb-8">
                                        <div className="absolute inset-0 rounded-full border-2 border-orbit-700 opacity-20" />
                                        <div className="absolute inset-0 rounded-full border-t-2 border-accent-500 animate-spin" />
                                        <div className="absolute inset-4 rounded-full border-2 border-orbit-600 opacity-20" />
                                        <div className="absolute inset-4 rounded-full border-r-2 border-accent-400 animate-spin-reverse-slow" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white tracking-widest uppercase animate-pulse">
                                        Constructing Itinerary
                                    </h3>
                                    <div className="mt-4 flex flex-col gap-1 text-xs font-mono text-text-muted">
                                        <span className="text-accent-400">&gt;&gt; Analyzing flight vectors...</span>
                                        <span className="opacity-0 animate-fadeIn delay-700" style={{ animationDelay: '1s' }}>&gt;&gt; Locking hotel coordinates...</span>
                                        <span className="opacity-0 animate-fadeIn delay-1000" style={{ animationDelay: '2s' }}>&gt;&gt; Synchronizing transit paths...</span>
                                    </div>
                                </motion.div>
                            ) : showDashboard ? (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="max-w-4xl mx-auto space-y-8"
                                >
                                    {/* Dashboard Header */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-display font-bold text-white mb-2">
                                                Trip to {travelContext.destination || 'Your Destination'}
                                            </h2>
                                            <p className="text-text-secondary">
                                                {totalDays} Days • {selectedFlight?.airline} + {selectedHotel?.name}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <button
                                                onClick={triggerNewTripFlow}
                                                className="bg-orbit-800 hover:bg-orbit-700 text-white font-medium py-1.5 px-4 rounded-full border border-orbit-600 transition-all flex items-center gap-1.5 text-sm"
                                            >
                                                <span>+ New Trip</span>
                                            </button>
                                            <button
                                                onClick={handleSaveTrip}
                                                disabled={isSavingTripUI}
                                                className="bg-white text-black hover:bg-orbit-200 font-bold py-1.5 px-4 rounded-full transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                            >
                                                {isSavingTripUI ? (
                                                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <span>Save Trip</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* City Navigation Map */}
                                    <CityMap events={activePlan} currentDay={currentDay} />

                                    {/* Detailed Timeline */}
                                    <div>
                                        <h3 className="text-xl font-display font-semibold text-white mb-6">Itinerary Details</h3>
                                        <Timeline
                                            events={activePlan}
                                            currentDay={currentDay}
                                            totalDays={totalDays}
                                            onSelectDay={setCurrentDay}
                                            onSwap={handleSwapTrigger}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center opacity-30"
                                >
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-orbit-700 mb-6 animate-spin-slow" />
                                    <h3 className="text-2xl font-display font-bold text-white">Awaiting Mission Parameters</h3>
                                    <p className="max-w-md mt-2 text-text-muted">
                                        Your live dashboard will activate once we finalize your travel vector.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                }
            />
            <NewTripModal />
        </>
    );
};
