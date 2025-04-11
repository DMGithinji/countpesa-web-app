import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div
      role="none"
      title="Toggle theme"
      className="hover:bg-secondary focus:bg-secondary cursor-pointer pr-2 py-2 rounded-full flex gap-2 items-center"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
      {showLabel && <span className="block md:hidden">Toggle Theme</span>}
    </div>
  );
}
