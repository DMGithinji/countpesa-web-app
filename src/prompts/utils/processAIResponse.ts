import json5 from "json5";
import { Filter, FilterMode } from "@/types/Filters";
import { endOfDay, startOfDay } from "date-fns";
import { GenAiOutput } from "../types";

export function validateFilters(filters: Filter[] | undefined | false): boolean {
  if (!filters) {
    return false;
  }
  return (
    Array.isArray(filters) &&
    filters.length > 0 &&
    filters.every((filter) => {
      return filter.field && filter.operator && filter.value;
    })
  );
}

function getLastJSON(text: string): string | null {
  // regex to remove backticks at the back and front, and json substring (which is present sometimes)
  const regex = /```(?:json)?\n([\s\S]*?)\n```/gi;
  let match = regex.exec(text);
  let lastJSON = null;

  // Use a while loop without assignment in the condition
  while (match !== null) {
    const [, jsonContent] = match;
    lastJSON = jsonContent;

    match = regex.exec(text);
  }

  return lastJSON || text;
}

function parseInstructions(filters: false | Filter[] | undefined) {
  if (!filters) {
    return [];
  }

  // Use flatMap to transform and potentially expand the array
  return filters.flatMap((filter) => {
    // Special handling for date equality
    if (filter.field === "date" && filter.operator === "==") {
      const dateValue = new Date(filter.value);

      // Create two new filters for the start and end of the day
      const startFilter: Filter = {
        ...filter,
        operator: ">=",
        value: startOfDay(dateValue).getTime(),
        mode: FilterMode.AND,
      };

      const endFilter: Filter = {
        ...filter,
        operator: "<=",
        value: endOfDay(dateValue).getTime(),
        mode: FilterMode.AND,
      };

      // Return both filters as an array to be flattened
      return [startFilter, endFilter];
    }

    if (filter.field === "date") {
      // Handle other date operators
      if (filter.operator === "<" || filter.operator === "<=") {
        return [
          {
            ...filter,
            value: endOfDay(new Date(filter.value)).getTime(),
          },
        ];
      }

      if (filter.operator === ">" || filter.operator === ">=") {
        return [
          {
            ...filter,
            value: startOfDay(new Date(filter.value)).getTime(),
          },
        ];
      }

      // For other operators, just convert to timestamp
      return [
        {
          ...filter,
          value: new Date(filter.value).getTime(),
        },
      ];
    }

    // Non-date filters remain unchanged
    return [filter];
  });
}

export function handleResponse(response: string) {
  const cleanedResponse = getLastJSON(response) as string;
  const parsedResponse = json5.parse(cleanedResponse.trim()) as GenAiOutput;
  const isValid = parsedResponse && parsedResponse.isPromptValid;
  if (!isValid) {
    return {
      isPromptValid: false,
      message: parsedResponse?.message || "Sorry. I could not understand your request.",
    };
  }

  if (parsedResponse.instructions?.length) {
    const aiFilters =
      parsedResponse.instructions?.length === 1 && parsedResponse.instructions[0].filters;
    const isPromptValid = validateFilters(aiFilters);
    return {
      isPromptValid,
      message: parsedResponse?.message || "Sorry. I could not understand your request.",
      filters: isPromptValid ? parseInstructions(aiFilters) : [],
    };
  }

  return {
    isPromptValid: false,
    message: parsedResponse?.message || "Sorry. I could not understand your request.",
  };
}
