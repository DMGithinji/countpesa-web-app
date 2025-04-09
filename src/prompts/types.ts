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
