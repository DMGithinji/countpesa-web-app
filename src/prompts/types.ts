import { Filter } from "@/types/Filters";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PromptSection {
  id: string;
  content: string;
}

export interface PromptTemplate {
  sections: PromptSection[];
  render: (context: PromptContext) => string;
}

export interface PromptContext {
  currentDate: Date;
  categoryNames?: string[];
  accountNames?: string[];
  subcategoryNames?: string[];
  transactionTypes?: string[];
  transactionDataSummary?: Record<string, any>;
  customData?: Record<string, any>;
}

export interface AnalysisReport {
  id: string;
  report: string;
  createdAt: Date;
}

export enum AssessmentMode {
  SERIOUS = "SERIOUS",
  ROAST = "ROAST",
}

export interface InstructionSet {
  filters?: Filter[];
}

export interface GenAiOutput {
  isPromptValid: boolean;
  instructions?: InstructionSet[]; // provided when isPromptValid is true
  message?: string; // provided when isPromptValid is false
}
