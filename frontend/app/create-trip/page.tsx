"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowRight, ArrowLeft, Sparkles, MapPin, Calendar, Wallet, Zap,
  CheckCircle2, Sun, Moon, Coffee, Plane, Train, Car, Bike,
  Globe, Mountain, Utensils, Camera, Leaf, Heart, Star, Waves,
  Building2, ShoppingBag, Music, TrendingUp, Clock, Users,
  Search, Edit3, Hash, Map, Route, Locate, Navigation,
  CalendarDays, Users2, DollarSign, GitBranch, ArrowLeftRight,
  CircleDot, Circle, X, Loader2
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Location {
  id: string;
  name: string;
  country: string;
  state?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

interface Interest {
  id: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
}

interface TravelStyle {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

type TripType = "one-way" | "round-trip";
type Step = "trip-type" | "destination" | "details" | "interests" | "style" | "review";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "trip-type", label: "Trip Type", icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: "destination", label: "Destination", icon: <MapPin className="w-4 h-4" /> },
  { id: "details", label: "Details", icon: <Calendar className="w-4 h-4" /> },
  { id: "interests", label: "Interests", icon: <Heart className="w-4 h-4" /> },
  { id: "style", label: "Style", icon: <Compass className="w-4 h-4" /> },
  { id: "review", label: "Review", icon: <Sparkles className="w-4 h-4" /> },
];

const INTERESTS: Interest[] = [
  { id: "nature", label: "Nature", icon: <Leaf className="w-6 h-6" />, gradient: "from-emerald-500 to-green-700" },
  { id: "adventure", label: "Adventure", icon: <Mountain className="w-6 h-6" />, gradient: "from-orange-500 to-red-600" },
  { id: "food", label: "Food", icon: <Utensils className="w-6 h-6" />, gradient: "from-amber-500 to-orange-600" },
  { id: "culture", label: "Culture", icon: <Globe className="w-6 h-6" />, gradient: "from-violet-500 to-purple-700" },
  { id: "photography", label: "Photography", icon: <Camera className="w-6 h-6" />, gradient: "from-blue-500 to-cyan-600" },
  { id: "nightlife", label: "Nightlife", icon: <Music className="w-6 h-6" />, gradient: "from-indigo-600 to-purple-800" },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag className="w-6 h-6" />, gradient: "from-pink-500 to-rose-600" },
  { id: "wellness", label: "Wellness", icon: <Heart className="w-6 h-6" />, gradient: "from-teal-500 to-cyan-600" },
  { id: "luxury", label: "Luxury", icon: <Star className="w-6 h-6" />, gradient: "from-yellow-500 to-amber-600" },
  { id: "beaches", label: "Beaches", icon: <Waves className="w-6 h-6" />, gradient: "from-sky-500 to-blue-600" },
];

const TRANSPORT_OPTIONS: TravelStyle[] = [
  { id: "flight", label: "Flights", desc: "Fastest option", icon: <Plane className="w-5 h-5" /> },
  { id: "train", label: "Train", desc: "Scenic routes", icon: <Train className="w-5 h-5" /> },
  { id: "car", label: "Road Trip", desc: "Ultimate freedom", icon: <Car className="w-5 h-5" /> },
  { id: "cycle", label: "Cycling", desc: "Eco-friendly", icon: <Bike className="w-5 h-5" /> },
];

const PACE_OPTIONS: TravelStyle[] = [
  { id: "relaxed", label: "Relaxed", desc: "2–3 spots/day", icon: <Coffee className="w-5 h-5" /> },
  { id: "balanced", label: "Balanced", desc: "4–5 spots/day", icon: <Sun className="w-5 h-5" /> },
  { id: "packed", label: "Go-getter", desc: "6+ spots/day", icon: <Zap className="w-5 h-5" /> },
];

const WAKE_OPTIONS: TravelStyle[] = [
  { id: "early", label: "Early Bird", desc: "Rise at 6–7am", icon: <Sun className="w-5 h-5" /> },
  { id: "mid", label: "Mid-Morning", desc: "Rise at 8–9am", icon: <Coffee className="w-5 h-5" /> },
  { id: "late", label: "Night Owl", desc: "Rise after 10am", icon: <Moon className="w-5 h-5" /> },
];

const BUDGET_LEVELS = [
  { id: "budget", label: "Budget", daily: "$50–100", accom: "Hostels & budget hotels" },
  { id: "comfort", label: "Comfort", daily: "$150–250", accom: "3–4★ hotels" },
  { id: "premium", label: "Premium", daily: "$300–500", accom: "4–5★ boutique" },
  { id: "luxury", label: "Luxury", daily: "$600+", accom: "Villas & 5★ resorts" },
];

// ─── Step Progress ──────────────────────────────────────────────────────────
function StepProgress({ current, onStepClick }: { current: Step; onStepClick: (step: Step) => void }) {
  const currentIndex = STEPS.findIndex(s => s.id === current);

  return (
    <div className="flex items-center justify-between gap-1 md:gap-2">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;
        const isClickable = i <= currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-1 md:gap-2 flex-1">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                ${isActive ? "bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white shadow-lg shadow-[#27788e]/30 scale-105" : ""}
                ${isCompleted ? "bg-teal-50 text-teal-700 hover:bg-teal-100" : ""}
                ${!isActive && !isCompleted ? "bg-slate-100 text-slate-400" : ""}
                ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
            >
              {isCompleted ? <CheckCircle2 className="w-3 h-3 text-teal-500" /> : step.icon}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full transition-all ${
                  i < currentIndex ? "bg-gradient-to-r from-teal-500 to-[#27788e]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Location Search Component ──────────────────────────────────────────────
function LocationSearch({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onSelect,
  icon 
}: { 
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (location: Location) => void;
  icon: React.ReactNode;
}) {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock search - In production, use a real geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResults: Location[] = [
      { id: "1", name: "New York, USA", country: "USA", state: "New York", city: "New York" },
      { id: "2", name: "Los Angeles, USA", country: "USA", state: "California", city: "Los Angeles" },
      { id: "3", name: "London, UK", country: "UK", state: "England", city: "London" },
      { id: "4", name: "Tokyo, Japan", country: "Japan", state: "Tokyo", city: "Tokyo" },
      { id: "5", name: "Paris, France", country: "France", state: "Île-de-France", city: "Paris" },
    ];

    const filtered = mockResults.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.city?.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (value) {
        searchLocations(value);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={suggestionsRef}>
      <label className="block text-slate-700 text-sm font-semibold mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#27788e] focus:ring-2 focus:ring-[#27788e]/20 outline-none transition-all"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                onSelect(loc);
                onChange(loc.name);
                setShowSuggestions(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{loc.name}</p>
                <p className="text-xs text-slate-400">{loc.country}</p>
              </div>
              <div className="text-xs text-slate-400">
                {loc.city}, {loc.state}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Trip Type ──────────────────────────────────────────────────────
function TripTypeStep({ onContinue }: { onContinue: (type: TripType) => void }) {
  const [tripType, setTripType] = useState<TripType>("one-way");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Trip Type</h2>
        <p className="text-slate-500 mt-1">Choose your travel style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setTripType("one-way")}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            tripType === "one-way"
              ? "border-[#27788e] bg-[#27788e]/5 shadow-lg"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <ArrowRight className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="font-bold text-[#1e355c] text-lg">One Way</h3>
          <p className="text-slate-500 text-sm mt-1">Single destination trip</p>
          {tripType === "one-way" && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#27788e] text-white rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Selected
            </div>
          )}
        </button>

        <button
          onClick={() => setTripType("round-trip")}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            tripType === "round-trip"
              ? "border-[#27788e] bg-[#27788e]/5 shadow-lg"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <ArrowLeftRight className="w-7 h-7 text-teal-600" />
          </div>
          <h3 className="font-bold text-[#1e355c] text-lg">Round Trip</h3>
          <p className="text-slate-500 text-sm mt-1">Return to starting point</p>
          {tripType === "round-trip" && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#27788e] text-white rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Selected
            </div>
          )}
        </button>
      </div>

      <button
        onClick={() => onContinue(tripType)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 2: Destination ──────────────────────────────────────────────────────
// ─── Step 2: Destination ──────────────────────────────────────────────────────
function DestinationStep({ 
  onContinue,
  tripType 
}: { 
  onContinue: (data: { from: Location | null; to: Location | null }) => void;
  tripType: TripType;
}) {
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const handleContinue = () => {
    // Only proceed if both locations are selected
    if (fromLocation && toLocation) {
      onContinue({ from: fromLocation, to: toLocation });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Route Details</h2>
        <p className="text-slate-500 mt-1">Enter your {tripType === "round-trip" ? "round trip" : "one way"} route</p>
      </div>

      <div className="space-y-4">
        {/* From Location */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center z-10">
            <CircleDot className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="pl-6">
            <LocationSearch
              label="From"
              placeholder="Enter origin location..."
              value={fromQuery}
              onChange={setFromQuery}
              onSelect={(loc) => {
                setFromLocation(loc);
                setFromQuery(loc.name);
              }}
              icon={<Navigation className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* To Location */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center z-10">
            <Circle className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="pl-6">
            <LocationSearch
              label="To"
              placeholder="Enter destination..."
              value={toQuery}
              onChange={setToQuery}
              onSelect={(loc) => {
                setToLocation(loc);
                setToQuery(loc.name);
              }}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={() => {
            const tempLoc = fromLocation;
            const tempQuery = fromQuery;
            setFromLocation(toLocation);
            setFromQuery(toQuery);
            setToLocation(tempLoc);
            setToQuery(tempQuery);
          }}
          disabled={!fromLocation && !toLocation}
          className={`flex items-center justify-center gap-2 w-full py-2 transition-colors ${
            fromLocation && toLocation 
              ? "text-slate-500 hover:text-[#27788e] cursor-pointer" 
              : "text-slate-300 cursor-not-allowed"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-sm font-medium">Swap Locations</span>
        </button>
      </div>

      <button
        disabled={!fromLocation || !toLocation}
        onClick={handleContinue}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
          ${fromLocation && toLocation
            ? "bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white shadow-lg hover:shadow-xl"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 3: Details ──────────────────────────────────────────────────────────
function DetailsStep({ onContinue }: { onContinue: (d: { 
  startDate: string; 
  endDate: string; 
  duration: number; 
  budget: string;
  isOneDayTrip: boolean;
}) => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [budget, setBudget] = useState("comfort");
  const [isOneDayTrip, setIsOneDayTrip] = useState(false);

  useEffect(() => {
    if (startDate && !endDate) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + duration);
      setEndDate(start.toISOString().split('T')[0]);
    }
  }, [duration, startDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Trip Details</h2>
        <p className="text-slate-500 mt-1">Set your travel preferences</p>
      </div>

      <div className="space-y-4">
        {/* One Day Trip Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#27788e]" />
            <div>
              <p className="font-semibold text-slate-700 text-sm">1 Day Trip</p>
              <p className="text-slate-400 text-xs">Short excursion or day trip</p>
            </div>
          </div>
          <button
            onClick={() => setIsOneDayTrip(!isOneDayTrip)}
            className={`relative w-12 h-6 rounded-full transition-all ${
              isOneDayTrip ? "bg-[#27788e]" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                isOneDayTrip ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {!isOneDayTrip && (
          <>
            {/* Duration */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1e355c]">Duration</h3>
                <div className="text-2xl font-black text-[#1e355c]">
                  {duration}<span className="text-base font-medium text-slate-400 ml-1">days</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 5, 7, 10, 14].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                      ${duration === d
                        ? "bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white shadow-md"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:border-[#27788e] focus:ring-2 focus:ring-[#27788e]/20 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">End Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 focus:border-[#27788e] focus:ring-2 focus:ring-[#27788e]/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 className="font-semibold text-[#1e355c] mb-3">Budget</h3>
          <div className="grid grid-cols-2 gap-2">
            {BUDGET_LEVELS.map((b) => {
              const active = budget === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setBudget(b.id)}
                  className={`p-3 rounded-xl text-left transition-all border-2
                    ${active
                      ? "border-[#14b8a6] bg-teal-50/50 shadow-md"
                      : "border-slate-100 hover:border-slate-200"}`}
                >
                  <div className={`font-semibold text-sm ${active ? "text-[#1e355c]" : "text-slate-600"}`}>{b.label}</div>
                  <div className="text-[#14b8a6] font-semibold text-xs">{b.daily}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => onContinue({ startDate, endDate, duration: isOneDayTrip ? 1 : duration, budget, isOneDayTrip })}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 4: Interests ────────────────────────────────────────────────────────
function InterestsStep({ onContinue }: { onContinue: (interests: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [manualInterest, setManualInterest] = useState("");
  const [customInterests, setCustomInterests] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const addCustomInterest = () => {
    if (manualInterest.trim() && !customInterests.includes(manualInterest.trim())) {
      setCustomInterests([...customInterests, manualInterest.trim()]);
      setSelected([...selected, manualInterest.trim()]);
      setManualInterest("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Your Interests</h2>
        <p className="text-slate-500 mt-1">Select or add your own interests</p>
      </div>

      {/* Custom Interest Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={manualInterest}
            onChange={(e) => setManualInterest(e.target.value)}
            placeholder="Add custom interest..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#27788e] outline-none transition-all"
            onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
          />
        </div>
        <button
          onClick={addCustomInterest}
          disabled={!manualInterest.trim()}
          className="px-6 py-2.5 rounded-xl bg-[#1e355c] text-white font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
        >
          Add
        </button>
      </div>

      {/* Selected Interests Display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {selected.map(id => {
            const preset = INTERESTS.find(i => i.id === id);
            const label = preset?.label || id;
            return (
              <span key={id} className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-[#27788e] rounded-full text-sm font-medium">
                {preset?.icon || <Heart className="w-3 h-3" />}
                {label}
                <button onClick={() => toggle(id)} className="hover:text-red-400 ml-1">✕</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Preset Interests */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {INTERESTS.map((interest) => {
          const active = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className={`relative overflow-hidden rounded-xl p-4 text-center transition-all border-2
                ${active
                  ? "border-[#14b8a6] bg-teal-50/50 shadow-md"
                  : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className={`${active ? "text-[#27788e]" : "text-slate-400"}`}>
                {interest.icon}
              </div>
              <span className={`text-xs font-medium mt-1 block ${active ? "text-[#1e355c]" : "text-slate-500"}`}>
                {interest.label}
              </span>
              {active && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-[#14b8a6] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        disabled={selected.length === 0}
        onClick={() => onContinue(selected)}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
          ${selected.length > 0
            ? "bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white shadow-lg hover:shadow-xl"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
      >
        Continue with {selected.length} interest{selected.length !== 1 ? "s" : ""} <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 5: Style ────────────────────────────────────────────────────────────
function StyleStep({ onContinue }: { onContinue: (style: Record<string, string>) => void }) {
  const [transport, setTransport] = useState("flight");
  const [pace, setPace] = useState("balanced");
  const [wakeUp, setWakeUp] = useState("mid");

  const renderSelector = (options: TravelStyle[], value: string, setter: (v: string) => void) => (
    <div className="grid grid-cols-3 gap-2">
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setter(opt.id)}
            className={`p-3 rounded-xl text-center transition-all border-2
              ${active
                ? "border-[#27788e] bg-[#27788e]/5 shadow-md"
                : "border-slate-100 hover:border-slate-200"}`}
          >
            <div className={`${active ? "text-[#27788e]" : "text-slate-400"}`}>{opt.icon}</div>
            <div className={`font-semibold text-xs mt-1 ${active ? "text-[#1e355c]" : "text-slate-500"}`}>{opt.label}</div>
            <div className="text-slate-400 text-[10px]">{opt.desc}</div>
          </button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Travel Style</h2>
        <p className="text-slate-500 mt-1">How do you like to travel?</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-[#1e355c] text-sm mb-2">Transport</h3>
          {renderSelector(TRANSPORT_OPTIONS, transport, setTransport)}
        </div>
        <div>
          <h3 className="font-semibold text-[#1e355c] text-sm mb-2">Pace</h3>
          {renderSelector(PACE_OPTIONS, pace, setPace)}
        </div>
        <div>
          <h3 className="font-semibold text-[#1e355c] text-sm mb-2">Wake Up</h3>
          {renderSelector(WAKE_OPTIONS, wakeUp, setWakeUp)}
        </div>
      </div>

      <button
        onClick={() => onContinue({ transport, pace, wakeUp })}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 6: Review ──────────────────────────────────────────────────────────
function ReviewStep({ 
  tripType, from, to, details, interests, style, onGenerate 
}: { 
  tripType: TripType;
  from: Location | null;
  to: Location | null;
  details: { startDate: string; endDate: string; duration: number; budget: string; isOneDayTrip: boolean };
  interests: string[];
  style: Record<string, string>;
  onGenerate: () => void;
}) {
  const budgetLabel = BUDGET_LEVELS.find(b => b.id === details.budget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Ready to Go!</h2>
        <p className="text-slate-500 mt-1">Review your trip details before generating</p>
      </div>

      <div className="space-y-4">
        {/* Trip Type */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Trip Type</span>
          <span className="font-semibold text-[#1e355c] capitalize">
            {tripType === "round-trip" ? "Round Trip" : "One Way"}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Route</span>
          <span className="font-semibold text-[#1e355c]">
            {from?.name} → {to?.name}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Duration</span>
          <span className="font-semibold text-[#1e355c]">
            {details.isOneDayTrip ? "1 Day Trip" : `${details.duration} Days`}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Dates</span>
          <span className="font-semibold text-[#1e355c]">
            {new Date(details.startDate).toLocaleDateString()} - {new Date(details.endDate).toLocaleDateString()}
          </span>
        </div>

        {/* Budget */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Budget</span>
          <span className="font-semibold text-[#1e355c]">{budgetLabel?.label || 'Not set'}</span>
        </div>

        {/* Interests */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600 mb-2">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => (
              <span key={interest} className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-700">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600 mb-2">Travel Style</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-700">
              Transport: {style.transport}
            </span>
            <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-700">
              Pace: {style.pace}
            </span>
            <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-700">
              Wake Up: {style.wakeUp}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#27788e] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
      >
        <Sparkles className="w-5 h-5" />
        Generate Itinerary
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// ─── Generating Screen ──────────────────────────────────────────────────────
function GeneratingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 space-y-8"
    >
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[#14b8a6]/30"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-[#1e355c] to-[#27788e] flex items-center justify-center shadow-xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1e355c]">Creating Your Itinerary</h3>
        <p className="text-slate-500 text-sm">Our AI is crafting the perfect trip for you...</p>
      </div>

      <div className="w-64 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span className="font-semibold text-[#14b8a6]">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#14b8a6] to-[#27788e]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateTripPage() {
  const [step, setStep] = useState<Step>("trip-type");
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [details, setDetails] = useState<{ 
    startDate: string; 
    endDate: string; 
    duration: number; 
    budget: string;
    isOneDayTrip: boolean;
  } | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [style, setStyle] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    const steps: Step[] = ["trip-type", "destination", "details", "interests", "style", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["trip-type", "destination", "details", "interests", "style", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (targetStep: Step) => {
    const steps: Step[] = ["trip-type", "destination", "details", "interests", "style", "review"];
    const currentIndex = steps.indexOf(step);
    const targetIndex = steps.indexOf(targetStep);
    if (targetIndex <= currentIndex) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_name: toLocation?.name || "Unknown",
          destination_lat: toLocation?.lat || null,
          destination_lng: toLocation?.lng || null,
          start_date: details?.startDate,
          end_date: details?.endDate,
          trip_days: details?.duration || 1,
          travel_mode: style?.transport || "flight",
          budget: details?.budget || "comfort",
          pace: style?.pace || "balanced",
          wake_up: style?.wakeUp || "mid",
          interests: interests,
          status: "planning",
        }),
      });

      if (!response.ok) throw new Error("Failed to save trip");

      const data = await response.json();
      if (data.trip && data.trip.id) {
        router.push(`/itinerary/${data.trip.id}`);
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
          <GeneratingScreen />
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.id === step);
  const isFirstStep = currentIndex === 0;

  return (
    <div className="min-h-screen bg-[#f8fafb] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e355c] tracking-tight">
            Create Your <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Perfect Trip</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Let AI craft a personalized itinerary just for you</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <StepProgress current={step} onStepClick={handleStepClick} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === "trip-type" && (
              <TripTypeStep
                key="trip-type"
                onContinue={(type) => {
                  setTripType(type);
                  handleContinue();
                }}
              />
            )}
            {step === "destination" && (
              <DestinationStep
                key="destination"
                tripType={tripType}
                onContinue={(d) => {
                  setFromLocation(d.from);
                  setToLocation(d.to);
                  handleContinue();
                }}
              />
            )}
            {step === "details" && (
              <DetailsStep
                key="details"
                onContinue={(d) => {
                  setDetails(d);
                  handleContinue();
                }}
              />
            )}
            {step === "interests" && (
              <InterestsStep
                key="interests"
                onContinue={(i) => {
                  setInterests(i);
                  handleContinue();
                }}
              />
            )}
            {step === "style" && (
              <StyleStep
                key="style"
                onContinue={(s) => {
                  setStyle(s);
                  handleContinue();
                }}
              />
            )}
            {step === "review" && (
              <ReviewStep
                key="review"
                tripType={tripType}
                from={fromLocation}
                to={toLocation}
                details={details!}
                interests={interests}
                style={style!}
                onGenerate={handleGenerate}
              />
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!isFirstStep && step !== "review" && !isGenerating && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="text-xs text-slate-400">
                Step {currentIndex + 1} of {STEPS.length}
              </div>
            </div>
          )}

          {/* Back button on review step */}
          {step === "review" && !isGenerating && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Edit
              </button>
              <div className="text-xs text-slate-400">
                Ready to generate
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}