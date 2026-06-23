"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {AuthModal} from "@/components/auth/AuthModal";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Destinations", href: "#destinations" },
  { label: "Pricing", href: "#pricing" },
];

export function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setIsLoginMode(mode === 'login');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 relative">
              <Image
                src="/images/logo-removebg-preview.png"
                alt="EscapeRoute Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="text-slate-700 hover:text-blue-600 transition-colors text-sm font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-left text-slate-600 font-medium py-2 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMenuOpen(false);
                }}
                className="text-left text-blue-600 font-semibold py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openAuthModal('signup');
                  setMenuOpen(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {/* Auth Modal - Fixed */}
{/* Auth Modal */}
  <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
        <AuthModal
          isLogin={isLoginMode}
          onClose={() => setIsAuthModalOpen(false)}
          onToggleMode={() => setIsLoginMode(!isLoginMode)}
        />
      </Modal>
    </>
  );
}