"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Map, Bookmark, Settings, Plus,
  Search, Bell, ChevronDown, LogOut, User, Menu, X, Compass,
  ArrowRight
} from "lucide-react";

interface SearchHistory {
  id: string;
  search_query: string;
  searched_at: string;
}

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
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { data: session } = useSession();

  const isCollapsed = !sidebarOpen;

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

  const handleNavClick = (path: string) => {
    router.push(path);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Fetch search history
  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      if (!response.ok) throw new Error('Failed to fetch search history');
      const data = await response.json();
      setSearchHistory(data);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  // Add a new search
  const addSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) return;

    try {
      const response = await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        await fetchSearchHistory();
      }
    } catch (error) {
      console.error('Error adding search:', error);
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearch(searchQuery);
      router.push(`/create-trip?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  // Handle click on recent search
  const handleRecentSearchClick = (query: string) => {
    addSearch(query);
    router.push(`/create-trip?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  // Clear all searches
  const clearSearches = async () => {
    try {
      const response = await fetch('/api/search-history', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSearchHistory([]);
        setShowSearchDropdown(false);
      }
    } catch (error) {
      console.error('Error clearing searches:', error);
    }
  };

  // Fetch search history on mount
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-dropdown') && !target.closest('.search-input')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSidebarOpen(window.innerWidth >= 1024);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100
          flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-72' : 'w-0 lg:w-20'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 h-16 border-b border-slate-100 ${isCollapsed ? 'px-0 lg:justify-center' : 'px-5'}`}>
          <img src="/images/logo-removebg-preview.png" alt="EscapeRoute" className="w-8 h-8 object-contain flex-shrink-0" />
          <span className={`text-lg font-bold text-slate-900 whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            EscapeRoute
          </span>
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
                type="button"
                key={path}
                onClick={() => handleNavClick(path)}
                title={isCollapsed ? label : undefined}
                className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all ${
                  isCollapsed ? 'lg:h-11 lg:justify-center lg:px-0' : 'px-3'
                } ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm whitespace-nowrap ${active ? "font-semibold" : "font-medium"} ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {label}
                </span>
                {label === "New Trip" && (
                  <span className={`ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isCollapsed ? 'lg:hidden' : 'inline-flex'}`}>
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-100">
          <div className={`flex items-center ${isCollapsed ? 'lg:flex-col lg:justify-center lg:gap-2' : 'gap-3'}`}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm leading-none">{userInitials}</span>
            </div>

            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : 'flex flex-col'}`}>
              <div className="text-slate-900 truncate font-semibold text-sm">{userName}</div>
              <div className="text-slate-400 truncate text-xs">{userEmail}</div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              className={`text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 ${isCollapsed ? 'lg:p-2' : 'ml-3'}`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
          <button 
            type="button"
            className="relative z-[60] flex p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Search Bar with Dropdown */}
          <div className="flex-1 max-w-md hidden sm:block relative search-dropdown">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search for destinations, trips, or interests..."
                  className="flex-1 bg-transparent outline-none text-slate-800 text-sm search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchDropdown(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-80 overflow-y-auto">
                {searchHistory.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Searches</span>
                      <button
                        onClick={clearSearches}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    {searchHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleRecentSearchClick(item.search_query)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{item.search_query}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No recent searches</p>
                    <p className="text-xs text-slate-400 mt-1">Search for destinations to see them here</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/create-trip")}
              className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> New Trip
            </button>

            <button type="button" className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
            </button>

            <div className="relative profile-dropdown">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{userInitials}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  {[
                    { icon: User, label: "Profile", action: () => router.push("/settings") },
                    { icon: Settings, label: "Settings", action: () => router.push("/settings") },
                    { icon: LogOut, label: "Sign Out", action: () => signOut({ callbackUrl: "/" }) },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => { action(); setProfileOpen(false); }}
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

        {/* Search Bar - Mobile */}
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