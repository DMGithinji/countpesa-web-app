import { format } from "date-fns";
import { Filter } from "@/types/Filters";
import { Transaction } from "@/types/Transaction";
import { DerivedState } from "@/stores/transactions.store";
import { deconstructTrCategory } from "@/lib/categoryUtils";
import { getDateRangeData, SetDateRange } from "@/lib/dateUtils";
import { getCalculatedData } from "@/lib/getCalculatedData";
import { getCalculationSummary } from "@/prompts/utils/generateSummary";
import { GenAiOutput } from "@/prompts/types";
import { Message } from "@/stores/aiMessages.store";

const API_BASE = import.meta.env.VITE_API_URL;

export type ChatContextPayload = {
  account_names: string[];
  category_names: string[];
  subcategory_names: string[];
  transaction_types: string[];
  transaction_data_summary: Record<string, unknown>;
};

export type AnalysisMode = "serious" | "roast" | "followup";

// Keep the conversation payload bounded; the server is stateless.
const MAX_HISTORY_TURNS = 12;

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = typeof body?.detail === "string" ? body.detail : "";
    } catch {
      detail = "";
    }
    throw new Error(detail || `AI request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function buildChatContext(transactions: Transaction[]): ChatContextPayload {
  const accounts = new Set<string>();
  const categories = new Set<string>();
  const subcategories = new Set<string>();
  const transactionTypes = new Set<string>();

  transactions.forEach((t) => {
    accounts.add(t.account);
    if (t.transactionType) transactionTypes.add(t.transactionType);

    const { category, subcategory } = deconstructTrCategory(t.category);
    categories.add(category);
    if (subcategory) subcategories.add(subcategory);
  });

  const dateRangeData = getDateRangeData({ transactions });
  const calculatedData = getCalculatedData(transactions);
  const transactionDataSummary = getCalculationSummary({
    dateRangeData,
    calculatedData,
    transactions,
  } as DerivedState);

  return {
    account_names: Array.from(accounts),
    category_names: Array.from(categories),
    subcategory_names: Array.from(subcategories),
    transaction_types: Array.from(transactionTypes),
    transaction_data_summary: transactionDataSummary,
  };
}

export async function postChatQuery({
  query,
  context,
  messages,
  sessionId,
}: {
  query: string;
  context: ChatContextPayload;
  messages: Message[];
  sessionId?: string | null;
}): Promise<{ session_id: string; output: GenAiOutput }> {
  // Skip the canned greeting (first message) and the just-appended user turn
  const chatHistory = messages
    .slice(1)
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ sender: m.sender, text: m.text }));

  return postJson("/chat/web/query", {
    query,
    context,
    chat_history: chatHistory,
    ...(sessionId ? { session_id: sessionId } : {}),
  });
}

export async function postAnalysis({
  mode,
  derivedData,
  filters,
  question,
  sessionId,
}: {
  mode: AnalysisMode;
  derivedData: DerivedState;
  filters: Filter[];
  question?: string;
  sessionId?: string | null;
}): Promise<{ session_id: string; response: string }> {
  const summary = getCalculationSummary(derivedData);
  const { dateRange } = derivedData.dateRangeData;

  return postJson("/chat/web/analysis", {
    mode,
    summary,
    date_range: formatDateRange(dateRange),
    filters: filters.map((f) => ({ field: f.field, operator: f.operator, value: f.value })),
    ...(question ? { question } : {}),
    ...(sessionId ? { session_id: sessionId } : {}),
  });
}

function formatDateRange(dateRange: SetDateRange) {
  return {
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  };
}
