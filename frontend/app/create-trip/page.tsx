"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowRight, ArrowLeft, Sparkles, MapPin, Calendar,
  CheckCircle2, Plane, Train, Car, Bike, Bus,
  Clock, Edit3, Navigation, CalendarDays, 
  ArrowLeftRight, CircleDot, Circle, Loader2,
  AlertCircle, DollarSign, Users
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

interface TravelStyle {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  costPerKm?: number;
  speedKmh?: number;
}

type TripType = "one-way" | "round-trip";
type Step = "trip-type" | "destination" | "details" | "style" | "review";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "trip-type", label: "Trip Type", icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: "destination", label: "Destination", icon: <MapPin className="w-4 h-4" /> },
  { id: "details", label: "Details", icon: <Calendar className="w-4 h-4" /> },
  { id: "style", label: "Transport", icon: <Compass className="w-4 h-4" /> },
  { id: "review", label: "Review", icon: <Sparkles className="w-4 h-4" /> },
];

const TRANSPORT_OPTIONS: TravelStyle[] = [
  { id: "flight", label: "Flight", desc: "Fastest option", icon: <Plane className="w-5 h-5" />, costPerKm: 0.12, speedKmh: 800 },
  { id: "train", label: "Train", desc: "Scenic routes", icon: <Train className="w-5 h-5" />, costPerKm: 0.04, speedKmh: 120 },
  { id: "bus", label: "Bus", desc: "Budget friendly", icon: <Bus className="w-5 h-5" />, costPerKm: 0.03, speedKmh: 90 },
  { id: "car", label: "Car", desc: "Fuel estimate", icon: <Car className="w-5 h-5" />, costPerKm: 0.08, speedKmh: 80 },
  { id: "bike", label: "Bike", desc: "Fuel estimate", icon: <Bike className="w-5 h-5" />, costPerKm: 0.04, speedKmh: 60 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
}

function generateUniqueKey(item: any, index: number): string {
  const props = item.properties || {};
  const candidates = [
    props.place_id,
    props.osm_id,
    `${props.lat}_${props.lon}`,
    `result_${index}`,
  ];
  const key = candidates.find(c => c !== null && c !== undefined);
  return key ? String(key) : `fallback_${index}_${Date.now()}`;
}

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

// ─── Location Search Component with Geoapify ──────────────────────────────
function LocationSearch({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  icon,
  error,
  initialQuery,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (location: Location) => void;
  icon: React.ReactNode;
  error?: string;
  initialQuery?: string;
}) {
  const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-search if initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2 && !hasAutoSearched) {
      setHasAutoSearched(true);
      // Trigger the search
      searchLocations(initialQuery);
      // Set the value
      onChange(initialQuery);
      // Show suggestions
      setShowSuggestions(true);
    }
  }, [initialQuery]);

  const searchLocations = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&limit=10&apiKey=${API_KEY}`
      );

      const data = await response.json();

      const results: Location[] = (data.features || []).map(
        (item: any, index: number) => {
          const coords = item.geometry?.coordinates || [];
          const lng = coords[0] || null;
          const lat = coords[1] || null;

          return {
            id: generateUniqueKey(item, index),
            name: item.properties?.formatted || item.properties?.name || query,
            city: item.properties?.city || item.properties?.town || item.properties?.village || "",
            state: item.properties?.state || "",
            country: item.properties?.country || "",
            lat: lat,
            lng: lng,
          };
        }
      );

      setSuggestions(results);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && !initialQuery) {
        searchLocations(value);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showError = touched && error && !value;

  return (
    <div className="relative" ref={suggestionsRef}>
      <label className="block text-slate-700 text-sm font-semibold mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTouched(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 outline-none transition-all ${
            showError
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200 focus:border-[#27788e]"
          }`}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {showError && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border bg-white shadow-xl">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => {
                onSelect(loc);
                onChange(loc.name);
                setShowSuggestions(false);
                setTouched(true);
              }}
              className="flex w-full gap-3 px-4 py-3 hover:bg-slate-50 text-left"
            >
              <MapPin className="mt-1 h-4 w-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 truncate">
                  {loc.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {[loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
                </p>
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Trip Type</h2>
        <p className="text-slate-500 mt-1">Choose your travel style</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setTripType("one-way")} className={`p-6 rounded-2xl border-2 text-center transition-all ${tripType === "one-way" ? "border-[#27788e] bg-[#27788e]/5 shadow-lg" : "border-slate-200"}`}>
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3"><ArrowRight className="w-7 h-7 text-blue-600" /></div>
          <h3 className="font-bold text-[#1e355c] text-lg">One Way</h3>
          <p className="text-slate-500 text-sm mt-1">Single destination trip</p>
          {tripType === "one-way" && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#27788e] text-white rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" /> Selected
            </div>
          )}
        </button>
        <button onClick={() => setTripType("round-trip")} className={`p-6 rounded-2xl border-2 text-center transition-all ${tripType === "round-trip" ? "border-[#27788e] bg-[#27788e]/5 shadow-lg" : "border-slate-200"}`}>
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3"><ArrowLeftRight className="w-7 h-7 text-teal-600" /></div>
          <h3 className="font-bold text-[#1e355c] text-lg">Round Trip</h3>
          <p className="text-slate-500 text-sm mt-1">Return to starting point</p>
          {tripType === "round-trip" && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#27788e] text-white rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" /> Selected
            </div>
          )}
        </button>
      </div>
      <button onClick={() => onContinue(tripType)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 2: Destination ──────────────────────────────────────────────────────
function DestinationStep({ 
  onContinue, 
  tripType, 
  initialFrom, 
  initialTo,
  searchQuery 
}: { 
  onContinue: (data: { from: Location | null; to: Location | null }) => void; 
  tripType: TripType;
  initialFrom?: Location | null;
  initialTo?: Location | null;
  searchQuery?: string | null;
}) {
  const [fromLocation, setFromLocation] = useState<Location | null>(initialFrom || null);
  const [toLocation, setToLocation] = useState<Location | null>(initialTo || null);
  const [fromQuery, setFromQuery] = useState(initialFrom?.name || "");
  const [toQuery, setToQuery] = useState(initialTo?.name || "");
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({});

  // Auto-fill destination with search query if provided
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2 && !toQuery) {
      setToQuery(searchQuery);
      // Trigger search for the query
      // The LocationSearch component will handle the search
    }
  }, [searchQuery]);

  const validate = () => {
    const newErrors: { from?: string; to?: string } = {};
    if (!fromLocation) newErrors.from = "Please select a starting location";
    if (!toLocation) newErrors.to = "Please select a destination";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate() && fromLocation && toLocation) {
      onContinue({ from: fromLocation, to: toLocation });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Route Details</h2>
        <p className="text-slate-500 mt-1">Enter your {tripType === "round-trip" ? "round trip" : "one way"} route</p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center z-10"><CircleDot className="w-3.5 h-3.5 text-white" /></div>
          <div className="pl-6">
            <LocationSearch 
              label={tripType === "round-trip" ? "Starting Point" : "From"} 
              placeholder="Enter origin location..." 
              value={fromQuery} 
              onChange={setFromQuery} 
              onSelect={(loc) => { setFromLocation(loc); setFromQuery(loc.name); }} 
              icon={<Navigation className="w-4 h-4" />}
              error={errors.from}
            />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center z-10"><Circle className="w-3.5 h-3.5 text-white" /></div>
          <div className="pl-6">
            <LocationSearch 
              label={tripType === "round-trip" ? "Destination (Return Trip)" : "To"} 
              placeholder="Enter destination..." 
              value={toQuery} 
              onChange={setToQuery} 
              onSelect={(loc) => { setToLocation(loc); setToQuery(loc.name); }} 
              icon={<MapPin className="w-4 h-4" />}
              error={errors.to}
              initialQuery={searchQuery || undefined}
            />
          </div>
        </div>
      </div>
      <button 
        disabled={!fromLocation || !toLocation} 
        onClick={handleContinue} 
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all ${fromLocation && toLocation ? "bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white shadow-lg hover:shadow-xl" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 3: Details ──────────────────────────────────────────────────────────
function DetailsStep({ onContinue, initialDetails }: { 
  onContinue: (d: { startDate: string; endDate: string; duration: number; isOneDayTrip: boolean }) => void;
  initialDetails?: { startDate: string; endDate: string; duration: number; isOneDayTrip: boolean };
}) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(initialDetails?.startDate || today);
  const [endDate, setEndDate] = useState(initialDetails?.endDate || "");
  const [duration, setDuration] = useState(initialDetails?.duration || 1);
  const [isOneDayTrip, setIsOneDayTrip] = useState(initialDetails?.isOneDayTrip || false);
  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string }>({});

  useEffect(() => {
    if (startDate && endDate && !isOneDayTrip) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays);
    } else if (isOneDayTrip) {
      setDuration(1);
    }
  }, [startDate, endDate, isOneDayTrip]);

  const validate = () => {
    const newErrors: { startDate?: string; endDate?: string } = {};
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate && !isOneDayTrip) newErrors.endDate = "End date is required";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue({ 
        startDate, 
        endDate: isOneDayTrip ? startDate : endDate, 
        duration: isOneDayTrip ? 1 : duration, 
        isOneDayTrip 
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Trip Details</h2>
        <p className="text-slate-500 mt-1">Set your travel dates</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#27788e]" />
            <div><p className="font-semibold text-slate-700 text-sm">1 Day Trip</p></div>
          </div>
          <button 
            onClick={() => { 
              setIsOneDayTrip(!isOneDayTrip); 
              if (!isOneDayTrip) {
                setEndDate(startDate);
                setDuration(1);
              }
            }} 
            className={`relative w-12 h-6 rounded-full transition-all ${isOneDayTrip ? "bg-[#27788e]" : "bg-slate-300"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${isOneDayTrip ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">Start Date <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={startDate} 
                min={today} 
                onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(""); }} 
                className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 outline-none transition-all ${
                  errors.startDate ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#27788e]"
                }`}
              />
            </div>
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">End Date {!isOneDayTrip && <span className="text-red-500">*</span>}</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={endDate} 
                min={startDate || today} 
                disabled={isOneDayTrip}
                onChange={(e) => setEndDate(e.target.value)} 
                className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 outline-none transition-all ${
                  isOneDayTrip ? "bg-slate-50 cursor-not-allowed" : ""
                } ${
                  errors.endDate ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#27788e]"
                }`}
              />
            </div>
            {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
          </div>
        </div>
        {!isOneDayTrip && duration > 0 && (
          <div className="text-center p-2 bg-blue-50 rounded-xl">
            <p className="text-sm text-slate-600">Duration: <span className="font-bold text-[#1e355c]">{duration} day{duration > 1 ? "s" : ""}</span></p>
          </div>
        )}
      </div>
      <button 
        onClick={handleContinue} 
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 4: Style & Cost Estimate ────────────────────────────────────────────
function StyleStep({ 
  onContinue, origin, destination, originCountry, initialTransport
}: { 
  onContinue: (style: Record<string, string>) => void;
  origin: Location | null; destination: Location | null; originCountry: string;
  initialTransport?: string;
}) {
  const [transport, setTransport] = useState(initialTransport || "flight");
  const [recommendedMode, setRecommendedMode] = useState("flight");
  const [hasUserSelectedTransport, setHasUserSelectedTransport] = useState(Boolean(initialTransport));
  const [travelTimes, setTravelTimes] = useState<Record<string, string>>({});
  const [travelCosts, setTravelCosts] = useState<Record<string, {min: number, max: number}>>({});
  const [distance, setDistance] = useState<number | null>(null);

  const CURRENCY_MAP: Record<string, string> = {
    "USA": "$", "United States": "$", "India": "₹", "UK": "£", "United Kingdom": "£", 
    "France": "€", "Germany": "€", "Japan": "¥", "Australia": "A$"
  };
  const symbol = CURRENCY_MAP[originCountry] || "$";
  const rateMultiplier = symbol === "₹" ? 83 : (symbol === "€" ? 0.9 : (symbol === "£" ? 0.8 : 1));

  useEffect(() => {
    if (origin?.lat && origin?.lng && destination?.lat && destination?.lng) {
      const dist = getDistanceInKm(origin.lat, origin.lng, destination.lat, destination.lng);
      setDistance(dist);
      
      const formatTime = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return h === 0 ? `${m}m` : `${h}h ${m}m`;
      };

      const times: Record<string, string> = {};
      const costs: Record<string, {min: number, max: number}> = {};
      
      TRANSPORT_OPTIONS.forEach(opt => {
        const timeHours = dist / (opt.speedKmh || 100) + (opt.id === "flight" ? 2 : 0.5);
        times[opt.id] = formatTime(timeHours);
        
        const baseCost = dist * (opt.costPerKm || 0.05) * rateMultiplier;
        costs[opt.id] = { 
          min: Math.round(baseCost * 0.8), 
          max: Math.round(baseCost * 1.2) 
        };
      });

      setTravelTimes(times);
      setTravelCosts(costs);

      // Smart recommendation based on distance
      const recommended = dist < 50 ? "bike" : dist < 200 ? "car" : dist < 600 ? "train" : "flight";
      setRecommendedMode(recommended);

      if (!hasUserSelectedTransport && !initialTransport) {
        setTransport(recommended);
      }
    }
  }, [origin, destination, initialTransport, hasUserSelectedTransport]);

  useEffect(() => {
    if (initialTransport) {
      setTransport(initialTransport);
      setHasUserSelectedTransport(true);
    }
  }, [initialTransport]);

  const handleTransportSelect = (mode: string) => {
    setHasUserSelectedTransport(true);
    setTransport(mode);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Transportation</h2>
        <p className="text-slate-500 mt-1">Select your preferred way to travel</p>
        {distance && (
          <p className="text-sm text-slate-400 mt-2">Distance: <span className="font-semibold">{Math.round(distance)} km</span></p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TRANSPORT_OPTIONS.map(opt => {
          const active = transport === opt.id;
          const isRecommended = recommendedMode === opt.id;
          const costs = travelCosts[opt.id];
          const time = travelTimes[opt.id];
          
          return (
            <button
              key={opt.id}
              type="button"
              onClick={(event) => { event.preventDefault(); handleTransportSelect(opt.id); }}
              className={`relative p-4 rounded-xl text-center transition-all border-2
                ${active ? "border-[#27788e] bg-[#27788e]/5 shadow-md" : "border-slate-100 hover:border-slate-200"}`}
            >
              {isRecommended && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#14b8a6] text-white text-[10px] font-bold rounded-full uppercase whitespace-nowrap shadow-sm">
                  Best Option
                </div>
              )}
              <div className={`flex justify-center mb-2 ${active ? "text-[#27788e]" : "text-slate-400"}`}>{opt.icon}</div>
              <div className={`font-semibold text-sm ${active ? "text-[#1e355c]" : "text-slate-600"}`}>{opt.label}</div>
              
              <div className="text-[#14b8a6] font-semibold text-xs mt-1">
                {time ? `${time} • ` : ""}
                {costs && costs.max > 0 ? `${symbol}${costs.min} - ${symbol}${costs.max}` : (costs ? "Free" : opt.desc)}
              </div>
              {active && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#27788e] text-white rounded-full text-[9px] font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => onContinue({ transport })} 
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 5: Review ──────────────────────────────────────────────────────────
function ReviewStep({ 
  tripType, from, to, details, style, onGenerate 
}: { 
  tripType: TripType; from: Location | null; to: Location | null;
  details: { startDate: string; endDate: string; duration: number; isOneDayTrip: boolean };
  style: Record<string, string>; onGenerate: () => void;
}) {
  const transportLabel = TRANSPORT_OPTIONS.find(t => t.id === style.transport)?.label || style.transport;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Ready to Go!</h2>
        <p className="text-slate-500 mt-1">Review your trip details before generating</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Trip Type</span>
          <span className="font-semibold text-[#1e355c] capitalize">{tripType === "round-trip" ? "Round Trip" : "One Way"}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Route</span>
          <span className="font-semibold text-[#1e355c]">{from?.name} → {to?.name}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Duration</span>
          <span className="font-semibold text-[#1e355c]">{details.isOneDayTrip ? "1 Day Trip" : `${details.duration} Days`}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Dates</span>
          <span className="font-semibold text-[#1e355c]">
            {new Date(details.startDate).toLocaleDateString()} - {new Date(details.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Transport</span>
          <span className="font-semibold text-[#1e355c] capitalize">{transportLabel}</span>
        </div>
      </div>

      <button 
        onClick={onGenerate} 
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#27788e] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
      >
        <Sparkles className="w-5 h-5" /> Generate Itinerary <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// ─── Generating Screen ──────────────────────────────────────────────────────
function GeneratingScreen() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative w-32 h-32">
        <motion.div className="absolute inset-0 rounded-full border-4 border-[#14b8a6]/30" animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#1e355c] to-[#27788e] flex items-center justify-center shadow-xl" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1e355c]">Creating Your Itinerary</h3>
        <p className="text-slate-500 text-sm">Our AI is crafting the perfect trip for you...</p>
      </div>
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-xs text-slate-400"><span>Progress</span><span className="font-semibold text-[#14b8a6]">{Math.round(progress)}%</span></div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#14b8a6] to-[#27788e]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function CreateTripPageContent() {
  const [step, setStep] = useState<Step>("trip-type");
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [details, setDetails] = useState<{ startDate: string; endDate: string; duration: number; isOneDayTrip: boolean; } | null>(null);
  const [style, setStyle] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  // ─── Load saved data from sessionStorage only on first load ──────────────────
  useEffect(() => {
    if (isFirstLoad) {
      // Check if we should clear data (if coming from navigation)
      const shouldClear = sessionStorage.getItem('clearTripData');
      if (shouldClear === 'true') {
        sessionStorage.removeItem('clearTripData');
        const keysToRemove = ['fromLocation', 'toLocation', 'details', 'style', 'tripType'];
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        setIsFirstLoad(false);
        return;
      }

      const savedFrom = sessionStorage.getItem('fromLocation');
      const savedTo = sessionStorage.getItem('toLocation');
      const savedDetails = sessionStorage.getItem('details');
      const savedStyle = sessionStorage.getItem('style');
      const savedTripType = sessionStorage.getItem('tripType');
      
      if (savedFrom) setFromLocation(JSON.parse(savedFrom));
      if (savedTo) setToLocation(JSON.parse(savedTo));
      if (savedDetails) setDetails(JSON.parse(savedDetails));
      if (savedStyle) setStyle(JSON.parse(savedStyle));
      if (savedTripType) setTripType(savedTripType as TripType);
      
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  // ─── Auto-advance to destination step if search query exists ──────────────
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2 && step === "trip-type") {
      // If there's a search query, auto-advance to destination step
      setStep("destination");
    }
  }, [searchQuery]);

  // ─── Save data to sessionStorage ──────────────────────────────────────────
  useEffect(() => {
    if (!isFirstLoad) {
      if (fromLocation) sessionStorage.setItem('fromLocation', JSON.stringify(fromLocation));
      if (toLocation) sessionStorage.setItem('toLocation', JSON.stringify(toLocation));
      if (details) sessionStorage.setItem('details', JSON.stringify(details));
      if (style) sessionStorage.setItem('style', JSON.stringify(style));
      if (tripType) sessionStorage.setItem('tripType', tripType);
    }
  }, [fromLocation, toLocation, details, style, tripType, isFirstLoad]);

  const handleContinue = () => {
    const steps: Step[] = ["trip-type", "destination", "details", "style", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) { 
      setStep(steps[currentIndex + 1]); 
      window.scrollTo({ top: 0, behavior: "smooth" }); 
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["trip-type", "destination", "details", "style", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) { 
      setStep(steps[currentIndex - 1]); 
      window.scrollTo({ top: 0, behavior: "smooth" }); 
    }
  };

  const handleStepClick = (targetStep: Step) => {
    const steps: Step[] = ["trip-type", "destination", "details", "style", "review"];
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
    const tripData = {
      trip_type: tripType,
      origin_name: fromLocation?.name || null,
      origin_lat: fromLocation?.lat || null,
      origin_lng: fromLocation?.lng || null,
      destination_name: toLocation?.name || "Unknown",
      destination_lat: toLocation?.lat || null,
      destination_lng: toLocation?.lng || null,
      start_date: details?.startDate || null,
      end_date: details?.endDate || null,
      trip_days: details?.duration || 1,
      travel_mode: style?.transport || "flight",
      interests: [],
      status: "planning",
    };

    console.log("🚀 Sending to API:", tripData);

    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save trip");
    }
    
    const data = await response.json();
    console.log("✅ Trip saved:", data);
    
    // Clear session data
    sessionStorage.setItem('clearTripData', 'true');
    const keysToRemove = ['fromLocation', 'toLocation', 'details', 'style', 'tripType'];
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Reset state
    setFromLocation(null);
    setToLocation(null);
    setDetails(null);
    setStyle(null);
    setTripType("one-way");
    setStep("trip-type");
    
    if (data.trip && data.trip.id) {
      router.push(`/itinerary/${data.trip.id}`);
    }
  } catch (error) {
    console.error("❌ Error generating trip:", error);
    alert(error instanceof Error ? error.message : "Failed to generate trip");
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

  return (
    <div className="min-h-screen bg-[#f8fafb] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e355c] tracking-tight">
            Create Your <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Perfect Trip</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Let AI craft a personalized itinerary just for you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <StepProgress current={step} onStepClick={handleStepClick} />
        </div>

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
                initialFrom={fromLocation}
                initialTo={toLocation}
                searchQuery={searchQuery}
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
                initialDetails={details || undefined}
                onContinue={(d) => { 
                  setDetails(d); 
                  handleContinue(); 
                }} 
              />
            )}
            {step === "style" && (
              <StyleStep 
                key="style" 
                origin={fromLocation} 
                destination={toLocation} 
                originCountry={fromLocation?.country || "USA"} 
                initialTransport={style?.transport}
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
                style={style!} 
                onGenerate={handleGenerate} 
              />
            )}
          </AnimatePresence>

          {currentIndex > 0 && step !== "review" && !isGenerating && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <button 
                onClick={handleBack} 
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-xs text-slate-400">Step {currentIndex + 1} of {STEPS.length}</div>
            </div>
          )}
          {step === "review" && !isGenerating && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <button 
                onClick={handleBack} 
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Edit
              </button>
              <div className="text-xs text-slate-400">Ready to generate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateTripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafb] p-4 md:p-6"><div className="max-w-3xl mx-auto text-center py-20 text-slate-500">Loading trip builder...</div></div>}>
      <CreateTripPageContent />
    </Suspense>
  );
}