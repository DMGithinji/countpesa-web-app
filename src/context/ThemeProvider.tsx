import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme}>
      {children}
    </NextThemesProvider>
  );
}