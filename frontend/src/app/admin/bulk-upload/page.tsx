"use client";

import { useState, useRef, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { ParsedRow } from "@/types/admin";
import {
  Upload, FileSpreadsheet, Download, CheckCircle2, XCircle,
  AlertTriangle, X, ChevronDown, ChevronUp, Info, Loader2,
} from "lucide-react";
import { bulkUpload as apiBulkUpload, BulkUploadResult, fetchExams } from "@/lib/adminapi";


const REQUIRED_COLUMNS = [
  "collegeName","collegeType","city","state","isPartner",
  "courseName","degreeType","eligibleStreams","exam","category","academicYear","roundNumber",
];

const VALID_COLLEGE_TYPES = ["Government", "Private", "Deemed"];
const VALID_DEGREE_TYPES = ["UG", "PG", "Diploma"];
const VALID_STREAMS = ["pcm", "pcb", "commerce", "humanities", "any"];
const VALID_CATEGORIES = ["UR", "OBC", "SC", "ST", "EWS", "PwBD"];

// Security: max file size (5MB) and max rows to prevent DoS / runaway parsing
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 5000;

const TEMPLATE_HEADERS = [
  "collegeName","collegeType","city","state","website","naacGrade","isPartner",
  "courseName","degreeType","eligibleStreams","exam","category",
  "cutoffScore","cutoffRank","academicYear","roundNumber",
];
const TEMPLATE_SAMPLE = [
  "Delhi University","Government","New Delhi","Delhi","https://du.ac.in","A++","yes",
  "B.Sc (Hons.) Mathematics","UG","PCM|PCB","CUET","UR","680","","2025","1",
];


function validateRow(row: Record<string, string>, index: number, validExams: string[]): ParsedRow {
  const errors: string[] = [];
  const get = (key: string) => String(row[key] ?? "").trim();

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

  const STREAM_ALIASES: Record<string, string> = { arts: "humanities", art: "humanities" };
  const streams = get("eligibleStreams")
    .split("|")
    .map((s) => {
      const normalized = s.trim().toLowerCase();
      return STREAM_ALIASES[normalized] ?? normalized;
    });
  const invalidStreams = streams.filter((s) => !VALID_STREAMS.includes(s));
  if (invalidStreams.length > 0)
    errors.push(`Invalid streams: ${invalidStreams.join(", ")}`);

  if (!validExams.map(e => e.toLowerCase()).includes(get("exam").toLowerCase()))
    errors.push(`exam must be one of: ${validExams.join(", ")}`);

  if (!VALID_CATEGORIES.includes(get("category")))
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);

  const year = Number(get("academicYear"));
  if (!year || year < 2000 || year > 2100) errors.push("academicYear must be a valid year");
  const round = Number(get("roundNumber"));
  if (!round || round < 1) errors.push("roundNumber must be >= 1");

  // AFTER
const score = get("cutoffScore");
const rank = get("cutoffRank");
if (!score && !rank) errors.push("At least one of cutoffScore or cutoffRank is required");
if (score && rank) errors.push("Only one of cutoffScore or cutoffRank can be provided, not both");
if (score && isNaN(Number(score))) errors.push("cutoffScore must be a number");
if (rank && isNaN(Number(rank))) errors.push("cutoffRank must be a number");

  return {
    collegeName: get("collegeName"), collegeType: get("collegeType"),
    city: get("city"), state: get("state"), website: get("website"),
    naacGrade: get("naacGrade") || undefined,
    isPartner: get("isPartner"), courseName: get("courseName"),
    degreeType: get("degreeType"), eligibleStreams: get("eligibleStreams"),
    exam: get("exam"), category: get("category"),
    cutoffScore: score || undefined, cutoffRank: rank || undefined,
    academicYear: get("academicYear"), roundNumber: get("roundNumber"),
    rowIndex: index, errors, isValid: errors.length === 0,
  };
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

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

export default function BulkUploadPage() {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const [validExams, setValidExams] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    // Security: validate file type by both extension and MIME type
    const isCSV = file.name.endsWith(".csv") && (file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.type === "");
    const isExcel = (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) &&
      (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
       file.type === "application/vnd.ms-excel" || file.type === "");

    if (!isCSV && !isExcel) {
      setImportError("Only .csv or .xlsx/.xls files are supported.");
      return;
    }

    // Security: enforce file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setImportError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
      return;
    }

    setFileName(file.name);
    setParsing(true);
    setParsedRows([]);
    setResult(null);
    setImportError(null);

    let examNames: string[] = [];
    try {
      const exams = await fetchExams();
      examNames = exams.map((e) => e.exam_name);
      setValidExams(examNames);
    } catch {
      setParsing(false);
      setImportError("Failed to load exam list. Please refresh the page and try again.");
      return;
    }

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text || text.trim() === "") {
            setImportError("The uploaded file appears to be empty.");
            setParsing(false);
            return;
          }
          const rawRows = parseCSV(text);
          if (rawRows.length === 0) {
            setImportError("No data rows found. Make sure the file has a header row and at least one data row.");
            setParsing(false);
            return;
          }
          if (rawRows.length > MAX_ROWS) {
            setImportError(`File contains too many rows (${rawRows.length}). Maximum allowed is ${MAX_ROWS}.`);
            setParsing(false);
            return;
          }
          // Security: check required columns are present
          const headers = Object.keys(rawRows[0]);
          const missingCols = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
          if (missingCols.length > 0) {
            setImportError(`Missing required columns: ${missingCols.join(", ")}. Please use the provided template.`);
            setParsing(false);
            return;
          }
          setParsedRows(rawRows.map((r, i) => validateRow(r, i + 2, examNames)));
        } catch {
          setImportError("Failed to parse the CSV file. Please check the file format and try again.");
        } finally {
          setParsing(false);
        }
      };
      reader.onerror = () => {
        setImportError("Could not read the file. Please try again.");
        setParsing(false);
      };
      reader.readAsText(file);
    } else {
      import("xlsx").then((XLSX) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: "array" });
            if (!wb.SheetNames.length) {
              setImportError("The Excel file has no sheets.");
              setParsing(false);
              return;
            }
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const json: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            if (json.length === 0) {
              setImportError("No data rows found in the first sheet.");
              setParsing(false);
              return;
            }
            if (json.length > MAX_ROWS) {
              setImportError(`File contains too many rows (${json.length}). Maximum allowed is ${MAX_ROWS}.`);
              setParsing(false);
              return;
            }
            // Security: check required columns are present
            const headers = Object.keys(json[0]);
            const missingCols = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
            if (missingCols.length > 0) {
              setImportError(`Missing required columns: ${missingCols.join(", ")}. Please use the provided template.`);
              setParsing(false);
              return;
            }
            setParsedRows(json.map((r, i) => validateRow(r, i + 2, examNames)));
          } catch {
            setImportError("Failed to parse the Excel file. Please check the file format and try again.");
          } finally {
            setParsing(false);
          }
        };
        reader.onerror = () => {
          setImportError("Could not read the file. Please try again.");
          setParsing(false);
        };
        reader.readAsArrayBuffer(file);
      }).catch(() => {
        setImportError("Could not load Excel parser. Please use a CSV file instead.");
        setParsing(false);
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

  const handleCommit = async () => {
    if (validRows.length === 0) {
      setImportError("No valid rows to import.");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportProgress(0);

    const total = validRows.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setImportProgress(Math.min(current, total - 1));
      if (current >= total - 1) clearInterval(interval);
    }, Math.min(800, (total * 600) / total));

    try {
      const res = await apiBulkUpload(validRows);
      clearInterval(interval);
      setImportProgress(total);
      setTimeout(() => {
        setResult(res);
        setParsedRows([]);
      }, 400);
    } catch (err: unknown) {
      clearInterval(interval);
      if (err instanceof Error) {
        setImportError(err.message || "Import failed. Please try again.");
      } else {
        setImportError("An unexpected error occurred during import. Please try again.");
      }
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName("");
    setResult(null);
    setImportError(null);
    setImportProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader
        title="Bulk Upload"
        subtitle="Import college cutoff data from a CSV or Excel file"
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Info Banner */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-start gap-3">
          <Info size={16} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#1D4ED8]">
            <p className="font-semibold mb-1">How it works</p>
            <p className="text-[#3B82F6]">
              Download the template, fill it in (or share with a college), then upload here.
              The parser validates every row before you commit. Use{" "}
              <code className="bg-white/60 px-1 rounded text-xs">|</code> to separate multiple streams (e.g.{" "}
              <code className="bg-white/60 px-1 rounded text-xs">PCM|PCB</code>).
              Duplicate rows are safely upserted — no data is lost.
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
              <p className="text-xs text-gray-400 mt-0.5">dk_edufin_bulk_upload_template.csv</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <Download size={15} /> Download Template
          </button>
        </div>

        {/* Column Reference */}
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
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {[
                  ["collegeName","✓","Any text"],
                  ["collegeType","✓","Government | Private | Deemed"],
                  ["city","✓","Any text"],
                  ["state","✓","Any text"],
                  ["website","","URL (optional)"],
                  ["isPartner","✓","yes / no"],
                  ["courseName","✓","Any text"],
                  ["degreeType","✓","UG | PG | Diploma"],
                  ["eligibleStreams","✓","PCM | PCB | COMMERCE | HUMANITIES | ANY (pipe-separated)"],
                  ["exam","✓","CUET | JEE_MAIN | JEE_ADVANCED | MHT_CET | KCET | WBJEE | Other"],
                  ["category","✓","UR | OBC | SC | ST | EWS | PwBD"],
                  ["cutoffScore","","Number (for CUET)"],
                  ["cutoffRank","","Number (for JEE/CETs)"],
                  ["academicYear","✓","4-digit year e.g. 2025"],
                  ["roundNumber","✓","1, 2, 3…"],
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
        {!parsedRows.length && !result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`bg-white rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              dragOver ? "border-[#2563EB] bg-[#EFF6FF]" : "border-gray-200 hover:border-[#2563EB]/50 hover:bg-gray-50"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              dragOver ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-400"
            }`}>
              {parsing ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                {parsing ? "Parsing file…" : "Drop your file here, or click to browse"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports .csv and .xlsx / .xls · Max 5MB · Max {MAX_ROWS.toLocaleString()} rows</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* File-level error (shown below upload zone or before parse results) */}
        {importError && !parsedRows.length && !result && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
            <AlertTriangle size={16} className="flex-shrink-0" /> {importError}
          </div>
        )}

        {/* Parse Results */}
        {parsedRows.length > 0 && !result && (
          <div className="space-y-4">
            {/* Summary Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <FileSpreadsheet size={18} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-800">{fileName}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                  <CheckCircle2 size={14} /> {validRows.length} valid
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    <XCircle size={14} /> {invalidRows.length} errors
                  </div>
                )}
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all" title="Reset">
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
                      <button onClick={() => toggleErrorExpand(row.rowIndex)} className="w-full flex items-center justify-between text-left">
                        <span className="text-sm font-medium text-gray-700">
                          Row {row.rowIndex}: {row.collegeName || "(no college name)"}
                          {row.courseName ? ` — ${row.courseName}` : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 font-medium">{row.errors.length} error{row.errors.length > 1 ? "s" : ""}</span>
                          {expandedErrors.has(row.rowIndex) ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </div>
                      </button>
                      {expandedErrors.has(row.rowIndex) && (
                        <ul className="mt-2 space-y-1">
                          {row.errors.map((err, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                              <XCircle size={12} className="mt-0.5 flex-shrink-0" /> {err}
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
                  <h3 className="text-sm font-semibold text-gray-800">{validRows.length} rows ready to import</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {["#","College","Type","Course","Degree","Streams","Exam","Category","Score","Rank","Year","Rnd"].map((h) => (
                          <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap first:pl-6 last:pr-6">{h}</th>
                        ))}
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
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">{row.degreeType}</span>
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

            {importError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertTriangle size={16} className="flex-shrink-0" /> {importError}
              </div>
            )}

            {/* Commit */}
            <div className="space-y-3">
              {importing && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#2563EB]" />
                      Uploading rows to database…
                    </span>
                    <span className="text-[#2563EB] font-semibold">
                      {importProgress} / {validRows.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress / validRows.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Please don't close this tab</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCommit}
                  disabled={validRows.length === 0 || importing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {importing && <Loader2 size={15} className="animate-spin" />}
                  Import {validRows.length} Valid Row{validRows.length !== 1 ? "s" : ""} to Database
                </button>
                <button
                  onClick={handleReset}
                  disabled={importing}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Upload Different File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success / Result State */}
        {result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">Import Complete</p>
                <p className="text-sm text-gray-500 mt-1">{result.processed} rows processed successfully</p>
              </div>

              {/* Result Breakdown */}
              <div className="w-full max-w-md grid grid-cols-2 gap-3 text-left mt-2">
                {[
                  { label: "Colleges created", value: result.colleges.created },
                  { label: "Colleges existing", value: result.colleges.existing },
                  { label: "Courses created", value: result.courses.created },
                  { label: "Courses existing", value: result.courses.existing },
                  { label: "Links created", value: result.links.created },
                  { label: "Links existing", value: result.links.existing },
                  { label: "Cutoffs added", value: result.cutoffs.created },
                  { label: "Cutoffs updated", value: result.cutoffs.updated },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {result.errors.length > 0 && (
                <div className="w-full max-w-md bg-red-50 border border-red-100 rounded-xl p-4 text-left">
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    {result.errors.length} rows had errors during import
                  </p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start gap-2">
                        <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                        Row {e.rowIndex}: {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={handleReset} className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors">
                Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}