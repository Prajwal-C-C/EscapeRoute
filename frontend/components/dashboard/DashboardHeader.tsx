"use client";

import { Bell, Search, User } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName = "Sarah" }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, trips..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#14b8a6] flex items-center justify-center text-white font-semibold">
              {userName[0]}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-700">{userName}</span>
          </button>
        </div>
      </div>
    </header>
  );
}