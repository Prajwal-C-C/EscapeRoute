"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowRight, ArrowLeft, Sparkles, MapPin, Calendar, Wallet, Zap,
  CheckCircle2, Sun, Moon, Coffee, Plane, Train, Car, Bike,
  Globe, Mountain, Utensils, Camera, Leaf, Heart, Star, Waves,
  Building2, ShoppingBag, Music, TrendingUp, Clock, Users
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  image: string;
  temp: string;
  cost: string;
  season: string;
  trending?: boolean;
}

interface Interest {
  id: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  image: string;
}

interface TravelStyle {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

type Step = "destination" | "details" | "interests" | "style" | "review";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "destination", label: "Destination", icon: <MapPin className="w-4 h-4" /> },
  { id: "details", label: "Details", icon: <Calendar className="w-4 h-4" /> },
  { id: "interests", label: "Interests", icon: <Heart className="w-4 h-4" /> },
  { id: "style", label: "Style", icon: <Compass className="w-4 h-4" /> },
  { id: "review", label: "Review", icon: <Sparkles className="w-4 h-4" /> },
];

const DESTINATIONS: Destination[] = [
  { id: "bali", name: "Bali", country: "Indonesia", emoji: "🇮🇩", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", temp: "28°C", cost: "$$", season: "Apr–Oct", trending: true },
  { id: "kyoto", name: "Kyoto", country: "Japan", emoji: "🇯🇵", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80", temp: "18°C", cost: "$$$", season: "Mar–May" },
  { id: "santorini", name: "Santorini", country: "Greece", emoji: "🇬🇷", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80", temp: "25°C", cost: "$$$", season: "Jun–Sep", trending: true },
  { id: "dubai", name: "Dubai", country: "UAE", emoji: "🇦🇪", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", temp: "22°C", cost: "$$$$", season: "Nov–Mar" },
  { id: "maldives", name: "Maldives", country: "Maldives", emoji: "🇲🇻", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80", temp: "30°C", cost: "$$$$", season: "Nov–Apr", trending: true },
  { id: "paris", name: "Paris", country: "France", emoji: "🇫🇷", image: "https://images.unsplash.com/photo-1431274172761-fcdab704a698?w=400&q=80", temp: "15°C", cost: "$$$", season: "Apr–Jun" },
];

const INTERESTS: Interest[] = [
  { id: "nature", label: "Nature", icon: <Leaf className="w-6 h-6" />, gradient: "from-emerald-500 to-green-700", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80" },
  { id: "adventure", label: "Adventure", icon: <Mountain className="w-6 h-6" />, gradient: "from-orange-500 to-red-600", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80" },
  { id: "food", label: "Food", icon: <Utensils className="w-6 h-6" />, gradient: "from-amber-500 to-orange-600", image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80" },
  { id: "culture", label: "Culture", icon: <Globe className="w-6 h-6" />, gradient: "from-violet-500 to-purple-700", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80" },
  { id: "photography", label: "Photography", icon: <Camera className="w-6 h-6" />, gradient: "from-blue-500 to-cyan-600", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&q=80" },
  { id: "nightlife", label: "Nightlife", icon: <Music className="w-6 h-6" />, gradient: "from-indigo-600 to-purple-800", image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&q=80" },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag className="w-6 h-6" />, gradient: "from-pink-500 to-rose-600", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80" },
  { id: "wellness", label: "Wellness", icon: <Heart className="w-6 h-6" />, gradient: "from-teal-500 to-cyan-600", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80" },
  { id: "luxury", label: "Luxury", icon: <Star className="w-6 h-6" />, gradient: "from-yellow-500 to-amber-600", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80" },
  { id: "beaches", label: "Beaches", icon: <Waves className="w-6 h-6" />, gradient: "from-sky-500 to-blue-600", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80" },
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
  { id: "economy", label: "Economy", daily: "$50–100", accom: "Hostels & budget hotels", icon: "🎒" },
  { id: "comfort", label: "Comfort", daily: "$150–250", accom: "3–4★ hotels", icon: "🏨" },
  { id: "premium", label: "Premium", daily: "$300–500", accom: "4–5★ boutique", icon: "💎" },
  { id: "luxury", label: "Luxury", daily: "$600+", accom: "Villas & 5★ resorts", icon: "👑" },
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

// ─── Step 1: Destination ──────────────────────────────────────────────────────
function DestinationStep({ onSelect }: { onSelect: (d: Destination) => void }) {
  const [selected, setSelected] = useState<Destination | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Where to?</h2>
        <p className="text-slate-500 mt-1">Pick your dream destination</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DESTINATIONS.map((d) => {
          const isSelected = selected?.id === d.id;
          return (
            <motion.button
              key={d.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(d)}
              className={`relative overflow-hidden rounded-2xl aspect-[3/4] text-left transition-all
                ${isSelected ? "ring-2 ring-[#14b8a6] ring-offset-2 shadow-lg" : "hover:shadow-lg"}`}
            >
              <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {d.trending && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#14b8a6] rounded-full text-[9px] font-bold text-white uppercase">
                  Trending
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#14b8a6] rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{d.emoji}</span>
                  <span className="text-white font-bold text-sm">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-[10px]">
                  <span>{d.temp}</span>
                  <span className="w-px h-2 bg-white/30" />
                  <span>{d.cost}/day</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
          ${selected
            ? "bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white shadow-lg hover:shadow-xl"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────
function DetailsStep({ onContinue }: { onContinue: (d: { duration: number; budget: string }) => void }) {
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState("comfort");

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

      {/* Duration */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1e355c]">Duration</h3>
          <div className="text-3xl font-black text-[#1e355c]">
            {duration}<span className="text-base font-medium text-slate-400 ml-1">days</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[3, 5, 7, 10, 14].map(d => (
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

      {/* Budget */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="font-semibold text-[#1e355c] mb-4">Budget</h3>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_LEVELS.map((b) => {
            const active = budget === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setBudget(b.id)}
                className={`p-4 rounded-xl text-left transition-all border-2
                  ${active
                    ? "border-[#14b8a6] bg-teal-50/50 shadow-md"
                    : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className={`font-semibold text-sm ${active ? "text-[#1e355c]" : "text-slate-600"}`}>{b.label}</div>
                <div className="text-[#14b8a6] font-semibold text-xs">{b.daily}</div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onContinue({ duration, budget })}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#1e355c] to-[#27788e] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 3: Interests ────────────────────────────────────────────────────────
function InterestsStep({ onContinue }: { onContinue: (interests: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

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
        <p className="text-slate-500 mt-1">Select what excites you</p>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {selected.map(id => {
            const interest = INTERESTS.find(i => i.id === id)!;
            return (
              <span key={id} className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-[#27788e] rounded-full text-sm font-medium">
                {interest.label}
                <button onClick={() => toggle(id)} className="hover:text-red-400">✕</button>
              </span>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {INTERESTS.map((interest) => {
          const active = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className={`relative overflow-hidden rounded-xl aspect-square transition-all
                ${active ? "ring-2 ring-[#14b8a6] ring-offset-2 shadow-md" : "hover:shadow-md"}`}
            >
              <img src={interest.image} alt={interest.label} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${interest.gradient} opacity-70`} />
              {active && <div className="absolute inset-0 bg-[#14b8a6]/30 backdrop-blur-sm" />}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <div className="text-white">{active ? <CheckCircle2 className="w-5 h-5" /> : interest.icon}</div>
                <span className="text-white font-medium text-[10px] text-center leading-tight drop-shadow">{interest.label}</span>
              </div>
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

// ─── Step 4: Style ────────────────────────────────────────────────────────────
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

// ─── Step 5: Review ──────────────────────────────────────────────────────────
function ReviewStep({ onGenerate }: { onGenerate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-center"
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e355c] to-[#27788e] flex items-center justify-center shadow-xl mb-4"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#1e355c]">Ready to Go!</h2>
        <p className="text-slate-500 mt-1 max-w-sm">Everything looks perfect. Let's create your dream itinerary.</p>
      </div>

      <div className="bg-gradient-to-br from-[#1e355c] to-[#27788e] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 justify-center text-sm">
          <Users className="w-4 h-4" />
          <span>AI will craft your personalized trip in seconds</span>
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
  const [step, setStep] = useState<Step>("destination");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [details, setDetails] = useState<{ duration: number; budget: string } | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [style, setStyle] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleContinue = () => {
    const steps: Step[] = ["destination", "details", "interests", "style", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["destination", "details", "interests", "style", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (targetStep: Step) => {
    const steps: Step[] = ["destination", "details", "interests", "style", "review"];
    const currentIndex = steps.indexOf(step);
    const targetIndex = steps.indexOf(targetStep);
    if (targetIndex <= currentIndex) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // router.push("/itinerary/new");
    }, 3000);
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
  const isLastStep = currentIndex === STEPS.length - 1;

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
            {step === "destination" && (
              <DestinationStep
                key="destination"
                onSelect={(d) => {
                  setDestination(d);
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
                onGenerate={handleGenerate}
              />
            )}
          </AnimatePresence>

          {/* Navigation Buttons - Always visible except on first step */}
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