export const getCategoryExamples = (
  categoryNames: string[] = [],
  subcategoryNames: string[] = []
) => {
  // Choose example categories
  const exampleCategory = categoryNames.length > 0 ? categoryNames[0] : "Food";
  const exampleSubcategory = subcategoryNames.length > 0 ? subcategoryNames[0] : "Supermarket";

  const currentYear = new Date().getFullYear();

  return `
USER_PROMPT: What have my transaction costs been this year?

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "category",
          "operator": "==",
          "value": "Transaction Cost",
          "mode": "and"
        },
        {
          "field": "date",
          "operator": ">=",
          "mode": "and",
          "value": "${currentYear}-01-01"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${currentYear}-12-31"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total transaction costs for ${currentYear}."
}
\`\`\`

USER_PROMPT: Show me uncategorized transactions

Expected Output:

\`\`\`json
{
  "isPromptValid": true,
  "instructions": [
    {
      "filters": [
        {
          "field": "category",
          "operator": "==",
          "value": "Uncategorized",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 1 filter to show you all uncategorized transactions."
}
\`\`\`

USER_PROMPT: How much did I spend on ${exampleCategory.toLowerCase()} in January this year?

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
          "value": "${currentYear}-01-01"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${currentYear}-01-31"
        },
        {
          "field": "category",
          "operator": "==",
          "value": "${exampleCategory}",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total spent on ${exampleCategory} in January ${currentYear}."
}
\`\`\`

USER_PROMPT: How much did I spend buying from the ${exampleSubcategory.toLowerCase()} in January this year?

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
          "value": "${currentYear}-01-01"
        },
        {
          "field": "date",
          "operator": "<=",
          "mode": "and",
          "value": "${currentYear}-01-31"
        },
        {
          "field": "subcategory",
          "operator": "==",
          "value": "${exampleSubcategory}",
          "mode": "and"
        }
      ]
    }
  ],
  "message": "I have applied 3 filters to show you the total spent at the ${exampleSubcategory} in January ${currentYear}."
}
\`\`\`
`;
};
