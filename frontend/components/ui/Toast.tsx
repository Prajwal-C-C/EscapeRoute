"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertCircle, Info, X,
  AlertTriangle, Bell
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

const toastStyles = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-300",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    progress: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-300",
    icon: XCircle,
    iconColor: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-300",
    icon: Info,
    iconColor: "text-blue-500",
    progress: "bg-blue-500",
  },
};

// Individual Toast Component
function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 16);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-xl border ${style.bg} ${style.border} shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 w-full max-w-sm`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 mt-0.5 ${style.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.text}`}>
            {message}
          </p>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Progress Bar */}
      <motion.div
        className={`h-0.5 ${style.progress}`}
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
}

// Toast Container
export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Toast Hook and Context
let toastId = 0;
let listeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

export function addToast(
  message: string,
  type: ToastType = "info",
  duration: number = 4000
) {
  const id = String(++toastId);
  const newToast: ToastItem = { id, message, type, duration };
  toasts = [...toasts, newToast];
  listeners.forEach((listener) => listener(toasts));

  // Auto remove after duration + animation time
  setTimeout(() => {
    removeToast(id);
  }, duration + 500);
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  listeners.forEach((listener) => listener(toasts));
}

export function useToast() {
  const [localToasts, setLocalToasts] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => {
      setLocalToasts(newToasts);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 4000
  ) => {
    addToast(message, type, duration);
  };

  const remove = (id: string) => {
    removeToast(id);
  };

  const clearAll = () => {
    toasts = [];
    listeners.forEach((listener) => listener(toasts));
  };

  return {
    toasts: localToasts,
    showToast,
    removeToast: remove,
    clearAll,
    success: (message: string, duration?: number) =>
      showToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      showToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      showToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      showToast(message, "info", duration),
  };
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}