import { Filter } from "./Filters";

export interface AnalysisReport {
  id: string;
  report: string;
  createdAt: Date;
}

export enum AssessmentMode {
  SERIOUS = "SERIOUS",
  ROAST = "ROAST",
}

export interface Message {
  sender: "user" | "bot";
  text: string;
}

export interface InstructionSet {
  filters?: Filter[];
}

export interface GenAiOutput {
  isPromptValid: boolean;
  instructions?: InstructionSet[]; // provided when isPromptValid is true
  message?: string; // provided when isPromptValid is false
}
