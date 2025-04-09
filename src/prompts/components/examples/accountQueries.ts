export const getAccountExamples = (accountNames: string[] = []) => {
  // Choose example account
  const exampleAccount = accountNames.length > 0 ? accountNames[0] : "Marie";
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  return `
USER_PROMPT: When is the last time I sent ${exampleAccount} money last year?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "account",
          "operator": "contains",
          "value": "${exampleAccount}",
          "mode": "and"
        },
        {
          "field": "transactionType",
          "operator": "==",
          "value": "Send Money",
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
  "message": "I have applied 4 filters to show you the last time you sent money to ${exampleAccount} in ${lastYear}."
}
\`\`\`

USER_PROMPT: Show me ${exampleAccount}?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "account",
          "operator": "contains",
          "value": "${exampleAccount}",
          "mode": "or"
        },
        {
          "field": "category",
          "operator": "contains",
          "value": "${exampleAccount}",
          "mode": "or"
        },
        {
          "field": "subcategory",
          "operator": "contains",
          "value": "${exampleAccount}",
          "mode": "or"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you transactions related to ${exampleAccount}."
}
\`\`\`
`;
};
