export interface AnalysisReport {
  id: string;
  report: string;
  createdAt: Date
}

export enum AssessmentMode {
  SERIOUS = "SERIOUS",
  ROAST = "ROAST",
};

export interface Message {
  sender: "user" | "bot";
  text: string;
}
