export const getDayOfWeekExamples = () => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  return `
USER_PROMPT: Show me weekday transactions of ${lastYear}

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "dayOfWeek",
          "operator": "!=",
          "value": "Saturday",
          "mode": "and"
        },
        {
          "field": "dayOfWeek",
          "operator": "!=",
          "value": "Sunday",
          "mode": "and"
        },
        {
          "field": "date",
          "operator": ">=",
          "mode": "and",
          "value": "${lastYear}-01-01"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${lastYear}-12-31"
        }
      ]
    }
  ],
  "message": "I have applied 4 filters to show you weekday transactions in ${lastYear}."
}
\`\`\`
`;
};
