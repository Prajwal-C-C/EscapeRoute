"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin, Zap, Star, Users, ArrowRight, CheckCircle,
  Globe, Route, Clock, Shield, ChevronRight
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Modal } from "@/components/ui/Modal";
import { AuthModal } from "@/components/auth/AuthModal";

// --- Data Constants ---
const DEST_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&h=400&fit=crop&auto=format",
];

const destinations = [
  { name: "Santorini", country: "Greece", rating: 4.9, trips: "12.4k", image: DEST_IMAGES[0] },
  { name: "Kyoto", country: "Japan", rating: 4.8, trips: "9.8k", image: DEST_IMAGES[1] },
  { name: "Tokyo", country: "Japan", rating: 4.9, trips: "18.2k", image: DEST_IMAGES[2] },
  { name: "Bali", country: "Indonesia", rating: 4.7, trips: "15.1k", image: DEST_IMAGES[3] },
  { name: "Paris", country: "France", rating: 4.8, trips: "21.3k", image: DEST_IMAGES[4] },
  { name: "Maldives", country: "South Asia", rating: 4.9, trips: "8.6k", image: DEST_IMAGES[5] },
];

const features = [
  { icon: Zap, title: "AI-Powered Itineraries", desc: "Generate optimized day-wise travel plans in seconds with smart route ordering." },
  { icon: Route, title: "Route Optimization", desc: "Minimize travel distance and time between attractions for maximum efficiency." },
  { icon: Globe, title: "Smart Discovery", desc: "Automatically uncover hidden gems, landmarks, restaurants, and local favorites." },
  { icon: Clock, title: "Time-Aware Planning", desc: "Respects opening hours, peak times, and your personal daily schedule preferences." },
  { icon: Users, title: "Collaborative Trips", desc: "Plan and share itineraries with friends and family in real time." },
  { icon: Shield, title: "Offline Access", desc: "Download your itinerary and maps for offline use when you're on the go." },
];

const steps = [
  { num: "01", title: "Enter Destination", desc: "Search any city or region worldwide and set your travel dates." },
  { num: "02", title: "Pick Interests", desc: "Choose from nature, food, culture, adventure, shopping, and more." },
  { num: "03", title: "Set Preferences", desc: "Define budget, transport mode, daily start/end time, and pace." },
  { num: "04", title: "Get Your Route", desc: "Receive a fully optimized day-by-day itinerary with interactive map." },
];

const testimonials = [
  {
    name: "Sarah Kim", role: "Digital Nomad", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format",
    text: "EscapeRoute planned our entire 10-day Japan trip in under 3 minutes. The route optimization saved us hours of back-and-forth travel. Absolutely incredible.",
  },
  {
    name: "Marco Rivera", role: "Travel Blogger", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    text: "The AI recommendations found spots I never would have discovered on my own. Bali trip was a revelation — hidden temples, local warungs, everything perfectly timed.",
  },
  {
    name: "Aisha Patel", role: "Family Traveler", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    text: "Planning a family trip used to take weeks. EscapeRoute made it a 5-minute task. The kids-friendly filtering and restaurant suggestions were spot on.",
  },
];

// --- Main Components ---

function LandingContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => searchParams.get("showLogin") === "true");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setIsLoginMode(mode === 'login');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop&auto=format" alt="Travel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20 pb-32">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-white text-sm font-semibold">AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-white mb-6 text-5xl md:text-7xl font-extrabold tracking-tight">
            Plan Smarter.<br />Travel Better.
          </h1>
          <p className="text-slate-200 mb-10 max-w-2xl mx-auto text-lg md:text-xl">
            Generate optimized travel itineraries in seconds. Discover attractions, plan routes, and explore the world effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
            <div className="flex items-center gap-2 flex-1 w-full">
              <MapPin className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 outline-none text-slate-800 bg-transparent text-sm"
                onKeyDown={e => e.key === "Enter" && openAuthModal('signup')}
              />
            </div>
            <button 
              onClick={() => openAuthModal('signup')} 
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 w-full sm:w-auto justify-center font-bold"
            >
              Start Planning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-10">
            {[["50k+", "Routes Created"], ["195+", "Countries"], ["4.9★", "App Rating"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-white font-extrabold text-2xl">{val}</div>
                <div className="text-slate-300 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Travel planning, simplified</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-900">Everything for a better trip</h2>
            <p className="mt-4 text-slate-600">Build a plan around your destination, dates, interests, and travel style.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Icon className="h-5 w-5" /></span>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 py-24">
        <div id="demo" className="max-w-7xl mx-auto scroll-mt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-teal-600">Four simple steps</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-900">From idea to itinerary</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.num} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="text-3xl font-black text-blue-100">{step.num}</span>
                <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div><p className="text-sm font-bold uppercase tracking-widest text-blue-600">Get inspired</p><h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900">Popular destinations</h2></div>
            <button onClick={() => openAuthModal("signup")} className="inline-flex items-center gap-2 font-semibold text-blue-700">Plan your own trip <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <button key={destination.name} onClick={() => { setSearch(destination.name); openAuthModal("signup"); }} className="group relative h-64 overflow-hidden rounded-2xl text-left">
                <img src={destination.image} alt={`${destination.name}, ${destination.country}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                  <span><span className="block text-xl font-bold">{destination.name}</span><span className="text-sm text-white/80">{destination.country}</span></span>
                  <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-sm"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{destination.rating}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12"><p className="text-sm font-bold uppercase tracking-widest text-teal-300">Traveler stories</p><h2 className="mt-3 text-3xl md:text-4xl font-extrabold">Made for curious travelers</h2></div>
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex gap-1 text-amber-400">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="leading-7 text-slate-100">“{testimonial.text}”</p>
                <div className="mt-6 flex items-center gap-3"><img src={testimonial.avatar} alt="" className="h-11 w-11 rounded-full object-cover" /><div><p className="font-bold">{testimonial.name}</p><p className="text-sm text-slate-300">{testimonial.role}</p></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle className="h-6 w-6" /></span>
          <h2 className="mt-5 text-3xl md:text-4xl font-extrabold text-slate-900">Your next adventure starts here</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">Create an account to save trips and build a personalized itinerary for your next destination.</p>
          <button onClick={() => openAuthModal("signup")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700">Start planning <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <Footer />

      {/* Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
        <AuthModal
          isLogin={isLoginMode}
          onClose={() => setIsAuthModalOpen(false)}
          onToggleMode={() => setIsLoginMode(!isLoginMode)}
        />
      </Modal>
    </div>
  );
}

// Wrap in Suspense to support useSearchParams in Next.js 16+
export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  );
}
