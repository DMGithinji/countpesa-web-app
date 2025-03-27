import json5 from 'json5';
import { Filter } from "@/types/Filters";
import { GenAiOutput } from '@/types/AITools';

export function  handleResponse(response: string) {
  const cleanedResponse = getLastJSON(response) as string;
  console.log({ cleanedResponse });
  const parsedResponse = json5.parse(cleanedResponse.trim()) as GenAiOutput;
  const isValid = parsedResponse && parsedResponse.isPromptValid;
  if (!isValid) {
    return {
      isPromptValid: false,
      message: parsedResponse?.message || 'Sorry. I could not understand your request.',
    }
  }

  if (parsedResponse.instructions?.length) {
    const aiFilters = parsedResponse.instructions?.length === 1 && parsedResponse.instructions[0].filters;
    const isValid = validateFilters(aiFilters);
    return {
      isPromptValid: isValid,
      message: parsedResponse?.message || 'Sorry. I could not understand your request.',
      filters: isValid ? parseInstructions(aiFilters) : [],
    }
  }

  return {
    isPromptValid: false,
    message: parsedResponse?.message || 'Sorry. I could not understand your request.',
  }
}

function parseInstructions(filters: false | Filter[] | undefined) {
  if (!filters) {
    return [];
  }

  return filters.map((filter) => {
      if (filter.field === 'date') {
        (filter.value) = new Date((filter.value)).getTime();
        (filter.value) = new Date(filter.value).getTime();
      }
      return filter;
    });
}

export function validateFilters(filters: Filter[] | undefined | false): boolean {
  if (!filters) {
    return false;
  }
  return Array.isArray(filters) && filters.length > 0 && filters.every((filter) => {
    return filter.field && filter.operator && filter.value;
  });
}

function getLastJSON(text: string): string | null {
  // regex to remove backticks at the back and front, and json substring (which is present sometimes)
  const regex = /```(?:json)?\n([\s\S]*?)\n```/gi;
  let match;
  let lastJSON = null;

  while ((match = regex.exec(text)) !== null) {
    lastJSON = match[1];
  }

  return lastJSON || text;
}