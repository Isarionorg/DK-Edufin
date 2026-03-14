"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCollegesMock } from "./Colleges_mock_data";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface College {
  id: number;
  name: string;
  shortName: string;
  location: string;
  state: string;
  rating: number;
  type: "Government" | "Private" | "Deemed";
  stream: "Science" | "Commerce" | "Arts";
  courses: string[];
  entranceExam: string;
  emoji: string;
  color: string;
}

export interface CollegesApiResponse {
  data: College[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FetchState {
  colleges: College[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ITEMS_PER_PAGE = 9; // easily configurable

const STREAMS = ["All", "Science", "Commerce", "Arts"] as const;

const LOCATIONS = [
  "All",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Rajasthan",
  "Tamil Nadu",
  "West Bengal",
  "Telangana",
  "Gujarat",
] as const;

// ─────────────────────────────────────────────
// CUSTOM HOOK — useColleges
// Centralises all fetching logic. Swap the fetch
// URL to your real API endpoint.
// ─────────────────────────────────────────────

function useColleges(
  search: string,
  stream: string,
  location: string,
  page: number
) {
  const [state, setState] = useState<FetchState>({
    colleges: [],
    total: 0,
    totalPages: 0,
    isLoading: true,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchColleges = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(ITEMS_PER_PAGE),
        ...(search && { search }),
        ...(stream !== "All" && { stream }),
        ...(location !== "All" && { state: location }),
      });

      // ------------------------------------------------------------------------------------------------------

      // ── Replace this URL with your real backend endpoint ──
      // const res = await fetch(`/api/colleges?${params.toString()}`, {
      //   signal: abortRef.current.signal,
      // });

      // if (!res.ok) throw new Error(`Server error: ${res.status}`);

      // const json: CollegesApiResponse = await res.json();

      // --------------- above code will replace below code when the backend is ready --------------------

      const json = await fetchCollegesMock(params);

      setState({
        colleges: json.data,
        total: json.total,
        totalPages: json.totalPages,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // silently ignore cancelled requests
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (err as Error).message ?? "Something went wrong.",
      }));
    }
  }, [search, stream, location, page]);

  useEffect(() => {
    fetchColleges();
    return () => abortRef.current?.abort();
  }, [fetchColleges]);

  return { ...state, retry: fetchColleges };
}

// ─────────────────────────────────────────────
// DEBOUNCE HOOK
// Delays search API calls by `delay` ms after
// the user stops typing.
// ─────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-24 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-16 bg-gray-100 rounded-lg" />
          <div className="h-6 w-16 bg-gray-100 rounded-lg" />
          <div className="h-6 w-16 bg-gray-100 rounded-lg" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">Failed to load colleges</h3>
      <p className="text-gray-400 mb-6 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">No colleges found</h3>
      <p className="text-gray-400">Try adjusting your search or filters</p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Show at most 5 page numbers, centred around current page
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const buildPages = (): (number | "…")[] => {
    if (totalPages <= 7) return range(1, totalPages);
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    const pages: (number | "…")[] = [1];
    if (left > 2) pages.push("…");
    pages.push(...range(left, right));
    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
      <p className="text-sm text-gray-400">
        Showing <span className="font-semibold text-gray-600">{start}–{end}</span> of{" "}
        <span className="font-semibold text-gray-600">{total}</span> colleges
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-400 hover:text-blue-500 transition-all"
        >
          ← Prev
        </button>

        {buildPages().map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold border-2 transition-all ${
                page === p
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-400 hover:text-blue-500 transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function CollegeCard({
  college,
  onClick,
}: {
  college: College;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Card Top */}
      <div className={`${college.color} p-5 flex items-center gap-4`}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
          {college.emoji}
        </div>
        <div>
          <h3 className="text-white font-bold text-base leading-tight">
            {college.shortName}
          </h3>
          <p className="text-white/80 text-xs mt-0.5">{college.type}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <h4 className="text-gray-800 font-semibold text-sm mb-3 leading-snug">
          {college.name}
        </h4>

        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            📍 {college.location}, {college.state}
          </span>
          <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-100">
            ⭐ {college.rating}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">Entrance:</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
            {college.entranceExam}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {college.courses.slice(0, 3).map((course) => (
            <span
              key={course}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
            >
              {course}
            </span>
          ))}
          {college.courses.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg">
              +{college.courses.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5">
        <button className="w-full py-2.5 border-2 border-blue-200 text-blue-500 text-sm font-semibold rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200">
          View Details →
        </button>
      </div>
    </div>
  );
}

function CollegeModal({
  college,
  onClose,
}: {
  college: College;
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${college.color} p-7 flex items-center gap-5`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
            {college.emoji}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{college.shortName}</h2>
            <p className="text-white/80 text-sm">{college.name}</p>
          </div>
        </div>

        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Location", value: `${college.location}, ${college.state}`, className: "text-gray-800" },
              { label: "Rating", value: `⭐ ${college.rating} / 5`, className: "text-yellow-500 font-bold" },
              { label: "College Type", value: college.type, className: "text-gray-800" },
              { label: "Entrance Exam", value: college.entranceExam, className: "text-blue-600" },
            ].map(({ label, value, className }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`font-semibold text-sm ${className}`}>{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Courses Offered</p>
            <div className="flex flex-wrap gap-2">
              {college.courses.map((course) => (
                <span
                  key={course}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-medium border border-blue-100"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Close
            </button>
            <button className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all text-sm">
              Get Guidance →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────

export default function CollegesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  // Debounce search so we don't fire on every keystroke
  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, selectedStream, selectedLocation]);

  const { colleges, total, totalPages, isLoading, error, retry } = useColleges(
    debouncedSearch,
    selectedStream,
    selectedLocation,
    page
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            🎓 Explore Colleges
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Find Your Perfect College
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Browse top colleges across India. Filter by stream, location, and
            more to find the one that's right for you.
          </p>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col sm:flex-row gap-4">

          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search colleges by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 text-sm transition-all"
            />
          </div>

          {/* Stream Filter */}
          <div className="flex gap-2 flex-wrap">
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStream(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                  selectedStream === s
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:border-blue-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-700 text-sm font-medium transition-all"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "All" ? "📍 All Locations" : loc}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── RESULTS COUNT ── */}
      <section className="max-w-6xl mx-auto px-4 mt-8 mb-4 flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          {isLoading ? (
            <span className="inline-block w-40 h-4 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-blue-500">{total}</span> colleges
              {selectedStream !== "All" && (
                <span>
                  {" "}in{" "}
                  <span className="font-semibold text-gray-700">{selectedStream}</span>
                </span>
              )}
              {selectedLocation !== "All" && (
                <span>
                  {" "}from{" "}
                  <span className="font-semibold text-gray-700">{selectedLocation}</span>
                </span>
              )}
            </>
          )}
        </p>

        {/* Per-page info */}
        {!isLoading && totalPages > 1 && (
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </p>
        )}
      </section>

      {/* ── COLLEGE CARDS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton placeholders while loading
            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : colleges.length === 0 ? (
            <EmptyState />
          ) : (
            colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                onClick={() => setSelectedCollege(college)}
              />
            ))
          )}
        </div>

        {/* ── PAGINATION ── */}
        {!isLoading && !error && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={ITEMS_PER_PAGE}
            onChange={setPage}
          />
        )}
      </section>

      {/* ── COLLEGE DETAIL MODAL ── */}
      {selectedCollege && (
        <CollegeModal
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </main>
  );
}