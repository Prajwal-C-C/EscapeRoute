'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, MapPin, Calendar, Plane, Train, Car, Bike, Bus,
  Trash2, Sparkles, ChevronRight, Compass
} from 'lucide-react';

interface Trip {
  id: string;
  destination_name: string;
  destination_lat: number | null;
  destination_lng: number | null;
  origin_name: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  start_date: string | null;
  end_date: string | null;
  trip_days: number | null;
  travel_mode: string | null;
  status: string | null;
  created_at: string | null;
  interests: string[];
  trip_type: string | null;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  planning: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
};

const TRAVEL_MODE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane className="w-4 h-4" />,
  train: <Train className="w-4 h-4" />,
  car: <Car className="w-4 h-4" />,
  bike: <Bike className="w-4 h-4" />,
  cycle: <Bike className="w-4 h-4" />,
  bus: <Bus className="w-4 h-4" />,
};

const TRAVEL_MODE_LABELS: Record<string, string> = {
  flight: 'Flight',
  train: 'Train',
  car: 'Car',
  bike: 'Bike',
  cycle: 'Bike',
  bus: 'Bus',
};

function getTravelModeDisplay(mode: string | null) {
  const normalized = (mode || '').trim().toLowerCase();

  if (!normalized) {
    return { label: 'Not selected', icon: null };
  }

  const key = normalized === 'cycle' ? 'bike' : normalized;

  return {
    label: TRAVEL_MODE_LABELS[key] || normalized.replace(/-/g, ' '),
    icon: TRAVEL_MODE_ICONS[key] || null,
  };
}

export default function SavedTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trips');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      setTrips(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load your trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTrips();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchTrips]);

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      setTrips(trips.filter(trip => trip.id !== tripId));
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const getStatusColor = (status: string | null) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Something went wrong</h3>
          <p className="text-slate-500 mt-2">{error}</p>
          <button
            onClick={fetchTrips}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[#1e355c] tracking-tight">
                My Saved Trips
              </h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                {trips.length}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              {trips.length === 0 
                ? "No trips planned yet! Time to start exploring." 
                : `You have ${trips.length} trip${trips.length > 1 ? 's' : ''} planned`}
            </p>
          </div>
          <button
            onClick={() => router.push('/create-trip')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Plan New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No trips yet</h3>
            <p className="text-slate-500 mb-6">Start planning your next adventure today!</p>
            <button
              onClick={() => router.push('/create-trip')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Trip Card Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-[#1e355c] truncate flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        {trip.destination_name || 'Untitled Trip'}
                      </h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {trip.status || 'Draft'}
                        </span>
                        {trip.trip_days && (
                          <span className="flex items-center gap-1 text-slate-500 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {trip.trip_days} days
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-6 space-y-4">
                  {/* Dates & Travel Mode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dates</p>
                      <p className="text-sm text-slate-700">
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}
                        {' -> '}
                        {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Travel Mode</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const travelMode = getTravelModeDisplay(trip.travel_mode);
                          return travelMode.icon ? (
                            <>
                              {travelMode.icon}
                              <span className="text-sm text-slate-700">{travelMode.label}</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">{travelMode.label}</span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  {trip.interests && trip.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {trip.interests.slice(0, 5).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                        {trip.interests.length > 5 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            +{trip.interests.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Created At */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Created {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                    <button
                      onClick={() => router.push(`/itinerary/${trip.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1e355c] text-white rounded-xl text-sm font-medium hover:bg-[#27788e] transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
