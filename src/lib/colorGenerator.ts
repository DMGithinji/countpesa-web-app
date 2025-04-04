import { UNCATEGORIZED } from "@/types/Categories";
import { MoneyMode } from "@/types/Transaction";

// Convert a string to an integer using a simple hash function
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: [r, g, b] = [v, t, p]; break;
    case 1: [r, g, b] = [q, v, p]; break;
    case 2: [r, g, b] = [p, v, t]; break;
    case 3: [r, g, b] = [p, q, v]; break;
    case 4: [r, g, b] = [t, p, v]; break;
    case 5: [r, g, b] = [v, p, q]; break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Generate a bright color based on the hash
export function generateLivelyColor(name: string, mode: MoneyMode, i: number): string {
  const overrideColor = getOverride(name, mode, i);
  if (overrideColor) return overrideColor;

  const hash = hashString(name);

  // Generate a hue from 0 to 1 based on the hash
  const hue = (hash & 0xFF) / 255.0;

  // Keep saturation and value high for bright colors
  const saturation = 0.9;
  const value = 0.9;

  const [r, g, b] = hsvToRgb(hue, saturation, value);
  return `rgb(${r}, ${g}, ${b})`;
}

const getOverride = (category: string, mode: MoneyMode, i: number) => {
  const isUnassigned = category === UNCATEGORIZED;
  const dominantColor = mode === MoneyMode.MoneyIn ? '#2AB57D' : '#FD625E';
  const isDominant = i === 0;
  const overrideColor = isUnassigned ? '#CCCCCC' : isDominant ? dominantColor : '';
  return overrideColor;
}
