export const getProcessingLogic = () => `
Upon receiving a "USER_PROMPT", the system will:

1. Process the prompt to extract actionable data.

2. Generate instruction sets based on the analysis requirements (i.e comming up with relevant filters).

3. Validate the prompt against the app's capabilities.

4. Produce a JSON output of type Output detailing the visualization instructions or an explanatory message if the prompt cannot be processed.

5. If AND ONLY IF, not asked for anything specific but relevant to the user's transactions history, it can give a response based on the overview present to it.
`;
