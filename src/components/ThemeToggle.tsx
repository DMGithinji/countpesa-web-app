import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();

  const isLight = theme === "light";

  return (
    <div
      role="none"
      title="Toggle theme"
      className="hover:bg-secondary focus:bg-secondary cursor-pointer pr-2 py-2 rounded-full flex gap-2 items-center"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
      {showLabel && <span className="block md:hidden">Toggle Theme</span>}
    </div>
  );
}
