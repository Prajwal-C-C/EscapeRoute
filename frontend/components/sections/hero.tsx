// components/sections/hero.tsx
"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Route } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-black dark:via-indigo-950/20 dark:to-purple-950/20 py-20 lg:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <Route size={14} />
            <span>AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Escape the Ordinary with{" "}
            <span className="text-gradient">Intelligent Itineraries</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Optimized Travels. EscapeRoute automatically discovers attractions and generates day-wise schedules that minimize travel distance while maximizing experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Planning Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300"
            >
              Watch Demo
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span>500K+ Places Discovered</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span>10K+ Itineraries Created</span>
            </div>
            <div className="flex items-center gap-2">
              <Route size={16} className="text-primary" />
              <span>40% Less Travel Time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
