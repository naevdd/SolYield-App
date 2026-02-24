// Type definitions for SolYield App
// Matches structures from src/data/*.js

export interface SiteLocation {
  lat: number;
  lng: number;
}

export interface Site {
  id: string;
  name: string;
  location: SiteLocation;
  capacity: string;
}

export interface ScheduleVisit {
  id: string;
  siteId: string;
  date: string;
  time: string;
  title: string;
}

export interface EnrichedVisit extends ScheduleVisit {
  siteName: string;
  capacity: string;
  location: SiteLocation;
}

export interface DayGeneration {
  date: string;
  energyGeneratedkWh: number;
}

export interface MonthChartData {
  _id: number;
  days: DayGeneration[];
}

export interface PerformanceData {
  underPerformingDays: number;
  overPerformingDays: number;
  daysNoData: number;
  normalDays: number;
  zeroEnergyDays: number;
}

export interface PerformanceSlice {
  label: string;
  value: number;
  color: string;
}

export type FormFieldType = "text" | "number" | "select" | "radio" | "checkbox" | "file";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  display?: "List" | "Row";
  uploadType?: "Capture" | "Upload";
  uploadFileType?: "Image" | "PDF";
  numberOfFiles?: number;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  id: string;
  title: string;
  sections: FormSection[];
}

export type CheckInStatus = "idle" | "loading" | "success" | "error";
