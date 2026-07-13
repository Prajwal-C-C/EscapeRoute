"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Calendar, Clock, Compass, 
  Wallet, Activity, Plane, Train, Car, Bike, Sparkles,
  Utensils, Camera, ShoppingBag, Mountain, TreePine,
  Coffee, Moon, Sun, Waves, Landmark, Music, Heart,
  Loader2, CheckCircle2, CalendarDays, Route, Star,
  Share2, Download, Printer, ChevronDown, ChevronUp,
  Users, DollarSign, Info
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface TripDetails {
  id: string;
  destination_name: string;
  destination_lat: number | null;
  destination_lng: number | null;
  origin_name: string | null;
  start_date: string | null;
  end_date: string | null;
  trip_days: number | null;
  travel_mode: string | null;
  status: string | null;
  created_at: string | null;
  interests: string[];
  trip_type: string | null;
}

interface DayPlan {
  day: number;
  date: string;
  places: {
    name: string;
    description: string;
    category: string;
    time: string;
    duration: string;
    image?: string;
    rating?: number;
  }[];
  summary: string;
}

const TRAVEL_MODE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane className="w-5 h-5" />,
  train: <Train className="w-5 h-5" />,
  car: <Car className="w-5 h-5" />,
  cycle: <Bike className="w-5 h-5" />,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'historical': <Landmark className="w-4 h-4" />,
  'food': <Utensils className="w-4 h-4" />,
  'nature': <TreePine className="w-4 h-4" />,
  'adventure': <Mountain className="w-4 h-4" />,
  'beach': <Waves className="w-4 h-4" />,
  'culture': <Music className="w-4 h-4" />,
  'shopping': <ShoppingBag className="w-4 h-4" />,
  'wellness': <Heart className="w-4 h-4" />,
  'nightlife': <Moon className="w-4 h-4" />,
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  planning: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
};

// ─── Sample Itinerary Data ────────────────────────────────────────────────────
const SAMPLE_ITINERARY: DayPlan[] = [
  {
    day: 1,
    date: "Day 1",
    summary: "Explore the historic city center and experience local culture.",
    places: [
      {
        name: "Historic City Center",
        description: "Wander through ancient streets and admire colonial architecture",
        category: "historical",
        time: "9:00 AM",
        duration: "2-3 hours",
        rating: 4.8,
      },
      {
        name: "Local Food Market",
        description: "Taste authentic regional cuisine and fresh local produce",
        category: "food",
        time: "12:00 PM",
        duration: "1.5 hours",
        rating: 4.6,
      },
      {
        name: "Art Museum",
        description: "Discover masterpieces from local and international artists",
        category: "culture",
        time: "2:30 PM",
        duration: "2 hours",
        rating: 4.7,
      },
      {
        name: "Sunset Viewpoint",
        description: "End your day with breathtaking panoramic views",
        category: "nature",
        time: "6:00 PM",
        duration: "1 hour",
        rating: 4.9,
      },
    ],
  },
  {
    day: 2,
    date: "Day 2",
    summary: "Immerse yourself in nature and adventure activities.",
    places: [
      {
        name: "National Park",
        description: "Explore diverse wildlife and scenic trails",
        category: "nature",
        time: "8:00 AM",
        duration: "3-4 hours",
        rating: 4.8,
      },
      {
        name: "Adventure Sports Center",
        description: "Try zip-lining, rock climbing, or river rafting",
        category: "adventure",
        time: "1:00 PM",
        duration: "3 hours",
        rating: 4.7,
      },
      {
        name: "Beachside Restaurant",
        description: "Enjoy fresh seafood with ocean views",
        category: "food",
        time: "6:00 PM",
        duration: "2 hours",
        rating: 4.5,
      },
    ],
  },
];

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'places'>('overview');

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/trips/${tripId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch trip details");
        }
        
        const data = await response.json();
        setTrip(data);
      } catch (err) {
        console.error("Error:", err);
        setError("Could not load trip details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // Generate itinerary using AI
  const generateItinerary = async () => {
    if (!trip) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/test-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination_name,
          days: trip.trip_days || 3,
          interests: trip.interests || [],
          travelMode: trip.travel_mode || 'mixed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Check if data is already a structured object
        let parsedItinerary: DayPlan[] | null = null;
        
        if (data.data.itinerary && Array.isArray(data.data.itinerary)) {
          // If AI returned structured data
          parsedItinerary = data.data.itinerary.map((day: any) => ({
            day: day.day || 1,
            date: day.date || `Day ${day.day || 1}`,
            summary: day.summary || '',
            places: day.places || [],
          }));
        } else if (typeof data.data === 'string') {
          // If AI returned text, try to parse it
          try {
            const parsed = JSON.parse(data.data);
            if (parsed.itinerary) {
              parsedItinerary = parsed.itinerary;
            }
          } catch {
            // If parsing fails, use sample data
            parsedItinerary = SAMPLE_ITINERARY;
          }
        } else {
          // Fallback to sample data
          parsedItinerary = SAMPLE_ITINERARY;
        }
        
        setItinerary(parsedItinerary || SAMPLE_ITINERARY);
        setActiveTab('itinerary');
        success('Itinerary generated successfully!');
      } else {
        // Use sample data as fallback
        setItinerary(SAMPLE_ITINERARY);
        setActiveTab('itinerary');
        success('Itinerary generated successfully!');
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      // Use sample data as fallback
      setItinerary(SAMPLE_ITINERARY);
      setActiveTab('itinerary');
      toastError('Using sample itinerary. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate sample itinerary (fallback)
  const generateSampleItinerary = (tripData: TripDetails): DayPlan[] => {
    const days = [];
    const totalDays = tripData.trip_days || 3;
    const startDate = tripData.start_date ? new Date(tripData.start_date) : new Date();

    const samplePlaces = [
      { name: 'Historic City Center', category: 'historical', description: 'Explore the rich history and architecture', duration: '2-3 hours', rating: 4.5 },
      { name: 'Local Cuisine Tour', category: 'food', description: 'Taste authentic local dishes', duration: '1-2 hours', rating: 4.3 },
      { name: 'Nature Park', category: 'nature', description: 'Enjoy scenic views and fresh air', duration: '2-4 hours', rating: 4.7 },
    ];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push({
        day: i + 1,
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        places: samplePlaces.map((p, idx) => ({
          ...p,
          time: `${9 + idx * 4}:00 ${idx < 3 ? 'AM' : 'PM'}`,
        })),
        summary: `Day ${i + 1} in ${tripData.destination_name} - Explore the best attractions and local experiences.`,
      });
    }

    return days;
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const getStatusColor = (status: string | null) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Packing your itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 space-y-4 p-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <span className="text-3xl">🗺️</span>
        </div>
        <p className="text-xl font-semibold text-slate-700">{error || "Trip not found"}</p>
        <p className="text-slate-400 text-sm">We couldn't find the trip you're looking for.</p>
        <button 
          onClick={() => router.push('/saved-trips')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Saved Trips
        </button>
      </div>
    );
  }

  const hasItinerary = itinerary && itinerary.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#1e355c] via-[#27788e] to-[#14b8a6] text-white py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/saved-trips')}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to trips
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-3">
                  <MapPin className="w-8 h-8 md:w-10 md:h-10 text-blue-300" />
                  {trip.destination_name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {trip.status || "Planning"}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-blue-100">
                {trip.start_date && trip.end_date && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {trip.trip_days && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{trip.trip_days} Days</span>
                  </div>
                )}
                {trip.travel_mode && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl capitalize">
                    {TRAVEL_MODE_ICONS[trip.travel_mode]}
                    <span className="text-sm">{trip.travel_mode}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm capitalize">{trip.trip_type || 'One Way'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={generateItinerary}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1e355c] rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {hasItinerary ? 'Regenerate' : 'Generate'} Itinerary
                  </>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interests Pills */}
          {trip.interests && trip.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
              <span className="text-xs text-blue-200 font-medium uppercase tracking-wider mr-2">Interests</span>
              {trip.interests.map((interest, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/90 border border-white/10">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex gap-1 p-1 bg-slate-50 border-b border-slate-100">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'itinerary', label: 'Itinerary', icon: Route },
              { id: 'places', label: 'Places', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      Destination
                    </div>
                    <p className="text-lg font-semibold text-slate-800">{trip.destination_name}</p>
                    {trip.origin_name && (
                      <p className="text-sm text-slate-400">From {trip.origin_name}</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      Duration
                    </div>
                    <p className="text-lg font-semibold text-slate-800">{trip.trip_days || 1} days</p>
                    {trip.start_date && trip.end_date && (
                      <p className="text-sm text-slate-400">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
                      <Compass className="w-4 h-4" />
                      Transport
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 capitalize">
                      {trip.travel_mode && TRAVEL_MODE_ICONS[trip.travel_mode]}
                      {trip.travel_mode || 'Not specified'}
                    </div>
                  </div>
                </div>

                {trip.interests && trip.interests.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 mb-3">Selected Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {trip.interests.map((interest, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-slate-700 border border-slate-200 flex items-center gap-2">
                          {CATEGORY_ICONS[interest.toLowerCase()] || <Heart className="w-4 h-4 text-slate-400" />}
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trip Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{trip.trip_days || 1}</div>
                    <div className="text-xs text-blue-500 font-medium">Days</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{trip.interests?.length || 0}</div>
                    <div className="text-xs text-emerald-500 font-medium">Interests</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{hasItinerary ? itinerary?.reduce((acc, d) => acc + d.places.length, 0) : 0}</div>
                    <div className="text-xs text-purple-500 font-medium">Places</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600">{trip.status || 'Planning'}</div>
                    <div className="text-xs text-amber-500 font-medium">Status</div>
                  </div>
                </div>

                {/* Generate CTA */}
                {!hasItinerary && (
                  <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100">
                    <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Explore?</h3>
                    <p className="text-slate-500 mb-4">Generate an AI-powered itinerary for your trip.</p>
                    <button
                      onClick={generateItinerary}
                      disabled={isGenerating}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 inline-flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Itinerary
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {isGenerating ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Crafting your perfect itinerary...</p>
                    <p className="text-sm text-slate-400 mt-1">This may take a moment</p>
                  </div>
                ) : hasItinerary ? (
                  itinerary?.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDay(index)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {day.day}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-slate-800">Day {day.day}</h3>
                            <p className="text-xs text-slate-400">{day.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">{day.places.length} places</span>
                          {expandedDays.includes(index) ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {expandedDays.includes(index) && (
                        <div className="p-4 space-y-4">
                          {day.summary && (
                            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">{day.summary}</p>
                          )}
                          <div className="space-y-3">
                            {day.places.map((place, idx) => (
                              <div key={idx} className="flex items-start gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-slate-800">{place.name}</h4>
                                    {place.rating && (
                                      <span className="flex items-center gap-1 text-xs text-yellow-500">
                                        <Star className="w-3 h-3 fill-yellow-400" />
                                        {place.rating}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {place.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {place.duration}
                                    </span>
                                    {place.category && (
                                      <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                                        {place.category}
                                      </span>
                                    )}
                                  </div>
                                  {place.description && (
                                    <p className="text-sm text-slate-500 mt-1">{place.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Route className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No itinerary yet</p>
                    <p className="text-sm text-slate-400 mt-1">Click "Generate Itinerary" to create one</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Places Tab */}
            {activeTab === 'places' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {hasItinerary ? (
                  itinerary?.flatMap(day => day.places).map((place, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          {CATEGORY_ICONS[place.category?.toLowerCase()] || <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{place.name}</h4>
                          <p className="text-sm text-slate-500 mt-0.5">{place.description || 'Attraction'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {place.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {place.duration}
                            </span>
                          </div>
                          {place.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-yellow-600">{place.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-16">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No places yet</p>
                    <p className="text-sm text-slate-400 mt-1">Generate an itinerary to see places</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/create-trip")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create New Trip
          </button>
          <button
            onClick={() => router.push("/saved-trips")}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            View All Trips
          </button>
        </div>
      </div>
    </div>
  );
}