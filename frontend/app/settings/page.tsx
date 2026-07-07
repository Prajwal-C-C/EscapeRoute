"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User, Mail, Shield, Bell, Moon, Sun, Globe, 
  CreditCard, Languages, Palette, Lock, LogOut,
  ChevronRight, CheckCircle2, Loader2, ArrowLeft,
  Smartphone, Monitor, Eye, EyeOff, Save, X
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/useConfirm";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error, warning } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    username: session?.user?.email?.split('@')[0] || "",
  });

  // Appearance Settings
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    tripUpdates: true,
  });

  // Security Settings
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const sections: SettingsSection[] = [
    { id: "profile", title: "Profile", icon: <User className="w-5 h-5" />, description: "Manage your personal information" },
    { id: "appearance", title: "Appearance", icon: <Palette className="w-5 h-5" />, description: "Customize your experience" },
    { id: "notifications", title: "Notifications", icon: <Bell className="w-5 h-5" />, description: "Control your notifications" },
    { id: "security", title: "Security", icon: <Shield className="w-5 h-5" />, description: "Password & authentication" },
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Arabic'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
        }),
      });

      if (response.ok) {
        success('Profile updated successfully');
      } else {
        const err = await response.json();
        error(err.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      error('Passwords do not match');
      return;
    }

    if (passwordForm.new.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      });

      if (response.ok) {
        success('Password changed successfully');
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        const err = await response.json();
        error(err.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      type: "warning",
    });

    if (confirmed) {
      router.push("/");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      type: "danger",
    });

    if (confirmed) {
      warning('Account deletion feature coming soon');
    }
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 sticky top-24">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      const el = document.getElementById(`section-${section.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="text-slate-500">{section.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Section */}
              <motion.div
                id="section-profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Profile</h2>
                    <p className="text-sm text-slate-500">Manage your personal information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Appearance Section */}
              <motion.div
                id="section-appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
                    <p className="text-sm text-slate-500">Customize your experience</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-700">Theme</p>
                      <p className="text-sm text-slate-400">Switch between light and dark mode</p>
                    </div>
                    <button
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      {theme === 'light' ? (
                        <>
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-slate-700" />
                          <span className="text-sm font-medium">Dark</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-700">Language</p>
                      <p className="text-sm text-slate-400">Choose your preferred language</p>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-700">Currency</p>
                      <p className="text-sm text-slate-400">Set your default currency</p>
                    </div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
                    >
                      {currencies.map((curr) => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Notifications Section */}
              <motion.div
                id="section-notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500">Control your notifications</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts' },
                    { id: 'tripUpdates', label: 'Trip Updates', desc: 'Stay informed about your trips' },
                    { id: 'marketing', label: 'Marketing Emails', desc: 'Special offers and news' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-700">{item.label}</p>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({
                          ...notifications,
                          [item.id]: !notifications[item.id as keyof typeof notifications],
                        })}
                        className={`relative w-11 h-6 rounded-full transition-all ${
                          notifications[item.id as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                            notifications[item.id as keyof typeof notifications] ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Security Section */}
              <motion.div
                id="section-security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Security</h2>
                    <p className="text-sm text-slate-500">Password & authentication</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-medium text-slate-700 mb-4">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <h3 className="font-medium text-red-700 mb-1">Danger Zone</h3>
                    <p className="text-sm text-red-600 mb-4">Permanently delete your account</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                      >
                        Delete Account
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog Component */}
      {ConfirmDialogComponent}
    </>
  );
}