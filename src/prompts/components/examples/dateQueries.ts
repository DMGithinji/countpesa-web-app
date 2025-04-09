import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  subWeeks,
  startOfYear,
  endOfYear,
} from "date-fns";

export const getDateExamples = (currentDate: Date) => {
  // Format date as YYYY-MM-DD
  const formatDateStr = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Calculate yesterday's date
  const yesterday = subDays(currentDate, 1);
  const yesterdayStr = formatDateStr(yesterday);

  // Calculate last week's date range
  const lastWeekStart = subWeeks(currentDate, 1);
  const lastWeekStartStr = formatDateStr(lastWeekStart);
  const lastWeekEnd = subDays(currentDate, 1);
  const lastWeekEndStr = formatDateStr(lastWeekEnd);

  // Calculate last month's date range
  const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
  const lastMonthStartStr = formatDateStr(lastMonthStart);
  const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));
  const lastMonthEndStr = formatDateStr(lastMonthEnd);

  const thisYearStart = formatDateStr(startOfYear(currentDate));
  const thisYearEnd = formatDateStr(endOfYear(currentDate));

  return `
USER_PROMPT: How much did I receive yesterday?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "date",
          "operator": ">=",
          "mode": "and",
          "value": "${yesterdayStr}"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${yesterdayStr}"
        },
        {
          "field": "mode",
          "operator": "==",
          "value": "moneyIn",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total money received on ${format(yesterday, "MMMM d, yyyy")}."
}
\`\`\`

USER_PROMPT: How much did I receive last month?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "date",
          "operator": ">=",
          "mode": "and",
          "value": "${lastMonthStartStr}"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${lastMonthEndStr}"
        },
        {
          "field": "mode",
          "operator": "==",
          "value": "moneyIn",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total money received in ${format(lastMonthStart, "MMMM yyyy")}."
}
\`\`\`

USER_PROMPT: How much did I spend last week?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "date",
          "operator": ">=",
          "mode": "and",
          "value": "${lastWeekStartStr}"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${lastWeekEndStr}"
        },
        {
          "field": "mode",
          "operator": "==",
          "value": "moneyOut",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total money spent from ${format(lastWeekStart, "MMMM d")} to ${format(lastWeekEnd, "MMMM d, yyyy")}."
}
\`\`\`

USER_PROMPT: How am I doing financially this year?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "date",
          "operator": ">=",
          "mode": "and",
          "value": "${thisYearStart}"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${thisYearEnd}"
        },
        {
          "field": "mode",
          "operator": "==",
          "value": "moneyOut",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total money spent from ${format(lastWeekStart, "MMMM d")} to ${format(lastWeekEnd, "MMMM d, yyyy")}."
}
\`\`\`
`;
};
