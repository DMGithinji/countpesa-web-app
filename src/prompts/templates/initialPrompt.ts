import { Transaction } from "@/types/Transaction";
import { deconstructTrCategory } from "@/lib/categoryUtils";
import { getDateRangeData } from "@/lib/getDateRangeData";
import { getCalculatedData } from "@/lib/getCalculatedData";
import { PromptContext } from "../types";
import { getSystemInfo } from "../components/system";
import { getProcessingLogic } from "../components/processingLogic";
import { getInterfaces } from "../components/interfaces";
import { getDateExamples } from "../components/examples/dateQueries";
import { getCategoryExamples } from "../components/examples/categoryQueries";
import { getAccountExamples } from "../components/examples/accountQueries";
import { getDayOfWeekExamples } from "../components/examples/dayOfWeekQueries";
import { getSpecialConditions } from "../components/specialConditions";
import { getTips } from "../components/tips";
import { getCalculationSummary } from "../utils/generateSummary";

function composeInitialPrompt(context: PromptContext): string {
  const {
    currentDate,
    categoryNames = [],
    accountNames = [],
    subcategoryNames = [],
    transactionTypes = [],
    transactionDataSummary = {},
  } = context;

  // Build the prompt sections
  const systemInfo = getSystemInfo();
  const interfaces = getInterfaces();
  const processingLogic = getProcessingLogic();

  // Example sections
  const dateExamples = getDateExamples(currentDate);
  const categoryExamples = getCategoryExamples(categoryNames, subcategoryNames);
  const accountExamples = getAccountExamples(accountNames);
  const dayOfWeekExamples = getDayOfWeekExamples();

  const specialConditions = getSpecialConditions();
  const tips = getTips();

  // User context data
  const contextData = `
  - Valid sender/receiver names are ${accountNames.join(", ")}.
  - Valid categories are ${categoryNames.join(", ")}.
  - Valid subcategories are ${subcategoryNames.join(", ")}.
  - Valid transactionTypes are ${transactionTypes.join(", ")}.
  - Transaction Data Summary: ${JSON.stringify(transactionDataSummary)}
  - The date today is ${currentDate.toISOString().split("T")[0]}.
  `;

  // Compose the full prompt
  return `
${systemInfo}

### Assignment Context:

CheckPesa holds an array of a user's financial transactions in a browser, aiding in the deep analysis of financial data through various visualization tools.

${interfaces}

### Processing USER_PROMPT:

${processingLogic}

### Examples:

${dateExamples}

${categoryExamples}

${accountExamples}

${dayOfWeekExamples}

${specialConditions}

### More Tips:

${tips}

${contextData}

This is the USER_PROMPT:
`;
}

export async function createInitialPrompt(
  transactions: Transaction[],
  userQuery: string = ""
): Promise<string> {
  // Extract context from transactions
  const currentDate = new Date();

  // Extract unique categories and subcategories
  const accounts = new Set<string>();
  const categories = new Set<string>();
  const subcategories = new Set<string>();

  transactions.forEach((t) => {
    accounts.add(t.account);

    const { category, subcategory } = deconstructTrCategory(t.category);
    categories.add(category);
    if (subcategory) subcategories.add(subcategory);
  });

  const accountNames = Array.from(accounts);
  const categoryNames = Array.from(categories);
  const subcategoryNames = Array.from(subcategories);

  // Calculate transaction summary
  const dateRangeData = getDateRangeData({ transactions });
  const calculatedData = getCalculatedData(transactions);

  const transactionDataSummary = getCalculationSummary({
    dateRangeData,
    calculatedData,
    transactions,
  });

  // Compose the prompt with context
  const promptBase = composeInitialPrompt({
    currentDate,
    accountNames,
    categoryNames,
    subcategoryNames,
    transactionDataSummary,
  });

  // Return the complete prompt with the user's query
  return `${promptBase} ${userQuery}`;
}
