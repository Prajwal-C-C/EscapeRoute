"use client";

import { 
  LayoutDashboard, Compass, Calendar, Star, 
  Settings, Users, LogOut, Menu, X 
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Calendar, label: "Trips", path: "/saved-trips" },
  { icon: Star, label: "Saved", path: "/saved" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <span className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.125rem" }}>EscapeRoute</span>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => router.push("/login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileOpen(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100">
        <SidebarContent />
      </div>
    </>
  );
}