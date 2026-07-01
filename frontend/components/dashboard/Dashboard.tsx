"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
  Plus,
  Star,
  TrendingUp,
} from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { Sidebar } from "./Sidebar";

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

export default function Dashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    countriesVisited: 0,
    totalDays: 0,
    totalAttractions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches] = useState(["Kyoto temples", "Bali beaches", "Rome restaurants", "Tokyo nightlife"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const tripsResponse = await fetch('/api/trips');
        if (!tripsResponse.ok) throw new Error('Failed to fetch trips');
        const tripsData = await tripsResponse.json();
        setTrips(tripsData);

        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string | null) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  };

  const upcomingTrips = trips
    .filter(trip => trip.status === 'planning' || trip.status === 'confirmed')
    .slice(0, 2);

  const savedTrips = trips
    .filter(trip => trip.status !== 'planning' && trip.status !== 'confirmed')
    .slice(0, 3);

  const displaySavedTrips = savedTrips.length >= 3 ? savedTrips : trips.slice(0, 3);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-64">
        <DashboardHeader userName="Sarah" />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-slate-900 font-extrabold text-3xl">Welcome, Sarah</h1>
              <p className="text-slate-500 mt-0.5 text-sm sm:text-base">
                You have {upcomingTrips.length} upcoming trip{upcomingTrips.length !== 1 ? 's' : ''}. Time to explore!
              </p>
            </div>
            <button
              onClick={() => router.push("/create-trip")}
              className="flex items-center gap-2 bg-[#2563eb] text-white px-5 py-2.5 rounded-xl hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-100 font-bold text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" /> Plan New Trip
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-slate-900 font-extrabold text-3xl">{value}</div>
                <div className="text-slate-500 text-xs sm:text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>

          {upcomingTrips.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 font-bold text-lg">Upcoming Trips</h2>
                <button onClick={() => router.push("/saved-trips")} className="flex items-center gap-1 text-[#2563eb] text-sm font-semibold">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40">
                      <Image 
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format" 
                        alt={trip.destination_name || 'Trip'} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw" 
                        className="object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                          {trip.status || "Planning"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4">
                        <h3 className="text-white font-bold text-lg">{trip.destination_name || 'Untitled Trip'}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}
                        {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm">
                          <Clock className="w-3.5 h-3.5" /> {trip.trip_days || 1} days
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-500 text-xs">Planning progress</span>
                          <span className="text-slate-700 text-xs font-semibold">{trip.status === 'confirmed' ? '100' : '40'}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2563eb] rounded-full transition-all" style={{ width: trip.status === 'confirmed' ? '100%' : '40%' }} />
                        </div>
                      </div>
                      <button onClick={() => router.push(`/itinerary/${trip.id}`)} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#2563eb] py-2.5 rounded-xl transition-all font-semibold text-sm">
                        View Itinerary <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-slate-900 mb-4 font-bold">Recent Searches</h2>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <button key={search} onClick={() => router.push("/create-trip")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Compass className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{search}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 font-bold">Saved Trips</h2>
                <button onClick={() => router.push("/saved-trips")} className="text-[#2563eb] text-xs sm:text-sm font-semibold">View all</button>
              </div>
              {displaySavedTrips.length > 0 ? (
                <div className="space-y-3">
                  {displaySavedTrips.map((trip) => (
                    <button key={trip.id} onClick={() => router.push(`/itinerary/${trip.id}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image 
                          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=150&fit=crop&auto=format" 
                          alt={trip.destination_name || 'Trip'} 
                          fill 
                          sizes="56px" 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900 truncate font-semibold text-sm sm:text-base">{trip.destination_name || 'Untitled Trip'}</div>
                        <div className="flex items-center gap-3 mt-0.5 text-slate-500 text-xs sm:text-sm">
                          <span>{trip.trip_days || 1} days</span>
                          <span>|</span>
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

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-900 font-bold text-lg">Recommended for You</h2>
              <button onClick={() => router.push("/create-trip")} className="flex items-center gap-1 text-[#2563eb] text-sm font-semibold">
                See more <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {recommendedDestinations.map((dest) => (
                <button key={dest.name} onClick={() => router.push("/create-trip")} className="group relative rounded-2xl overflow-hidden h-48 text-left w-full">
                  <Image src={dest.image} alt={dest.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold">{dest.name}</h3>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-slate-300 text-xs sm:text-sm">{dest.country}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-xs sm:text-sm font-semibold">{dest.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}