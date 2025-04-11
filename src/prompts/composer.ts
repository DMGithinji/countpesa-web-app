import { Transaction } from "@/types/Transaction";
import { DerivedState } from "@/stores/transactions.store";
import { Filter } from "@/types/Filters";
import { createInitialPrompt } from "./templates/initialPrompt";
import { createFollowUpPrompt } from "./templates/followUpPrompt";
import { getSeriousAnalysisPromptTemplate } from "./templates/seriousAnalysisPrompt";
import { getRoastAnalysisPromptTemplate } from "./templates/roastAnalysisPrompt";
import { getCalculationSummary } from "./utils/generateSummary";
import { AssessmentMode } from "./types";

export async function getInitialPrompt(transactions: Transaction[], userQuery: string) {
  return createInitialPrompt(transactions, userQuery);
}

export const getFollowUpPrompt = (derivedData: DerivedState, originalQuery: string) => {
  const calculatedSummary = getCalculationSummary(derivedData);

  return createFollowUpPrompt(
    calculatedSummary,
    derivedData.dateRangeData.dateRange,
    originalQuery
  );
};

export const getAnalysisPrompt = (
  type: AssessmentMode,
  derivedData: DerivedState,
  filters: Filter[]
) => {
  const calculatedSummary = getCalculationSummary(derivedData);
  const { dateRange } = derivedData.dateRangeData;
  switch (type) {
    case AssessmentMode.SERIOUS:
      return getSeriousAnalysisPromptTemplate(calculatedSummary, dateRange, filters);
    case AssessmentMode.ROAST:
      return getRoastAnalysisPromptTemplate(calculatedSummary, dateRange, filters);
    default:
      throw new Error("Invalid analysis type");
  }
};
