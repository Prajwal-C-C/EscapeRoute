"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus, MapPin, Calendar, Compass, Clock, ArrowRight,
  TrendingUp, Star, ChevronRight, Route
} from "lucide-react";

const upcomingTrips = [
  {
    id: "1", destination: "Kyoto, Japan", dates: "Jul 14 – Jul 21, 2026", days: 7, status: "confirmed",
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&fit=crop&auto=format",
    attractions: 18, progress: 82,
  },
  {
    id: "2", destination: "Santorini, Greece", dates: "Aug 3 – Aug 9, 2026", days: 6, status: "planning",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format",
    attractions: 11, progress: 40,
  },
];

const savedTrips = [
  { id: "3", destination: "Bali, Indonesia", days: 5, attractions: 14, image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=200&h=150&fit=crop&auto=format" },
  { id: "4", destination: "Paris, France", days: 4, attractions: 22, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=150&fit=crop&auto=format" },
  { id: "5", destination: "Tokyo, Japan", days: 8, attractions: 31, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=150&fit=crop&auto=format" },
];

const recommended = [
  { name: "Amalfi Coast", country: "Italy", rating: 4.8, image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&h=300&fit=crop&auto=format" },
  { name: "Machu Picchu", country: "Peru", rating: 4.9, image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&auto=format" },
  { name: "Maldives", country: "South Asia", rating: 4.9, image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=300&fit=crop&auto=format" },
];

const recentSearches = ["Kyoto temples", "Bali beaches", "Rome restaurants", "Tokyo nightlife"];

const stats = [
  { label: "Trips Planned", value: "12", icon: Compass, color: "#2563eb", bg: "#eff6ff" },
  { label: "Countries Visited", value: "7", icon: MapPin, color: "#14b8a6", bg: "#f0fdfa" },
  { label: "Days Traveled", value: "43", icon: Calendar, color: "#f97316", bg: "#fff7ed" },
  { label: "Attractions Seen", value: "184", icon: Star, color: "#8b5cf6", bg: "#f5f3ff" },
];

export default function DashboardContent() {
  const router = useRouter();
  
  // Grab the session data
  const { data: session, status } = useSession();
  
  // Extract the user's name (Fallback to 'Traveler' if name isn't set yet)
  const userName = session?.user?.name || "Traveler";

  // Show a clean loading state while verifying auth
  if (status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-500">
        Loading your dashboard...
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
            You have 2 upcoming trips. Time to explore
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
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
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

      {/* Upcoming Trips Section */}
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
                <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${trip.status === "confirmed" ? "bg-green-500 text-white" : "bg-orange-400 text-white"}`}>
                    {trip.status === "confirmed" ? "Confirmed" : "Planning"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4">
                  <h3 className="text-white font-bold text-base">{trip.destination}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <Calendar className="w-3.5 h-3.5" /> {trip.dates}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <Clock className="w-3.5 h-3.5" /> {trip.days} days
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-xs">Planning progress</span>
                    <span className="text-slate-700 text-xs font-semibold">{trip.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${trip.progress}%` }} />
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

      {/* Recent Searches & Saved Trips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Searches */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold">Recent Searches</h3>
            <button className="text-sm text-blue-600 font-semibold">Clear</button>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {recentSearches.map(search => (
              <li key={search} className="rounded-2xl bg-slate-50 px-4 py-3 flex items-center justify-between">
                <span>{search}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </li>
            ))}
          </ul>
        </div>

        {/* Saved Trips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold">Saved Trips</h3>
            <button onClick={() => router.push("/saved-trips")} className="text-sm text-blue-600 font-semibold">
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedTrips.map(trip => (
              <div key={trip.id} className="rounded-3xl overflow-hidden bg-slate-50">
                <img src={trip.image} alt={trip.destination} className="w-full h-28 object-cover" />
                <div className="p-3">
                  <h4 className="text-slate-900 font-semibold text-sm">{trip.destination}</h4>
                  <p className="text-slate-500 text-xs">{trip.days} days · {trip.attractions} attractions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
