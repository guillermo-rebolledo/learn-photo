"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

type Theme = "light" | "dark";

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    setHydrated(true);
  }, []);

  function updateTheme(isDark: boolean) {
    const nextTheme = isDark ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("learn-photo-theme", nextTheme);
  }

  return (
    <div className="theme-control">
      <span aria-hidden="true">Light</span>
      <Switch
        aria-label="Use dark theme"
        checked={theme === "dark"}
        disabled={!hydrated}
        onCheckedChange={updateTheme}
        className="switch-root"
      />
      <span aria-hidden="true">Dark</span>
    </div>
  );
}
