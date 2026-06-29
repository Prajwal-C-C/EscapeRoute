"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Mail, Lock, User, Eye, EyeOff, 
  ArrowRight, X, Check
} from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isLogin: boolean;
  onClose: () => void;
  onToggleMode: () => void;
}

export function AuthModal({ isLogin, onClose, onToggleMode }: AuthModalProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLogin) {
      // A. REGISTER LOGIC
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        // B. AUTOMATIC LOGIN AFTER REGISTRATION
        const signInResult = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (signInResult?.error) {
          alert("Registration successful, but login failed: " + signInResult.error);
        } else {
          onClose(); 
          router.push("/dashboard"); 
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Registration failed.");
      }
    } else {
      // D. EXISTING LOGIN LOGIC
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        alert("Invalid email or password!");
      } else {
        onClose();
        router.push("/dashboard");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <div className="p-6">
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="flex items-center justify-center mx-auto mb-3"
          >
            <div className="w-16 h-16 relative">
              <Image
                src="/images/logo-removebg-preview.png"
                alt="EscapeRoute Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-slate-500 text-xs">
            {isLogin ? "Sign in to continue your journey" : "Start planning your next adventure"}
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-all group disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-slate-600 text-xs font-medium">Google</span>
          </button>
          
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-slate-400">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Sarah Kim"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 text-xs font-semibold mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="hello@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 group"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-500"}`}>
                {rememberMe && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-slate-600 select-none cursor-pointer">Remember me</span>
            </button>
            {isLogin && (
              <button type="button" className="text-xs text-blue-600 hover:underline">Forgot password?</button>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all font-semibold text-sm relative overflow-hidden group"
            >
              <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 text-xs mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={onToggleMode} className="text-blue-600 font-semibold hover:underline">
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}