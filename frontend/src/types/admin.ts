export type CollegeType = "Government" | "Private" | "Deemed";
export type DegreeType = "UG" | "PG" | "Diploma";
export type Stream = "PCM" | "PCB" | "COMMERCE" | "HUMANITIES" | "ANY";
export type Category = "UR/GENERAL" | "OBC" | "SC" | "ST" | "EWS" | "PwBD";
export type Exam = "CUET" | "JEE_MAIN" | "JEE_ADVANCED" | "MHT_CET" | "KCET" | "WBJEE" | "Other";

export interface College {
  id: string;
  name: string;
  type: CollegeType;
  city: string;
  state: string;
  website?: string;
  isPartner: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  degreeType: DegreeType;
  eligibleStreams: Stream[];
  createdAt: string;
}

export interface CollegeCourse {
  id: string;
  collegeId: string;
  collegeName: string;
  courseId: string;
  courseName: string;
}

export interface CutoffData {
  id: string;
  collegeCourseId: string;
  collegeName: string;
  courseName: string;
  exam: Exam;
  category: Category;
  cutoffScore?: number;
  cutoffRank?: number;
  academicYear: number;
  roundNumber: number;
}

export interface BulkUploadRow {
  collegeName: string;
  collegeType: string;
  city: string;
  state: string;
  website?: string;
  isPartner: string;
  courseName: string;
  degreeType: string;
  eligibleStreams: string;
  exam: string;
  category: string;
  cutoffScore?: string;
  cutoffRank?: string;
  academicYear: string;
  roundNumber: string;
}

export interface ParsedRow extends BulkUploadRow {
  rowIndex: number;
  errors: string[];
  isValid: boolean;
}