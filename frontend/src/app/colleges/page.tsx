"use client";

import { useState } from "react";

const colleges = [
  {
    id: 1,
    name: "Indian Institute of Technology, Delhi",
    shortName: "IIT Delhi",
    location: "New Delhi",
    state: "Delhi",
    rating: 4.9,
    type: "Government",
    stream: "Science",
    courses: ["B.Tech", "M.Tech", "PhD", "MBA"],
    entranceExam: "JEE Advanced",
    emoji: "🏛️",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Delhi University — Lady Shri Ram College",
    shortName: "LSR Delhi",
    location: "New Delhi",
    state: "Delhi",
    rating: 4.7,
    type: "Government",
    stream: "Arts",
    courses: ["BA Economics", "BA English", "BA Psychology", "B.Com"],
    entranceExam: "CUET",
    emoji: "🎓",
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Symbiosis International University",
    shortName: "Symbiosis Pune",
    location: "Pune",
    state: "Maharashtra",
    rating: 4.5,
    type: "Private",
    stream: "Commerce",
    courses: ["BBA", "MBA", "B.Com", "Economics"],
    entranceExam: "SET",
    emoji: "🏫",
    color: "bg-indigo-500",
  },
  {
    id: 4,
    name: "AIIMS New Delhi",
    shortName: "AIIMS Delhi",
    location: "New Delhi",
    state: "Delhi",
    rating: 4.9,
    type: "Government",
    stream: "Science",
    courses: ["MBBS", "MD", "MS", "B.Sc Nursing"],
    entranceExam: "NEET",
    emoji: "🏥",
    color: "bg-green-500",
  },
  {
    id: 5,
    name: "National Institute of Fashion Technology",
    shortName: "NIFT Mumbai",
    location: "Mumbai",
    state: "Maharashtra",
    rating: 4.6,
    type: "Government",
    stream: "Arts",
    courses: ["B.Des", "M.Des", "B.FTech"],
    entranceExam: "NIFT Entrance",
    emoji: "🎨",
    color: "bg-pink-500",
  },
  {
    id: 6,
    name: "Christ University",
    shortName: "Christ Bangalore",
    location: "Bangalore",
    state: "Karnataka",
    rating: 4.4,
    type: "Private",
    stream: "Commerce",
    courses: ["BBA", "B.Com", "MBA", "BA Economics"],
    entranceExam: "CUET / Direct",
    emoji: "🌟",
    color: "bg-yellow-500",
  },
  {
    id: 7,
    name: "Bits Pilani",
    shortName: "BITS Pilani",
    location: "Pilani",
    state: "Rajasthan",
    rating: 4.8,
    type: "Private",
    stream: "Science",
    courses: ["B.Tech", "M.Tech", "MBA", "M.Sc"],
    entranceExam: "BITSAT",
    emoji: "⚙️",
    color: "bg-orange-500",
  },
  {
    id: 8,
    name: "Jawaharlal Nehru University",
    shortName: "JNU Delhi",
    location: "New Delhi",
    state: "Delhi",
    rating: 4.6,
    type: "Government",
    stream: "Arts",
    courses: ["BA", "MA", "MPhil", "PhD"],
    entranceExam: "CUET PG",
    emoji: "📚",
    color: "bg-teal-500",
  },
  {
    id: 9,
    name: "Narsee Monjee Institute of Management",
    shortName: "NMIMS Mumbai",
    location: "Mumbai",
    state: "Maharashtra",
    rating: 4.5,
    type: "Private",
    stream: "Commerce",
    courses: ["BBA", "MBA", "B.Com", "B.Tech"],
    entranceExam: "NPAT",
    emoji: "💼",
    color: "bg-cyan-500",
  },
];

const streams = ["All", "Science", "Commerce", "Arts"];
const locations = ["All", "Delhi", "Maharashtra", "Karnataka", "Rajasthan"];

export default function CollegesPage() {
  const [search, setSearch] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCollege, setSelectedCollege] = useState<typeof colleges[0] | null>(null);

  const filtered = colleges.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName.toLowerCase().includes(search.toLowerCase());
    const matchStream = selectedStream === "All" || c.stream === selectedStream;
    const matchLocation = selectedLocation === "All" || c.state === selectedLocation;
    return matchSearch && matchStream && matchLocation;
  });

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 text-sm transition-all"
            />
          </div>

          {/* Stream Filter */}
          <div className="flex gap-2 flex-wrap">
            {streams.map((s) => (
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
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "All" ? "📍 All Locations" : loc}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── RESULTS COUNT ── */}
      <section className="max-w-6xl mx-auto px-4 mt-8 mb-4">
        <p className="text-gray-500 text-sm">
          Showing <span className="font-semibold text-blue-500">{filtered.length}</span> colleges
          {selectedStream !== "All" && <span> in <span className="font-semibold text-gray-700">{selectedStream}</span></span>}
          {selectedLocation !== "All" && <span> from <span className="font-semibold text-gray-700">{selectedLocation}</span></span>}
        </p>
      </section>

      {/* ── COLLEGE CARDS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No colleges found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((college) => (
              <div
                key={college.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedCollege(college)}
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

                  {/* Location & Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      📍 {college.location}, {college.state}
                    </span>
                    <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-100">
                      ⭐ {college.rating}
                    </span>
                  </div>

                  {/* Entrance Exam */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400">Entrance:</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                      {college.entranceExam}
                    </span>
                  </div>

                  {/* Courses */}
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
            ))}
          </div>
        )}
      </section>

      {/* ── COLLEGE DETAIL MODAL ── */}
      {selectedCollege && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedCollege(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top */}
            <div className={`${selectedCollege.color} p-7 flex items-center gap-5`}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                {selectedCollege.emoji}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">{selectedCollege.shortName}</h2>
                <p className="text-white/80 text-sm">{selectedCollege.name}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-gray-800 font-semibold text-sm">
                    {selectedCollege.location}, {selectedCollege.state}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Rating</p>
                  <p className="text-yellow-500 font-bold text-sm">⭐ {selectedCollege.rating} / 5</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">College Type</p>
                  <p className="text-gray-800 font-semibold text-sm">{selectedCollege.type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Entrance Exam</p>
                  <p className="text-blue-600 font-semibold text-sm">{selectedCollege.entranceExam}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Courses Offered</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCollege.courses.map((course) => (
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
                  onClick={() => setSelectedCollege(null)}
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
      )}
    </main>
  );
}