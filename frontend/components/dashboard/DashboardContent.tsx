"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus, MapPin, Calendar, Compass, Clock, ArrowRight,
  TrendingUp, Star, ChevronRight, Route, Search, X
} from "lucide-react";

interface Trip {
  id: string;
  destination_name: string;
  start_date: string | null;
  end_date: string | null;
  trip_days: number | null;
  travel_mode: string | null;
  status: string | null;
  created_at: string | null;
  budget: string | null;
  pace: string | null;
  wake_up: string | null;
  interests: string[];
  origin_name: string | null;
}

interface SearchHistory {
  id: string;
  search_query: string;
  searched_at: string;
}

interface DashboardStats {
  totalTrips: number;
  countriesVisited: number;
  totalDays: number;
  totalAttractions: number;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  planning: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
};

export default function DashboardContent() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    countriesVisited: 0,
    totalDays: 0,
    totalAttractions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const userName = session?.user?.name || "Traveler";

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trips
        const tripsResponse = await fetch('/api/trips');
        if (!tripsResponse.ok) throw new Error('Failed to fetch trips');
        const tripsData = await tripsResponse.json();
        setTrips(tripsData);

        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch search history
        await fetchSearchHistory();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch search history
  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      if (!response.ok) throw new Error('Failed to fetch search history');
      const data = await response.json();
      setSearchHistory(data);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  // Add a new search
  const addSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) return;

    try {
      const response = await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        await fetchSearchHistory(); // Refresh the list
      }
    } catch (error) {
      console.error('Error adding search:', error);
    }
  };

  // Clear all searches
  const clearSearches = async () => {
    try {
      const response = await fetch('/api/search-history', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Error clearing searches:', error);
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearch(searchQuery);
      router.push(`/create-trip?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  // Handle click on recent search
  const handleRecentSearchClick = (query: string) => {
    addSearch(query);
    router.push(`/create-trip?search=${encodeURIComponent(query)}`);
  };

  const getStatusColor = (status: string | null) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  };

  // Get upcoming trips (status: planning or confirmed)
  const upcomingTrips = trips
    .filter(trip => trip.status === 'planning' || trip.status === 'confirmed')
    .slice(0, 2);

  // Get saved trips
  const savedTrips = trips
    .filter(trip => trip.status !== 'planning' && trip.status !== 'confirmed')
    .slice(0, 3);

  const displaySavedTrips = savedTrips.length >= 3 ? savedTrips : trips.slice(0, 3);

  // Get recommended destinations
  const recommendedDestinations = trips.length > 0 
    ? trips.slice(0, 3).map(trip => ({
        name: trip.destination_name || 'Unknown',
        country: trip.destination_name?.split(',').pop()?.trim() || 'Unknown',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format'
      }))
    : [
        { name: "Amalfi Coast", country: "Italy", rating: 4.8, image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&h=300&fit=crop&auto=format" },
        { name: "Machu Picchu", country: "Peru", rating: 4.9, image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&auto=format" },
        { name: "Maldives", country: "South Asia", rating: 4.9, image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=300&fit=crop&auto=format" },
      ];

  const statsData = [
    { label: "Trips Planned", value: stats.totalTrips.toString(), icon: Compass, color: "#2563eb", bg: "#eff6ff" },
    { label: "Countries Visited", value: stats.countriesVisited.toString(), icon: MapPin, color: "#14b8a6", bg: "#f0fdfa" },
    { label: "Days Traveled", value: stats.totalDays.toString(), icon: Calendar, color: "#f97316", bg: "#fff7ed" },
    { label: "Attractions Seen", value: stats.totalAttractions.toString(), icon: Star, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-500">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 font-extrabold text-2xl lg:text-3xl tracking-tight">
            Welcome, {userName}
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            You have {upcomingTrips.length} upcoming trip{upcomingTrips.length !== 1 ? 's' : ''}. Time to explore!
          </p>
        </div>
        <button 
          onClick={() => router.push("/create-trip")} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Plan New Trip
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-slate-900 font-extrabold text-2xl">{value}</div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for destinations, trips, or interests..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Upcoming Trips Section */}
      {upcomingTrips.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 font-bold text-lg">Upcoming Trips</h2>
            <button onClick={() => router.push("/saved-trips")} className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingTrips.map(trip => (
              <div key={trip.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40">
                  <img 
                    src={`https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format`} 
                    alt={trip.destination_name || 'Trip'} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                      {trip.status || "Planning"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-white font-bold text-base">{trip.destination_name || 'Untitled Trip'}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}
                      {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                      <Clock className="w-3.5 h-3.5" /> {trip.trip_days || 1} days
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 text-xs">Planning progress</span>
                      <span className="text-slate-700 text-xs font-semibold">{trip.status === 'confirmed' ? '100' : '40'}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: trip.status === 'confirmed' ? '100%' : '40%' }} />
                    </div>
                  </div>
                  <button onClick={() => router.push(`/itinerary/${trip.id}`)} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 py-2.5 rounded-xl transition-all font-semibold text-sm">
                    View Itinerary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Searches & Saved Trips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Searches */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold">Recent Searches</h3>
            {searchHistory.length > 0 && (
              <button 
                onClick={clearSearches}
                className="text-sm text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          {searchHistory.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {searchHistory.map((search) => (
                <li 
                  key={search.id} 
                  onClick={() => handleRecentSearchClick(search.search_query)}
                  className="rounded-2xl bg-slate-50 px-4 py-3 flex items-center justify-between hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span>{search.search_query}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent searches</p>
              <p className="text-xs mt-1">Search for destinations to see them here</p>
            </div>
          )}
        </div>

        {/* Saved Trips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold">Saved Trips</h3>
            <button onClick={() => router.push("/saved-trips")} className="text-sm text-blue-600 font-semibold">
              View all
            </button>
          </div>
          {displaySavedTrips.length > 0 ? (
            <div className="space-y-3">
              {displaySavedTrips.map(trip => (
                <button key={trip.id} onClick={() => router.push(`/itinerary/${trip.id}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=150&fit=crop&auto=format" 
                      alt={trip.destination_name || 'Trip'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 truncate font-semibold text-sm">{trip.destination_name || 'Untitled Trip'}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-slate-500 text-xs">
                      <span>{trip.trip_days || 1} days</span>
                      <span>•</span>
                      <span>{trip.status || 'Draft'}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No saved trips yet</p>
              <button onClick={() => router.push("/create-trip")} className="mt-2 text-blue-600 font-semibold text-sm">
                Create your first trip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Destinations Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 font-bold text-lg">Recommended for You</h2>
          <button onClick={() => router.push("/create-trip")} className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
            See more <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recommendedDestinations.map((dest) => (
            <button key={dest.name} onClick={() => router.push("/create-trip")} className="group relative rounded-2xl overflow-hidden h-48 text-left w-full">
              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base">{dest.name}</h3>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-slate-300 text-xs">{dest.country}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs font-semibold">{dest.rating}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}