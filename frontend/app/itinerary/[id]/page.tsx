"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Clock3,
  Compass,
  Info,
  Lightbulb,
  Luggage,
  MapPin,
  Moon,
  Navigation,
  Plane,
  RefreshCw,
  Route,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Tag,
  Train,
  Utensils,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecommendationContent = { text: string } | Record<string, unknown>;

type Recommendation = {
  id?: string;
  recommendation_type?: string | null;
  content?: RecommendationContent | null;
};

type TripDetails = {
  id: string;
  destination_name?: string | null;
  origin_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  trip_days?: number | null;
  travel_mode?: string | null;
  status?: string | null;
  trip_type?: string | null;
  interests?: unknown;
  ai_recommendations?: Recommendation[] | null;
};

type ItineraryEntry = { id: string; text: string };

type TimeOfDay = "morning" | "afternoon" | "evening" | "night" | "general";

interface ActivityStop {
  id: string;
  time?: string;
  title: string;
  timeOfDay: TimeOfDay;
  placesToVisit: string[];
  summaryPoints: string[];
  foodRecommendation?: string;
  practicalTip?: string;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  placesToVisit: string[];
  stops: ActivityStop[];
}

interface ChecklistItem {
  item: string;
  details: string;
}

interface ParsedItinerary {
  introLines: string[];
  days: ItineraryDay[];
  checklist: ChecklistItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRAVEL_MODES: Record<string, { label: string; icon: typeof Plane }> = {
  flight: { label: "Flight", icon: Plane },
  plane: { label: "Flight", icon: Plane },
  train: { label: "Train", icon: Train },
  car: { label: "Car", icon: Car },
  bike: { label: "Bike", icon: Bike },
  cycle: { label: "Bike", icon: Bike },
  bus: { label: "Bus", icon: Bus },
};

const TIME_CONFIG: Record<
  TimeOfDay,
  { label: string; icon: typeof Sun; badge: string; border: string; bg: string }
> = {
  morning: {
    label: "Morning",
    icon: Sunrise,
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    border: "border-amber-200",
    bg: "from-amber-50/70 to-orange-50/20",
  },
  afternoon: {
    label: "Afternoon",
    icon: Sun,
    badge: "bg-sky-100 text-sky-900 border-sky-300",
    border: "border-sky-200",
    bg: "from-sky-50/70 to-blue-50/20",
  },
  evening: {
    label: "Evening",
    icon: Sunset,
    badge: "bg-rose-100 text-rose-900 border-rose-300",
    border: "border-rose-200",
    bg: "from-rose-50/70 to-orange-50/20",
  },
  night: {
    label: "Night",
    icon: Moon,
    badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
    border: "border-indigo-200",
    bg: "from-indigo-50/70 to-purple-50/20",
  },
  general: {
    label: "Highlight",
    icon: MapPin,
    badge: "bg-teal-100 text-teal-900 border-teal-300",
    border: "border-teal-200",
    bg: "from-teal-50/70 to-emerald-50/20",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const datePart = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = datePart
    ? new Date(Number(datePart[1]), Number(datePart[2]) - 1, Number(datePart[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function readRecommendationText(
  content: RecommendationContent | null | undefined
): string | null {
  if (!content || typeof content !== "object") return null;
  if (!("text" in content)) return null;
  const text = (content as { text?: unknown }).text;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

function cleanMarkdown(s: string): string {
  if (!s) return "";
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[•\-*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extracts place names or landmarks from bold tokens in text */
function extractPlaces(text: string): string[] {
  const places: string[] = [];
  const boldMatches = text.matchAll(/\*\*(.+?)\*\*/g);
  for (const m of boldMatches) {
    const candidate = m[1].trim();
    if (
      !candidate.match(/^\d{1,2}:\d{2}/) &&
      !candidate.match(
        /^(morning|afternoon|evening|night|breakfast|lunch|dinner|leave|ride|arrive|return|food|restaurant|places to visit|day \d+)/i
      ) &&
      candidate.length > 2 &&
      candidate.length < 45
    ) {
      places.push(cleanMarkdown(candidate));
    }
  }
  return Array.from(new Set(places));
}

function determineTimeOfDay(timeString?: string, defaultSlot?: TimeOfDay): TimeOfDay {
  if (defaultSlot && defaultSlot !== "general") return defaultSlot;
  if (!timeString) return "general";

  const hourMatch = timeString.match(/(\d{1,2}):\d{2}/);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1], 10);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  const lower = timeString.toLowerCase();
  if (lower.includes("morning") || lower.includes("breakfast")) return "morning";
  if (lower.includes("afternoon") || lower.includes("lunch")) return "afternoon";
  if (lower.includes("evening") || lower.includes("sunset") || lower.includes("dinner"))
    return "evening";
  if (lower.includes("night")) return "night";

  return "general";
}

// ─── Robust Parser for Markdown Tables & Markdown Headings ───────────────────

function parseItineraryText(rawText: string): ParsedItinerary {
  const lines = rawText.split(/\r?\n/);
  const introLines: string[] = [];
  const days: ItineraryDay[] = [];
  const checklist: ChecklistItem[] = [];

  let currentDay: ItineraryDay | null = null;
  let currentStop: ActivityStop | null = null;
  let currentTimeOfDay: TimeOfDay = "general";
  let inChecklist = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Detect Quick-Reference / Checklist sections
    if (
      line.toLowerCase().includes("checklist") ||
      line.toLowerCase().includes("quick-reference") ||
      line.toLowerCase().includes("travel tips")
    ) {
      inChecklist = true;
      continue;
    }

    // Parse checklist rows
    if (inChecklist) {
      if (line.startsWith("|")) {
        if (line.match(/^\|\s*[-:]+\s*\|/)) continue;
        const cells = line.split("|").slice(1, -1).map((c) => cleanMarkdown(c));
        if (cells.length >= 2 && !cells[0].toLowerCase().includes("item")) {
          checklist.push({ item: cells[0], details: cells[1] });
        }
      } else if (line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/)) {
        const itemText = cleanMarkdown(line);
        const parts = itemText.split(/:\s*/);
        checklist.push({
          item: parts[0] || "Tip",
          details: parts.slice(1).join(": ") || parts[0],
        });
      }
      continue;
    }

    // Check Day Headings: "### Day 1: ...", "Day 1 - ...", or "**One-Day Bike-Trip...**"
    const dayHeadingMatch =
      line.match(/^(?:#{1,3}\s*)?(Day\s+\d+\b[^\n]*?)\s*$/i) ||
      line.match(/^\*\*(?:One[‑-]Day|[0-9]+[‑-]Day)\s+([^*]+)\*\*/i);

    if (dayHeadingMatch) {
      const headingTitle = dayHeadingMatch[1]
        ? cleanMarkdown(dayHeadingMatch[1].replace(/^#+\s*/, ""))
        : `Day ${days.length + 1}`;

      currentDay = {
        dayNumber: days.length + 1,
        title: headingTitle,
        placesToVisit: [],
        stops: [],
      };
      days.push(currentDay);
      currentStop = null;
      currentTimeOfDay = "general";
      continue;
    }

    // Ensure a currentDay exists before processing activities
    if (!currentDay) {
      currentDay = {
        dayNumber: 1,
        title: "Day 1: Itinerary",
        placesToVisit: [],
        stops: [],
      };
      days.push(currentDay);
    }

    // ── Table Format Parser (e.g. | Time | Activity | Notes | Food |) ──
    if (line.startsWith("|")) {
      if (line.match(/^\|\s*[-:]+\s*\|/)) continue; // ignore divider row
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.length >= 2) {
        // Skip table header row
        if (
          cells[0].toLowerCase().includes("time") ||
          cells[1].toLowerCase().includes("activity") ||
          cells[0].toLowerCase().includes("item")
        ) {
          continue;
        }

        const rawTime = cells[0];
        const rawActivity = cells[1];
        const rawNotes = cells[2] || "";
        const rawFood = cells[3] || "";

        const timeClean = cleanMarkdown(rawTime);
        const titleClean = cleanMarkdown(rawActivity);

        const timeOfDay = determineTimeOfDay(timeClean);

        // Break notes into clean, short summary bullet points (stripping <br> / long essays)
        const summaryPoints = rawNotes
          .split(/<br\s*\/?>|\n|•/)
          .map((p) => cleanMarkdown(p))
          .filter((p) => p.length > 3 && p !== "—" && !p.startsWith("Restaurant suggestion:"));

        const places = [
          ...extractPlaces(rawActivity),
          ...extractPlaces(rawNotes),
        ];

        const foodClean = cleanMarkdown(rawFood);

        currentDay.stops.push({
          id: `stop-${currentDay.stops.length + 1}`,
          time: timeClean !== "—" && timeClean.length > 0 ? timeClean : undefined,
          title: titleClean,
          timeOfDay,
          placesToVisit: places,
          summaryPoints: summaryPoints.slice(0, 3), // short summary only!
          foodRecommendation:
            foodClean && foodClean !== "—" ? foodClean : undefined,
        });

        // Collect all distinct places to visit for the day
        places.forEach((p) => {
          if (!currentDay!.placesToVisit.includes(p)) {
            currentDay!.placesToVisit.push(p);
          }
        });

        continue;
      }
    }

    // ── Markdown Headings & Bullet Format Parser ──

    // 1. "Places to Visit:" summary line
    const placesLineMatch = line.match(/^\*?\*?Places to Visit\*?\*?:\s*(.+)$/i);
    if (placesLineMatch) {
      const extracted = placesLineMatch[1]
        .split(/,|;|•/)
        .map((p) => cleanMarkdown(p))
        .filter((p) => p.length > 2);
      extracted.forEach((p) => {
        if (!currentDay!.placesToVisit.includes(p)) {
          currentDay!.placesToVisit.push(p);
        }
      });
      continue;
    }

    // 2. Time-of-day subheadings: #### Morning, #### Afternoon, etc.
    const timeOfDayMatch = line.match(
      /^(?:#{2,4}\s*)?(Morning|Afternoon|Evening|Night)(?:\s*\([^)]*\))?:?\s*$/i
    );
    if (timeOfDayMatch) {
      const slot = timeOfDayMatch[1].toLowerCase() as TimeOfDay;
      currentTimeOfDay = slot;
      currentStop = {
        id: `stop-${currentDay.stops.length + 1}`,
        title: `${timeOfDayMatch[1]} Highlights`,
        timeOfDay: slot,
        placesToVisit: [],
        summaryPoints: [],
      };
      currentDay.stops.push(currentStop);
      continue;
    }

    // 3. Bullet points: - **Place Name**: Short summary note
    const bulletMatch = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[1].trim();

      const isFood =
        content.toLowerCase().startsWith("food:") ||
        content.toLowerCase().startsWith("restaurant:") ||
        content.toLowerCase().startsWith("breakfast:") ||
        content.toLowerCase().startsWith("lunch:") ||
        content.toLowerCase().startsWith("dinner:");

      if (!currentStop) {
        currentStop = {
          id: `stop-${currentDay.stops.length + 1}`,
          title: "Highlights",
          timeOfDay: currentTimeOfDay,
          placesToVisit: [],
          summaryPoints: [],
        };
        currentDay.stops.push(currentStop);
      }

      if (isFood) {
        currentStop.foodRecommendation = cleanMarkdown(content);
      } else {
        const placeBold = content.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
        if (placeBold) {
          const placeName = cleanMarkdown(placeBold[1]);
          const placeDesc = cleanMarkdown(placeBold[2]);
          if (!currentDay.placesToVisit.includes(placeName)) {
            currentDay.placesToVisit.push(placeName);
          }
          if (!currentStop.placesToVisit.includes(placeName)) {
            currentStop.placesToVisit.push(placeName);
          }
          currentStop.summaryPoints.push(`${placeName}: ${placeDesc}`);
        } else {
          currentStop.summaryPoints.push(cleanMarkdown(content));
        }
      }
      continue;
    }

    // Fallback: non-empty intro lines before activities
    if (days.length === 1 && currentDay.stops.length === 0) {
      introLines.push(cleanMarkdown(line));
    }
  }

  return { introLines, days, checklist };
}

// ─── Visual UI Components ─────────────────────────────────────────────────────

/** Quick Summary Bar of all places to visit for a Day */
function PlacesToVisitBar({ places }: { places: string[] }) {
  if (!places.length) return null;

  return (
    <div className="mb-6 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/90 via-emerald-50/40 to-slate-50 p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
          <MapPin className="h-4 w-4 text-teal-700" />
          <span>Where to Visit • Quick Summary</span>
        </div>
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
          {places.length} {places.length === 1 ? "Spot" : "Spots"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {places.map((place, idx) => (
          <span
            key={`${place}-${idx}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-teal-400 hover:shadow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            {place}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Individual Activity Timeline Stop Card */
function ActivityStopCard({ stop }: { stop: ActivityStop }) {
  const config = TIME_CONFIG[stop.timeOfDay] || TIME_CONFIG.general;
  const TimeIcon = config.icon;

  return (
    <div className={`overflow-hidden rounded-2xl border ${config.border} bg-white shadow-sm transition hover:shadow-md`}>
      {/* Top Header of Stop: Time of Day badge + Time Range Pill */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${config.border} bg-gradient-to-r ${config.bg} px-4 py-3 md:px-5`}>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${config.badge}`}>
            <TimeIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          {stop.time && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {stop.time}
            </span>
          )}
        </div>

        {stop.placesToVisit.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 text-teal-600" />
            <span className="font-semibold text-slate-700">
              {stop.placesToVisit[0]}
            </span>
            {stop.placesToVisit.length > 1 && (
              <span className="text-slate-400">
                +{stop.placesToVisit.length - 1} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stop Content Body */}
      <div className="p-4 md:p-5">
        <h4 className="text-base font-bold text-slate-900 md:text-lg">
          {stop.title}
        </h4>

        {/* Short Summary Points */}
        {stop.summaryPoints.length > 0 && (
          <ul className="mt-3 space-y-2">
            {stop.summaryPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Food / Dining Recommendation */}
        {stop.foodRecommendation && (
          <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50/80 p-3 text-xs text-orange-950">
            <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
            <div>
              <span className="font-bold text-orange-900">Food & Dining: </span>
              <span className="font-medium text-orange-950">
                {stop.foodRecommendation.replace(/^Food:\s*/i, "")}
              </span>
            </div>
          </div>
        )}

        {/* Practical Tip */}
        {stop.practicalTip && (
          <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-xs text-teal-950">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            <div>
              <span className="font-bold text-teal-900">Travel Note: </span>
              <span className="font-medium text-teal-950">
                {stop.practicalTip}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Travel Checklist Card */
function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  if (!items.length) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-xl bg-teal-50 p-2.5">
          <Luggage className="h-5 w-5 text-teal-700" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Travel Checklist & Quick Tips
          </h3>
          <p className="text-xs text-slate-500">
            Practical essentials prepared for this trip
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-800">
                {item.item}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {item.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Structured Day Itinerary View */
function StructuredItineraryView({ text }: { text: string }) {
  const { introLines, days, checklist } = parseItineraryText(text);

  return (
    <div className="space-y-8">
      {/* Intro lines if any */}
      {introLines.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
          {introLines.map((line, i) => (
            <p key={i} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Day Cards */}
      {days.map((day, dayIndex) => (
        <article
          key={`day-${day.dayNumber}-${dayIndex}`}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 p-5 md:p-7 shadow-sm"
        >
          {/* Day Header Banner */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#1e355c] text-sm font-black text-white shadow-sm">
                {dayIndex + 1}
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Day {dayIndex + 1} Plan
                </span>
                <h3 className="text-lg font-extrabold text-[#1e355c] md:text-xl">
                  {day.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200 shadow-sm">
                {day.stops.length} {day.stops.length === 1 ? "Stop" : "Stops"}
              </span>
            </div>
          </div>

          {/* Places To Visit Quick Summary Bar */}
          <PlacesToVisitBar places={day.placesToVisit} />

          {/* Activity Stops List */}
          <div className="space-y-4">
            {day.stops.map((stop) => (
              <ActivityStopCard key={stop.id} stop={stop} />
            ))}
          </div>
        </article>
      ))}

      {/* Checklist section */}
      <ChecklistCard items={checklist} />
    </div>
  );
}

/** Overview Info Card */
function InfoCard({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: typeof MapPin;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-teal-700" />
        {label}
      </div>
      <p
        className={`break-words text-[15px] font-semibold capitalize text-slate-900 ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Loading / Error States ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
      <p className="font-medium text-slate-600">Loading your trip details…</p>
    </main>
  );
}

function ErrorState({
  notFound,
  error,
  onRetry,
  onBack,
}: {
  notFound: boolean;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Compass className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {notFound ? "Trip not found" : "Unable to load trip"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {notFound
            ? "This trip may have been removed or you may not have access to it."
            : error ?? "Trip details are unavailable right now."}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          {!notFound && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e355c] px-5 py-2.5 font-semibold text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e355c] transition hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to saved trips
          </button>
        </div>
      </section>
    </main>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tripId = typeof params.id === "string" ? params.id : "";

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(tripId));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // ─── Fetch Trip ───────────────────────────────────────────────────────────

  const fetchTrip = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}`, {
          signal,
          cache: "no-store",
        });
        const data: unknown = await response.json().catch(() => null);

        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          const message =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as Record<string, unknown>).error === "string"
              ? String((data as Record<string, unknown>).error)
              : "We could not load this trip. Please try again.";
          throw new Error(message);
        }
        if (
          !data ||
          typeof data !== "object" ||
          !("id" in data) ||
          typeof (data as Record<string, unknown>).id !== "string"
        ) {
          throw new Error("The trip details response was incomplete. Please retry.");
        }
        setTrip(data as TripDetails);
      } catch (cause) {
        if (signal.aborted) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "We could not load this trip. Please try again."
        );
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    },
    [tripId]
  );

  useEffect(() => {
    if (!tripId) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => void fetchTrip(controller.signal), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchTrip, attempt, tripId]);

  // ─── Derived Values ───────────────────────────────────────────────────────

  const dates = {
    start: formatDate(trip?.start_date),
    end: formatDate(trip?.end_date),
  };

  const duration = (() => {
    if (
      typeof trip?.trip_days === "number" &&
      Number.isFinite(trip.trip_days) &&
      trip.trip_days > 0
    )
      return trip.trip_days;
    if (!trip?.start_date || !trip.end_date) return null;
    const start = Date.parse(`${trip.start_date.slice(0, 10)}T00:00:00Z`);
    const end = Date.parse(`${trip.end_date.slice(0, 10)}T00:00:00Z`);
    return Number.isFinite(start) && Number.isFinite(end) && end >= start
      ? Math.round((end - start) / 86_400_000) + 1
      : null;
  })();

  const interests = Array.isArray(trip?.interests)
    ? trip.interests.filter(
        (item): item is string => typeof item === "string" && Boolean(item.trim())
      )
    : [];

  const itineraryRecommendations: ItineraryEntry[] = (() => {
    const recommendations = Array.isArray(trip?.ai_recommendations)
      ? trip.ai_recommendations
      : [];
    const seen = new Set<string>();
    return recommendations.flatMap((rec, index) => {
      if (rec.recommendation_type && rec.recommendation_type !== "itinerary")
        return [];
      const text = readRecommendationText(rec.content);
      if (!text || seen.has(text)) return [];
      seen.add(text);
      return [{ id: rec.id ?? `${index}-${text.slice(0, 24)}`, text }];
    });
  })();

  const modeKey = trip?.travel_mode?.trim().toLowerCase() ?? "";
  const mode = TRAVEL_MODES[modeKey];

  if (isLoading) return <LoadingState />;

  if (error || notFound || !trip)
    return (
      <ErrorState
        notFound={notFound}
        error={error}
        onRetry={() => setAttempt((n) => n + 1)}
        onBack={() => router.push("/saved-trips")}
      />
    );

  const destination = trip.destination_name?.trim() || "Untitled trip";
  const origin = trip.origin_name?.trim() || null;
  const travelModeLabel =
    mode?.label ?? trip.travel_mode?.trim().replace(/[-_]/g, " ") ?? null;
  const dateRange =
    dates.start && dates.end
      ? `${dates.start} – ${dates.end}`
      : dates.start ?? dates.end ?? null;
  const statusLabel = trip.status?.trim() || "Planning";
  const tripTypeLabel = trip.trip_type
    ? trip.trip_type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <header className="relative bg-gradient-to-br from-[#1e355c] via-[#1a4a72] to-[#27788e] px-5 pb-20 pt-8 text-white md:px-8 md:pb-24 md:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-6xl">
          <button
            onClick={() => router.push("/saved-trips")}
            className="mb-8 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-teal-200 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to saved trips
          </button>

          <div className="flex items-start gap-4">
            <div className="mt-1 shrink-0 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <MapPin className="h-7 w-7 text-teal-200" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                Trip details
              </p>
              <h1 className="break-words text-3xl font-extrabold tracking-tight md:text-5xl">
                {destination}
              </h1>

              {origin && (
                <p className="mt-2.5 flex items-center gap-1.5 text-sm text-blue-100 md:text-base">
                  <Navigation className="h-3.5 w-3.5 shrink-0" />
                  Starting from&nbsp;
                  <span className="font-semibold">{origin}</span>
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                {dateRange && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                    <CalendarDays className="h-3.5 w-3.5 text-teal-300" />
                    {dateRange}
                  </span>
                )}
                {duration && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                    <Clock3 className="h-3.5 w-3.5 text-teal-300" />
                    {duration}&nbsp;{duration === 1 ? "day" : "days"}
                  </span>
                )}
                {travelModeLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 capitalize backdrop-blur-sm">
                    {mode ? (
                      <mode.icon className="h-3.5 w-3.5 text-teal-300" />
                    ) : (
                      <Route className="h-3.5 w-3.5 text-teal-300" />
                    )}
                    {travelModeLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 capitalize backdrop-blur-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content Body ─────────────────────────────────────────────────── */}
      <div className="mx-auto -mt-10 max-w-6xl space-y-6 px-5 md:px-8">
        {/* ── A. Trip Overview ─────────────────────────────────────────── */}
        <section aria-labelledby="overview-heading">
          <h2
            id="overview-heading"
            className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <Info className="h-5 w-5 text-teal-700" />
            Trip overview
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              label="Origin"
              value={origin ?? "Not specified"}
              icon={Navigation}
              valueClassName={
                !origin ? "text-slate-400 normal-case font-normal text-sm" : ""
              }
            />
            <InfoCard label="Destination" value={destination} icon={MapPin} />
            <InfoCard
              label="Travel mode"
              value={travelModeLabel ?? "Not specified"}
              icon={mode?.icon ?? Compass}
              valueClassName={
                !travelModeLabel
                  ? "text-slate-400 normal-case font-normal text-sm"
                  : ""
              }
            />
            <InfoCard
              label="Travel dates"
              value={dateRange ?? "Dates not set"}
              icon={CalendarDays}
              valueClassName={
                !dateRange ? "text-slate-400 normal-case font-normal text-sm" : ""
              }
            />
            <InfoCard
              label="Duration"
              value={
                duration
                  ? `${duration} ${duration === 1 ? "day" : "days"}`
                  : "Not specified"
              }
              icon={Clock3}
              valueClassName={
                !duration ? "text-slate-400 normal-case font-normal text-sm" : ""
              }
            />
            <InfoCard label="Status" value={statusLabel} icon={CheckCircle2} />
            {tripTypeLabel && (
              <InfoCard label="Trip type" value={tripTypeLabel} icon={Route} />
            )}
          </div>
        </section>

        {/* ── B. Selected Interests ─────────────────────────────────────── */}
        <section
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          aria-labelledby="interests-heading"
        >
          <h2
            id="interests-heading"
            className="flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <Tag className="h-5 w-5 text-teal-700" />
            Selected interests
          </h2>

          {interests.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="rounded-full border border-teal-100 bg-teal-50 px-3.5 py-1.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p className="text-sm text-slate-500">
                No interests were selected for this trip.
              </p>
            </div>
          )}
        </section>

        {/* ── C. AI-Generated Itinerary ─────────────────────────────────── */}
        <section
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          aria-labelledby="itinerary-heading"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="shrink-0 rounded-xl bg-amber-50 p-2.5">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </span>
            <div>
              <h2
                id="itinerary-heading"
                className="text-xl font-bold text-slate-900"
              >
                AI-Generated Itinerary & Highlights
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Curated highlights, key spots to visit, and local dining suggestions
              </p>
            </div>
          </div>

          {itineraryRecommendations.length ? (
            <div className="space-y-8">
              {itineraryRecommendations.map((rec, index) => (
                <article key={rec.id} className="space-y-6">
                  {itineraryRecommendations.length > 1 && (
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {index + 1}
                      </span>
                      <h3 className="text-base font-semibold text-slate-800">
                        Itinerary Option {index + 1}
                      </h3>
                    </div>
                  )}

                  {/* Render Structured Timeline View */}
                  <StructuredItineraryView text={rec.text} />

                  {index < itineraryRecommendations.length - 1 && (
                    <hr className="border-slate-200" />
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <p className="font-semibold text-slate-700">
                No generated itinerary yet
              </p>
              <p className="mt-1.5 text-sm text-slate-500">
                The trip was saved, but an AI itinerary has not been attached. Go
                back and recreate the trip to generate one.
              </p>
              <button
                onClick={() => router.push("/create-trip")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e355c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                <Sparkles className="h-4 w-4" />
                Plan a new trip
              </button>
            </div>
          )}
        </section>

        {/* ── Footer Navigation ─────────────────────────────────────────── */}
        <div className="flex justify-start pb-2 pt-2">
          <button
            onClick={() => router.push("/saved-trips")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to saved trips
          </button>
        </div>
      </div>
    </main>
  );
}
