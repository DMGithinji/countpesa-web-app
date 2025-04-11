export const getInterfaces = () => `
### Transaction Interface:

\`\`\`tsx
interface Transaction {
  code: string;
  date: string; // "2023-03-22"
  amount: number;
  account: string; // The Sender or Receiver
  category: string;

  // Precalculated fields
  dayOfWeek: string; // Examples "Monday", "Saturday", "Sunday"
  hour: string; // Examples "17:00", "05:00", "04:00"
  mode: "moneyIn" | "moneyOut";
}

interface Filter {
  field: 'code' | 'date' | 'amount' | 'account' | 'category' | "subcategory" | "hour" | "dayOfWeek" | "mode";
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'contains';
  value: string | number;
  mode: 'and' | 'or';
}

interface InstructionSet {
  filters?: Filter[];
}

interface Output {
  isPromptValid: boolean;
  instructions?: InstructionSet[]; // provided when isPromptValid is true
  message?: string; // a summary of the filters applied when prompt is valid, or an error message when prompt is invalid
}
\`\`\`
`;
