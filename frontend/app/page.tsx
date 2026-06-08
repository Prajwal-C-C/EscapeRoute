"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Zap, Star, Users, ArrowRight, CheckCircle,
  Globe, Route, Clock, Shield, ChevronRight, Menu, X
} from "lucide-react";
// import { ImageWithFallback } from "./figma/ImageWithFallback";

const HERO_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop&auto=format";
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

export default function Page() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/images/logo-removebg-preview.png" alt="EscapeRoute" className="h-15 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Destinations", "Pricing"].map(item => (
              <button key={item} className="text-slate-600 hover:text-[#2563eb] transition-colors" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => router.push("/login")} className="text-slate-700 hover:text-[#2563eb] transition-colors" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Sign In</button>
            <button onClick={() => router.push("/dashboard")} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Get Started</button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
            {["Features", "How it Works", "Destinations", "Pricing"].map(item => (
              <button key={item} className="text-left text-slate-600" style={{ fontWeight: 500 }}>{item}</button>
            ))}
            <button onClick={() => router.push("/login")} className="text-left text-[#2563eb]" style={{ fontWeight: 600 }}>Sign In</button>
            <button onClick={() => router.push("/signup")} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg w-full" style={{ fontWeight: 600 }}>Get Started</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          {/* <ImageWithFallback src={HERO_IMAGE} alt="Aerial travel landscape" className="w-full h-full object-cover" /> */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20 pb-32">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-[#f97316]" />
            <span className="text-white" style={{ fontSize: "0.875rem", fontWeight: 600 }}>AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-white mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Plan Smarter.<br />Travel Better.
          </h1>
          <p className="text-slate-200 mb-10 max-w-2xl mx-auto" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", lineHeight: 1.6 }}>
            Generate optimized travel itineraries in seconds. Discover attractions, plan routes, and explore the world — effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
            <div className="flex items-center gap-2 flex-1 w-full">
              <MapPin className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 outline-none text-slate-800 bg-transparent"
                style={{ fontSize: "0.9375rem" }}
                onKeyDown={e => e.key === "Enter" && router.push("/create-trip")}
              />
            </div>
            <button onClick={() => router.push("/create-trip")} className="bg-[#2563eb] text-white px-6 py-3 rounded-xl hover:bg-[#1d4ed8] transition-all flex items-center gap-2 w-full sm:w-auto justify-center" style={{ fontWeight: 700 }}>
              Start Planning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-10">
            {[["50k+", "Routes Created"], ["195+", "Countries"], ["4.9★", "App Rating"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{val}</div>
                <div className="text-slate-300" style={{ fontSize: "0.8125rem" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-[#2563eb] px-4 py-1.5 rounded-full mb-4" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>FEATURES</span>
            <h2 className="text-slate-900 mb-4" style={{ fontWeight: 800, fontSize: "2.25rem", letterSpacing: "-0.02em" }}>Everything you need to travel smarter</h2>
            <p className="text-slate-500 max-w-2xl mx-auto" style={{ fontSize: "1.0625rem" }}>Built for explorers who want more experiences and less planning headaches.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-[#2563eb] transition-colors">
                  <Icon className="w-6 h-6 text-[#2563eb] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-slate-900 mb-2" style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{title}</h3>
                <p className="text-slate-500" style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-teal-50 text-[#14b8a6] px-4 py-1.5 rounded-full mb-4" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>HOW IT WORKS</span>
            <h2 className="text-slate-900 mb-4" style={{ fontWeight: 800, fontSize: "2.25rem", letterSpacing: "-0.02em" }}>From idea to itinerary in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-0" />}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#14b8a6] flex items-center justify-center mb-5 shadow-lg">
                    <span className="text-white" style={{ fontWeight: 800, fontSize: "1.125rem" }}>{step.num}</span>
                  </div>
                  <h3 className="text-slate-900 mb-2" style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{step.title}</h3>
                  <p className="text-slate-500" style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => router.push("/create-trip")} className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-8 py-4 rounded-xl hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-200" style={{ fontWeight: 700, fontSize: "1rem" }}>
              Create Your First Trip <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-block bg-orange-50 text-[#f97316] px-4 py-1.5 rounded-full mb-4" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>DESTINATIONS</span>
              <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: "2.25rem", letterSpacing: "-0.02em" }}>Popular destinations</h2>
            </div>
            <button className="hidden md:flex items-center gap-1 text-[#2563eb] hover:gap-2 transition-all" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <button key={dest.name} onClick={() => router.push("/create-trip")} className="group relative rounded-2xl overflow-hidden aspect-[4/3] text-left w-full">
                {/* <ImageWithFallback src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-white" style={{ fontWeight: 700, fontSize: "1.25rem" }}>{dest.name}</h3>
                      <p className="text-slate-300" style={{ fontSize: "0.875rem" }}>{dest.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400 justify-end">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-white" style={{ fontWeight: 700, fontSize: "0.875rem" }}>{dest.rating}</span>
                      </div>
                      <span className="text-slate-300" style={{ fontSize: "0.75rem" }}>{dest.trips} trips</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-[#1e3a6e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full mb-4" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>TESTIMONIALS</span>
            <h2 className="text-white mb-4" style={{ fontWeight: 800, fontSize: "2.25rem", letterSpacing: "-0.02em" }}>Loved by travelers worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-200 mb-6" style={{ fontSize: "0.9375rem", lineHeight: 1.7 }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-white" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{t.name}</div>
                    <div className="text-slate-400" style={{ fontSize: "0.8125rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#2563eb] to-[#14b8a6] rounded-3xl p-12 text-white">
            <h2 className="mb-4" style={{ fontWeight: 800, fontSize: "2.25rem", letterSpacing: "-0.02em" }}>Ready to escape?</h2>
            <p className="text-blue-100 mb-8" style={{ fontSize: "1.125rem" }}>Join 50,000+ travelers who plan smarter with EscapeRoute.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => router.push("/signup")} className="bg-white text-[#2563eb] px-8 py-4 rounded-xl hover:shadow-xl transition-all w-full sm:w-auto" style={{ fontWeight: 700, fontSize: "1rem" }}>
                Start for free
              </button>
              <button onClick={() => router.push("/login")} className="border-2 border-white/40 text-white px-8 py-4 rounded-xl hover:border-white transition-all w-full sm:w-auto" style={{ fontWeight: 700, fontSize: "1rem" }}>
                Sign in
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-blue-100">
              {["Free plan available", "No credit card needed", "Cancel anytime"].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span style={{ fontSize: "0.875rem" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/images/logo-removebg-preview.png" alt="EscapeRoute" className="h-15 w-auto" />
            </div>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Support", "Blog"].map(l => (
                <button key={l} className="hover:text-white transition-colors" style={{ fontSize: "0.875rem" }}>{l}</button>
              ))}
            </div>
            <p style={{ fontSize: "0.875rem" }}>© 2026 EscapeRoute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
