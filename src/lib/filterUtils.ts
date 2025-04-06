import { format, isSameDay } from 'date-fns';
import { Filter, FilterMode, FilterOperator } from '@/types/Filters';
import { MoneyMode, Transaction } from '@/types/Transaction';
import { deconstructTrCategory } from './categoryUtils';


/**
 * Filter transactions based on provided filters
 */
export function filterTransactions(
  transactions: Transaction[],
  filtersInput: Filter | Filter[]
): Transaction[] {
  // Normalize input to array
  const filters = Array.isArray(filtersInput) ? filtersInput : [filtersInput];

  if (!filters.length) {
    return transactions;
  }

  // Group filters by mode
  const andFilters = filters.filter(f => f.mode === FilterMode.AND || f.mode === undefined);
  const orFilters = filters.filter(f => f.mode === FilterMode.OR);

  return transactions.filter(transaction => {
    // Short-circuit evaluation for AND filters (all must match)
    if (andFilters.length > 0) {
      for (const filter of andFilters) {
        if (!evaluateFilter(transaction, filter)) {
          return false;
        }
      }
    }

    // If we only have AND filters or no filters at all, return result
    if (orFilters.length === 0) {
      return true;
    }

    // Short-circuit evaluation for OR filters (at least one must match)
    for (const filter of orFilters) {
      if (evaluateFilter(transaction, filter)) {
        return true;
      }
    }

    // No OR filters matched
    return false;
  });
}

/**
 * Evaluate a single filter against a transaction
 */
function evaluateFilter(transaction: Transaction, filter: Filter): boolean {
  const { field, operator, value } = filter;

  // Handle special field types
  if (field === 'hour') {
    return evaluateTimeFilter(transaction.date, value as string, operator);
  }

  if (field === 'mode') {
    return evaluateModeFilter(transaction.amount, value as MoneyMode, operator);
  }

  if (field === 'dayOfWeek') {
    return evaluateDayOfWeekFilter(transaction.date, value as string, operator);
  }

  if (field === 'date' && operator === '==' && typeof value === 'number') {
    return evaluateDateFilter(transaction.date, value);
  }

  // Handle category and subcategory as special cases
  if (field === 'category' || field === 'subcategory') {
    // For exact matches and non-text operators, use the extracted part
    if (operator !== 'contains' && operator !== 'contains-any') {
      const { category, subcategory } = deconstructTrCategory(transaction.category);
      const fieldValue = field === 'category' ? category : subcategory;
      return evaluateBasicFilter(fieldValue, value, operator);
    }
    // For 'contains' operators on category, we'll check if the full category string contains the value
    // This allows matching on partial category strings like "Foo: Bar" with "Foo" or "Bar"
    else if (field === 'category') {
      return evaluateBasicFilter(transaction.category, value, operator);
    }
    // For 'contains' on subcategory, we'll extract just the subcategory part
    else {
      const { subcategory } = deconstructTrCategory(transaction.category);
      return evaluateBasicFilter(subcategory, value, operator);
    }
  }

  // Special handling for amount (use absolute value)
  if (field === 'amount' && typeof value === 'number') {
    const fieldValue = Math.abs(transaction[field] as number);
    const absValue = Math.abs(value);
    return evaluateBasicFilter(fieldValue, absValue, operator);
  }

  // Standard field evaluation
  const fieldValue = transaction[field as keyof Transaction];
  return evaluateBasicFilter(fieldValue, value, operator);
}

function evaluateBasicFilter(fieldValue: any, value: any, operator: FilterOperator): boolean {
  switch (operator) {
    case '==':
      return typeof fieldValue === 'string' && typeof value === 'string'
        ? fieldValue.toLowerCase().trim() === value.toLowerCase().trim()
        : fieldValue === value;

    case '!=':
      return typeof fieldValue === 'string' && typeof value === 'string'
        ? fieldValue.toLowerCase() !== value.toLowerCase()
        : fieldValue !== value;

    case '<':
      return fieldValue < value;

    case '<=':
      return fieldValue <= value;

    case '>':
      return fieldValue > value;

    case '>=':
      return fieldValue >= value;

    case 'contains':
      return typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().includes(value.toLowerCase());

    case 'contains-any':
      if (typeof value === 'string' && typeof fieldValue === 'string') {
        const terms = value.toLowerCase().split(/\s+/);
        const fieldValueLower = fieldValue.toLowerCase();
        return terms.some(term => fieldValueLower.includes(term));
      }
      return false;

    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);

    case 'not-in':
      return Array.isArray(value) && !value.includes(fieldValue);

    default:
      return false;
  }
}

function evaluateTimeFilter(
  trDateInSeconds: number,
  timeStr: string,
  operator: FilterOperator
): boolean {
  if (!['<', '<=', '>', '>=', '==', '!='].includes(operator)) {
    return false;
  }

  const trDate = new Date(trDateInSeconds * 1000);

  // Parse hours and minutes from the time string
  const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));

  // Set the comparison time on the same date as the transaction
  const currentDateStart = new Date(trDate);
  currentDateStart.setHours(0, 0, 0, 0);

  const compareTime = new Date(currentDateStart);
  compareTime.setHours(hours, minutes, 0, 0);

  // Compare based on operator
  switch (operator) {
    case '<':
      return trDate.getTime() < compareTime.getTime();
    case '<=':
      return trDate.getTime() <= compareTime.getTime();
    case '>':
      return trDate.getTime() > compareTime.getTime();
    case '>=':
      return trDate.getTime() >= compareTime.getTime();
    case '==':
      return trDate.getHours() === hours && trDate.getMinutes() === minutes;
    case '!=':
      return trDate.getHours() !== hours || trDate.getMinutes() !== minutes;
    default:
      return false;
  }
}

function evaluateModeFilter(
  trAmount: number,
  mode: MoneyMode,
  operator: FilterOperator
): boolean {
  if (operator !== '==' && operator !== '!=') {
    return false;
  }

  const isMoneyOut = trAmount < 0;
  const isTargetMode = mode === MoneyMode.MoneyOut ? isMoneyOut : !isMoneyOut;
  return operator === '==' ? isTargetMode : !isTargetMode;
}

function evaluateDayOfWeekFilter(
  trDateInSeconds: number,
  dayOfWeek: string,
  operator: FilterOperator
): boolean {
  if (operator !== '==' && operator !== '!=') {
    return false;
  }

  const trDate = new Date(trDateInSeconds * 1000);
  const actualDay = format(trDate, 'EEEE'); // Get day name (Monday, Tuesday, etc.)
  return operator === '==' ? actualDay === dayOfWeek : actualDay !== dayOfWeek;
}

function evaluateDateFilter(trDateInSeconds: number, date: number): boolean {
  return isSameDay(new Date(trDateInSeconds * 1000), new Date(date * 1000));
}