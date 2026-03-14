import type { College, CollegesApiResponse } from "./page";

// ─────────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────────

export const MOCK_COLLEGES: College[] = [
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
  {
    id: 10,
    name: "Indian Institute of Management, Ahmedabad",
    shortName: "IIM Ahmedabad",
    location: "Ahmedabad",
    state: "Gujarat",
    rating: 4.9,
    type: "Government",
    stream: "Commerce",
    courses: ["MBA", "PhD", "Executive MBA"],
    entranceExam: "CAT",
    emoji: "📊",
    color: "bg-red-500",
  },
  {
    id: 11,
    name: "Jadavpur University",
    shortName: "Jadavpur Kolkata",
    location: "Kolkata",
    state: "West Bengal",
    rating: 4.6,
    type: "Government",
    stream: "Science",
    courses: ["B.Tech", "M.Tech", "B.Sc", "PhD"],
    entranceExam: "WBJEE",
    emoji: "🔬",
    color: "bg-lime-500",
  },
  {
    id: 12,
    name: "Hyderabad Central University",
    shortName: "HCU Hyderabad",
    location: "Hyderabad",
    state: "Telangana",
    rating: 4.4,
    type: "Government",
    stream: "Arts",
    courses: ["BA", "MA", "MPhil", "PhD"],
    entranceExam: "CUET PG",
    emoji: "🏺",
    color: "bg-amber-500",
  },
];

// ─────────────────────────────────────────────
// MOCK FETCH
// Simulates the same filtering + pagination your
// real backend will do. When backend is ready,
// delete this file and update the fetch URL in
// useColleges() inside CollegesPage.tsx.
// ─────────────────────────────────────────────

export async function fetchCollegesMock(
  params: URLSearchParams
): Promise<CollegesApiResponse> {
  // Simulate network delay (remove if too slow during dev)
  await new Promise((res) => setTimeout(res, 500));

  const search = params.get("search")?.toLowerCase() ?? "";
  const stream = params.get("stream") ?? "";
  const state = params.get("state") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.max(1, Number(params.get("pageSize") ?? 9));

  // Filter
  const filtered = MOCK_COLLEGES.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search) ||
      c.shortName.toLowerCase().includes(search);
    const matchStream = !stream || c.stream === stream;
    const matchState = !state || c.state === state;
    return matchSearch && matchStream && matchState;
  });

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data, total, page, pageSize, totalPages };
}