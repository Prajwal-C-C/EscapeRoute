    // components/layout/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Map,
  Compass,
  BarChart3,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Utensils,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trips", href: "/trips", icon: Plane },
  { name: "Itineraries", href: "/itineraries", icon: Calendar },
  { name: "Maps", href: "/maps", icon: Map },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Saved Places", href: "/saved-places", icon: Star },
  { name: "Restaurants", href: "/restaurants", icon: Utensils },
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed: externalCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-30 shadow-lg ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ paddingTop: "4rem" }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-300"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <nav className="h-full overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-gray-500 dark:text-gray-500 group-hover:text-primary"
                  }`}
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}