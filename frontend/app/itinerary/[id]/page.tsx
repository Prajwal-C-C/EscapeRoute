"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Calendar, Clock, Compass, 
  Wallet, Activity, Plane, Train, Car, Bike, Sparkles
} from "lucide-react";

interface TripDetails {
  id: string;
  destination_name: string;
  start_date: string | null;
  end_date: string | null;
  trip_days: number | null;
  travel_mode: string | null;
  status: string | null;
  budget: string | null;
  pace: string | null;
  interests: string[];
}

const TRAVEL_MODE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane className="w-5 h-5" />,
  train: <Train className="w-5 h-5" />,
  car: <Car className="w-5 h-5" />,
  cycle: <Bike className="w-5 h-5" />,
};

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  // Notice we use 'id' here because your folder is named [id]
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch the specific trip using the ID from the URL
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Packing your itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <p className="text-xl font-semibold text-slate-700">{error || "Trip not found"}</p>
        <button 
          onClick={() => router.push('/saved-trips')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Saved Trips
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Section */}
      <div className="bg-[#1e355c] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.push('/saved-trips')}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to trips
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <MapPin className="w-10 h-10 text-blue-400" />
            {trip.destination_name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-blue-100">
            {trip.start_date && trip.end_date && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {trip.trip_days && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{trip.trip_days} Days</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg capitalize">
              <Sparkles className="w-4 h-4" />
              <span>Status: {trip.status || "Planning"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Trip Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                <Wallet className="w-4 h-4" /> Budget Level
              </div>
              <p className="text-lg font-semibold text-slate-800 capitalize">
                {trip.budget || "Not specified"}
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                <Activity className="w-4 h-4" /> Travel Pace
              </div>
              <p className="text-lg font-semibold text-slate-800 capitalize">
                {trip.pace || "Not specified"}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                <Compass className="w-4 h-4" /> Transport
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 capitalize">
                {trip.travel_mode && TRAVEL_MODE_ICONS[trip.travel_mode]}
                {trip.travel_mode || "Not specified"}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-4">Selected Interests</h2>
          {trip.interests && trip.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trip.interests.map((interest, i) => (
                <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No specific interests selected for this trip.</p>
          )}
        </div>
      </div>
    </div>
  );
}