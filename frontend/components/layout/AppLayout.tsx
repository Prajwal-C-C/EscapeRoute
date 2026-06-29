"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Route, LayoutDashboard, Map, Bookmark, Settings, Plus,
  Search, Bell, ChevronDown, LogOut, User, Menu, X, Compass,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Plus, label: "New Trip", path: "/create-trip" },
  { icon: Bookmark, label: "Saved Trips", path: "/saved-trips" },
  { icon: Map, label: "Explore Map", path: "/map" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const userName = session?.user?.name || "Traveler";
  const userEmail = session?.user?.email || "traveler@example.com";
  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TR";

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Mobile overlay - clicks to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
          <img src="/images/logo-removebg-preview.png" alt="EscapeRoute" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-slate-900">EscapeRoute</span>
          <button 
            className="lg:hidden ml-auto p-1 hover:bg-slate-100 rounded-lg transition-colors" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => { 
                  router.push(path); 
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
                {label === "New Trip" && (
                  <span className="ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 truncate font-semibold text-sm">{userName}</div>
              <div className="text-slate-400 truncate text-xs">{userEmail}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/settings")}
              className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-slate-700 text-sm font-medium hover:bg-slate-100 transition"
            >
              Settings
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-red-600 text-sm font-medium hover:bg-red-100 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
          {/* Hamburger Menu Button - Mobile Only */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, trips..."
              className="flex-1 bg-transparent outline-none text-slate-800 text-sm"
            />
          </div>

          {/* Right Section */}
          <div className="ml-auto flex items-center gap-3">
            {/* New Trip Button */}
            <button 
              onClick={() => router.push("/create-trip")} 
              className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> New Trip
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                }} 
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SK</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              
              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  {[
                    { icon: User, label: "Profile", action: () => router.push("/settings") },
                    { icon: Settings, label: "Settings", action: () => router.push("/settings") },
                    { icon: LogOut, label: "Sign Out", action: () => signOut({ callbackUrl: "/" }) },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={() => { 
                        action(); 
                        setProfileOpen(false); 
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search Bar - Mobile (below header) */}
        <div className="sm:hidden p-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, trips..."
              className="flex-1 bg-transparent outline-none text-slate-800 text-sm"
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}