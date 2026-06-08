// components/sections/features.tsx
"use client";

import { Map, Route, Calendar, Utensils, BarChart3, Smartphone } from "lucide-react";

const features = [
  {
    icon: Route,
    title: "Route Optimization",
    description: "Minimize travel distance between destinations with our intelligent routing algorithm.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Smart Itineraries",
    description: "Day-wise schedules that maximize experiences within your available time.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Map,
    title: "Auto Discovery",
    description: "Automatically discover nearby attractions, landmarks, and hidden gems.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Utensils,
    title: "Restaurant Finder",
    description: "Get recommendations for the best dining spots along your route.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Travel Analytics",
    description: "Insights into your travel patterns and optimization suggestions.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Access your itineraries anywhere with our responsive design.",
    color: "from-rose-500 to-pink-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for{" "}
            <span className="text-gradient">Smart Travelers</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to plan the perfect trip without the stress of manual planning.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}