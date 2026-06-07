"use client";

import { useState, useRef, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { ParsedRow } from "@/types/admin";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = [
  "collegeName",
  "collegeType",
  "city",
  "state",
  "isPartner",
  "courseName",
  "degreeType",
  "eligibleStreams",
  "exam",
  "category",
  "academicYear",
  "roundNumber",
];

const VALID_COLLEGE_TYPES = ["Government", "Private", "Deemed"];
const VALID_DEGREE_TYPES = ["UG", "PG", "Diploma"];
const VALID_STREAMS = ["PCM", "PCB", "COMMERCE", "HUMANITIES", "ANY"];
const VALID_EXAMS = ["CUET", "JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "KCET", "WBJEE", "Other"];
const VALID_CATEGORIES = ["UR/GENERAL", "OBC", "SC", "ST", "EWS", "PwBD"];

// ─── CSV Template ─────────────────────────────────────────────────────────────

const TEMPLATE_HEADERS = [
  "collegeName",
  "collegeType",
  "city",
  "state",
  "website",
  "isPartner",
  "courseName",
  "degreeType",
  "eligibleStreams",
  "exam",
  "category",
  "cutoffScore",
  "cutoffRank",
  "academicYear",
  "roundNumber",
];

const TEMPLATE_SAMPLE = [
  "Delhi University",
  "Government",
  "New Delhi",
  "Delhi",
  "https://du.ac.in",
  "yes",
  "B.Sc (Hons.) Mathematics",
  "UG",
  "PCM|PCB",
  "CUET",
  "UR/GENERAL",
  "680",
  "",
  "2025",
  "1",
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateRow(row: Record<string, string>, index: number): ParsedRow {
  const errors: string[] = [];

  const get = (key: string) => (row[key] || "").trim();

  if (!get("collegeName")) errors.push("collegeName is required");
  if (!VALID_COLLEGE_TYPES.includes(get("collegeType")))
    errors.push(`collegeType must be one of: ${VALID_COLLEGE_TYPES.join(", ")}`);
  if (!get("city")) errors.push("city is required");
  if (!get("state")) errors.push("state is required");
  if (!["yes", "no", "true", "false"].includes(get("isPartner").toLowerCase()))
    errors.push("isPartner must be yes/no");
  if (!get("courseName")) errors.push("courseName is required");
  if (!VALID_DEGREE_TYPES.includes(get("degreeType")))
    errors.push(`degreeType must be one of: ${VALID_DEGREE_TYPES.join(", ")}`);

  const streams = get("eligibleStreams").split("|").map((s) => s.trim());
  const invalidStreams = streams.filter((s) => !VALID_STREAMS.includes(s));
  if (invalidStreams.length > 0)
    errors.push(`Invalid streams: ${invalidStreams.join(", ")}. Use: ${VALID_STREAMS.join("|")}`);

  if (!VALID_EXAMS.includes(get("exam")))
    errors.push(`exam must be one of: ${VALID_EXAMS.join(", ")}`);
  if (!VALID_CATEGORIES.includes(get("category")))
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);

  const year = Number(get("academicYear"));
  if (!year || year < 2000 || year > 2100) errors.push("academicYear must be a valid year");
  const round = Number(get("roundNumber"));
  if (!round || round < 1) errors.push("roundNumber must be >= 1");

  const score = get("cutoffScore");
  const rank = get("cutoffRank");
  if (!score && !rank) errors.push("At least one of cutoffScore or cutoffRank is required");
  if (score && isNaN(Number(score))) errors.push("cutoffScore must be a number");
  if (rank && isNaN(Number(rank))) errors.push("cutoffRank must be a number");

  return {
    collegeName: get("collegeName"),
    collegeType: get("collegeType"),
    city: get("city"),
    state: get("state"),
    website: get("website"),
    isPartner: get("isPartner"),
    courseName: get("courseName"),
    degreeType: get("degreeType"),
    eligibleStreams: get("eligibleStreams"),
    exam: get("exam"),
    category: get("category"),
    cutoffScore: score || undefined,
    cutoffRank: rank || undefined,
    academicYear: get("academicYear"),
    roundNumber: get("roundNumber"),
    rowIndex: index,
    errors,
    isValid: errors.length === 0,
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    // Handle quoted commas
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
}

// ─── Download Template ────────────────────────────────────────────────────────

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS.join(","), TEMPLATE_SAMPLE.join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dk_edufin_bulk_upload_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkUploadPage() {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const processFile = useCallback((file: File) => {
    if (!file) return;

    const isCSV = file.name.endsWith(".csv");
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isCSV && !isExcel) {
      alert("Only .csv or .xlsx/.xls files are supported.");
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setParsedRows([]);
    setCommitted(false);

    if (isCSV) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rawRows = parseCSV(text);
        const rows = rawRows.map((r, i) => validateRow(r, i + 2)); // +2 for header + 1-index
        setParsedRows(rows);
        setUploading(false);
      };
      reader.readAsText(file);
    } else {
      // For Excel: dynamically import SheetJS (xlsx) — works in Next.js
      import("xlsx").then((XLSX) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          const rows = json.map((r, i) => validateRow(r, i + 2));
          setParsedRows(rows);
          setUploading(false);
        };
        reader.readAsArrayBuffer(file);
      }).catch(() => {
        alert("Could not load Excel parser. Please use a CSV file instead.");
        setUploading(false);
      });
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const toggleErrorExpand = (index: number) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleCommit = () => {
    // TODO: Send validRows to API
    setCommitted(true);
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName("");
    setCommitted(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader
        title="Bulk Upload"
        subtitle="Import college cutoff data from a CSV or Excel file provided by colleges"
      />

      <div className="flex-1 p-8 space-y-6">

        {/* Info Banner */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-start gap-3">
          <Info size={16} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#1D4ED8]">
            <p className="font-semibold mb-1">How it works</p>
            <p className="text-[#3B82F6]">
              Download the template, share it with the college. They fill it in and send back the file.
              Upload it here — the parser validates each row and shows errors before you commit to the database.
              Use <code className="bg-white/60 px-1 rounded text-xs">|</code> to separate multiple streams (e.g. <code className="bg-white/60 px-1 rounded text-xs">PCM|PCB</code>).
            </p>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">CSV Template</p>
              <p className="text-xs text-gray-400 mt-0.5">
                dk_edufin_bulk_upload_template.csv — share this with partner colleges
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <Download size={15} />
            Download Template
          </button>
        </div>

        {/* Field Reference */}
        <details className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <summary className="px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer flex items-center gap-2 select-none list-none">
            <ChevronDown size={15} className="text-gray-400" />
            View expected columns &amp; valid values
          </summary>
          <div className="px-6 pb-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {["Column", "Required", "Valid Values / Format"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {[
                  ["collegeName", "✓", "Any text"],
                  ["collegeType", "✓", "Government | Private | Deemed"],
                  ["city", "✓", "Any text"],
                  ["state", "✓", "Any text"],
                  ["website", "", "URL (optional)"],
                  ["isPartner", "✓", "yes / no"],
                  ["courseName", "✓", "Any text"],
                  ["degreeType", "✓", "UG | PG | Diploma"],
                  ["eligibleStreams", "✓", "PCM | PCB | COMMERCE | HUMANITIES | ANY (pipe-separated for multiple)"],
                  ["exam", "✓", "CUET | JEE_MAIN | JEE_ADVANCED | MHT_CET | KCET | WBJEE | Other"],
                  ["category", "✓", "UR/GENERAL | OBC | SC | ST | EWS | PwBD"],
                  ["cutoffScore", "", "Number (used for CUET)"],
                  ["cutoffRank", "", "Number (used for JEE/CETs)"],
                  ["academicYear", "✓", "4-digit year e.g. 2025"],
                  ["roundNumber", "✓", "1, 2, 3…"],
                ].map(([col, req, values]) => (
                  <tr key={col} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-[#2563EB]">{col}</td>
                    <td className="px-3 py-2 text-center">{req}</td>
                    <td className="px-3 py-2 text-gray-500">{values}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Upload Zone */}
        {!parsedRows.length && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`bg-white rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              dragOver
                ? "border-[#2563EB] bg-[#EFF6FF]"
                : "border-gray-200 hover:border-[#2563EB]/50 hover:bg-gray-50"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              dragOver ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-400"
            }`}>
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                {uploading ? "Parsing file…" : "Drop your file here, or click to browse"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports .csv and .xlsx / .xls</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Parse Results */}
        {parsedRows.length > 0 && !committed && (
          <div className="space-y-4">
            {/* Summary Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <FileSpreadsheet size={18} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-800">{fileName}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                  <CheckCircle2 size={14} />
                  {validRows.length} valid
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    <XCircle size={14} />
                    {invalidRows.length} errors
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  title="Reset"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Error Rows */}
            {invalidRows.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h3 className="text-sm font-semibold text-red-700">
                    {invalidRows.length} rows have errors — fix in the file and re-upload
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {invalidRows.map((row) => (
                    <div key={row.rowIndex} className="px-6 py-3">
                      <button
                        onClick={() => toggleErrorExpand(row.rowIndex)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          Row {row.rowIndex}: {row.collegeName || "(no college name)"}
                          {row.courseName ? ` — ${row.courseName}` : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 font-medium">{row.errors.length} error{row.errors.length > 1 ? "s" : ""}</span>
                          {expandedErrors.has(row.rowIndex) ? (
                            <ChevronUp size={14} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={14} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                      {expandedErrors.has(row.rowIndex) && (
                        <ul className="mt-2 space-y-1">
                          {row.errors.map((err, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                              <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                              {err}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid Rows Preview */}
            {validRows.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    {validRows.length} rows ready to import
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {["#", "College", "Type", "Course", "Degree", "Streams", "Exam", "Category", "Score", "Rank", "Year", "Rnd"].map(
                          (h) => (
                            <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap first:pl-6 last:pr-6">
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {validRows.map((row) => (
                        <tr key={row.rowIndex} className="hover:bg-gray-50">
                          <td className="pl-6 px-3 py-2.5 text-gray-400">{row.rowIndex}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[120px] truncate">{row.collegeName}</td>
                          <td className="px-3 py-2.5 text-gray-600">{row.collegeType}</td>
                          <td className="px-3 py-2.5 text-gray-700 max-w-[130px] truncate">{row.courseName}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                              {row.degreeType}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{row.eligibleStreams}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.exam}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.category}</td>
                          <td className="px-3 py-2.5 text-gray-600">{row.cutoffScore || "—"}</td>
                          <td className="px-3 py-2.5 text-gray-600">{row.cutoffRank || "—"}</td>
                          <td className="px-3 py-2.5 text-gray-600">{row.academicYear}</td>
                          <td className="pr-6 px-3 py-2.5 text-gray-600">{row.roundNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Commit Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCommit}
                disabled={validRows.length === 0}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Import {validRows.length} Valid Row{validRows.length !== 1 ? "s" : ""} to Database
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Upload Different File
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {committed && (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">
                {validRows.length} rows imported successfully
              </p>
              <p className="text-sm text-gray-500 mt-1">
                The data has been saved. You can verify it in the Colleges and Cutoff Data pages.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}