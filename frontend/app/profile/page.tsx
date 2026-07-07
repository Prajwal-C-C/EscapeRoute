"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, MapPin, Calendar, Compass, Star, 
  Settings, LogOut, Camera, Edit3, Save, X,
  Globe, Plane, Heart, Award, TrendingUp, Clock,
  CheckCircle2, ArrowRight, Shield, CreditCard,
  Bell, Moon, Sun, Palette, Languages,
  Bookmark, Loader2, Trash2, ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/useConfirm";

interface UserStats {
  totalTrips: number;
  countriesVisited: number;
  totalDays: number;
  totalAttractions: number;
  favoriteDestinations: string[];
  tripsCompleted: number;
}

interface Trip {
  id: string;
  destination_name: string;
  start_date: string | null;
  end_date: string | null;
  trip_days: number | null;
  travel_mode: string | null;
  status: string | null;
  created_at: string | null;
  interests: string[];
  image?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { success, error, warning } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    totalTrips: 0,
    countriesVisited: 0,
    totalDays: 0,
    totalAttractions: 0,
    favoriteDestinations: [],
    tripsCompleted: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    location: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'settings'>('trips');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD ($)');
  const [notifications, setNotifications] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userName = session?.user?.name || "Traveler";
  const userEmail = session?.user?.email || "traveler@example.com";
  const userImage = session?.user?.image || "";

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            username: data.username || "",
            bio: "Passionate traveler exploring the world one destination at a time.",
            location: "Earth",
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsStatsLoading(true);
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        error('Failed to load statistics');
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        if (response.ok) {
          const data = await response.json();
          setTrips(data);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        error('Failed to load your trips');
      }
    };

    fetchTrips();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
        }),
      });

      if (response.ok) {
        await update();
        setIsEditing(false);
        error('Profile updated successfully');
      } else {
        const err = await response.json();
        error(err.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    warning('Image upload functionality coming soon');
  };

  const handleDeleteTrip = async (tripId: string) => {
    const confirmed = await confirm({
      title: "Delete Trip",
      message: "Are you sure you want to delete this trip? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    setIsDeleting(tripId);
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrips(trips.filter(trip => trip.id !== tripId));
        success('Trip deleted successfully');
        
        const statsResponse = await fetch('/api/user/stats');
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setUserStats(data);
        }
      } else {
        const err = await response.json();
        error(err.error || 'Failed to delete trip');
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      error('Failed to delete trip');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;
    
    warning('Account deletion feature coming soon');
  };

  const viewTripDetails = (tripId: string) => {
    router.push(`/itinerary/${tripId}`);
  };

  const stats = [
    { label: "Trips Planned", value: userStats.totalTrips, icon: Compass, color: "from-blue-500 to-blue-600" },
    { label: "Countries Visited", value: userStats.countriesVisited, icon: Globe, color: "from-emerald-500 to-emerald-600" },
    { label: "Days Traveled", value: userStats.totalDays, icon: Clock, color: "from-orange-500 to-orange-600" },
    { label: "Attractions Seen", value: userStats.totalAttractions, icon: Star, color: "from-purple-500 to-purple-600" },
  ];

  const getStatusColor = (status: string | null) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      planning: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-purple-100 text-purple-700',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getRandomImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop&auto=format',
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
          >
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-end px-6">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 text-sm font-medium border border-white/20"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleImageUpload}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3 max-w-md">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg font-bold"
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        placeholder="Username"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" /> Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{userName}</h1>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {userEmail}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {formData.location}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mt-2 max-w-2xl">{formData.bio}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          Member since 2026
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {userStats.totalTrips} trips planned
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2 ml-auto">
                  <button
                    onClick={() => router.push("/saved-trips")}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" /> Saved Trips
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
          >
            {isStatsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl mb-2" />
                  <div className="h-8 bg-slate-200 rounded w-16 mb-1" />
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </div>
              ))
            ) : (
              stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
            {[
              { id: 'overview' as const, label: 'Overview', icon: Compass },
              { id: 'trips' as const, label: 'Recent Trips', icon: Plane },
              { id: 'settings' as const, label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Achievements */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "First Trip", icon: Compass, achieved: userStats.totalTrips > 0 },
                      { label: "Country Explorer", icon: Globe, achieved: userStats.countriesVisited > 1 },
                      { label: "Adventure Seeker", icon: Plane, achieved: userStats.totalDays > 5 },
                      { label: "Star Collector", icon: Star, achieved: userStats.totalAttractions > 10 },
                    ].map((achievement) => {
                      const IconComponent = achievement.icon;
                      return (
                        <div key={achievement.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            achievement.achieved ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {achievement.achieved ? <CheckCircle2 className="w-4 h-4" /> : <IconComponent className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-slate-800">{achievement.label}</div>
                            <div className={`text-xs ${achievement.achieved ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {achievement.achieved ? 'Achieved' : 'In Progress'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Favorite Destinations */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Favorite Destinations
                  </h3>
                  {userStats.favoriteDestinations.length > 0 ? (
                    <div className="space-y-2">
                      {userStats.favoriteDestinations.map((dest, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span className="font-medium text-slate-800">{dest}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No favorite destinations yet</p>
                      <p className="text-xs mt-1">Start exploring to discover your favorites</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'trips' && (
              <motion.div
                key="trips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                {trips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.map((trip) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div 
                          className="relative h-48 cursor-pointer"
                          onClick={() => viewTripDetails(trip.id)}
                        >
                          <img
                            src={trip.image || getRandomImage()}
                            alt={trip.destination_name || 'Trip'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                              {trip.status || "Draft"}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="font-bold text-lg">{trip.destination_name || 'Untitled Trip'}</h4>
                            <p className="text-white/80 text-sm">
                              {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}
                              {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{trip.trip_days || 1} days</span>
                              {trip.interests && trip.interests.length > 0 && (
                                <span className="text-xs text-slate-400">
                                  • {trip.interests.length} interests
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => viewTripDetails(trip.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteTrip(trip.id)}
                                disabled={isDeleting === trip.id}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                {isDeleting === trip.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800">No trips yet</h3>
                    <p className="text-slate-500 text-sm mt-2">Start planning your next adventure</p>
                    <button
                      onClick={() => router.push("/create-trip")}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Trip
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Appearance */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-500" />
                      Appearance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-sm font-medium text-slate-700">Theme</span>
                        <button
                          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm hover:border-blue-300 transition-colors"
                        >
                          {theme === 'light' ? (
                            <>
                              <Sun className="w-4 h-4 text-yellow-500" />
                              Light
                            </>
                          ) : (
                            <>
                              <Moon className="w-4 h-4 text-slate-700" />
                              Dark
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-500" />
                      Preferences
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-sm font-medium text-slate-700">Language</span>
                        <button
                          onClick={() => {
                            const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];
                            const currentIndex = languages.indexOf(language);
                            const nextIndex = (currentIndex + 1) % languages.length;
                            setLanguage(languages[nextIndex]);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm hover:border-blue-300 transition-colors"
                        >
                          <Languages className="w-4 h-4" />
                          {language}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-sm font-medium text-slate-700">Currency</span>
                        <button
                          onClick={() => {
                            const currencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'JPY (¥)'];
                            const currentIndex = currencies.indexOf(currency);
                            const nextIndex = (currentIndex + 1) % currencies.length;
                            setCurrency(currencies[nextIndex]);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm hover:border-blue-300 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          {currency}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-sm font-medium text-slate-700">Notifications</span>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            notifications ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                              notifications ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button 
                        onClick={() => warning('Change password feature coming soon')}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-700">Change Password</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button 
                        onClick={() => warning('Two-Factor Authentication coming soon')}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-700">Two-Factor Authentication</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button 
                        onClick={() => warning('Export data feature coming soon')}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-700">Export Data</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button 
                        onClick={handleDeleteAccount}
                        className="flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-red-600">Delete Account</span>
                        <ArrowRight className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Confirm Dialog Component */}
      {ConfirmDialogComponent}
    </>
  );
}