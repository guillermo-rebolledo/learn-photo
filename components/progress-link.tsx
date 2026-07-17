"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function ProgressLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const [href, setHref] = useState("/lessons/light-and-exposure");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null");
      if (typeof saved?.lesson === "string" && /^[a-z0-9-]+$/.test(saved.lesson)) setHref(`/lessons/${saved.lesson}`);
    } catch {
      // Invalid browser-local data falls back to the first Lesson.
    }
  }, []);

  return <Link className={className} href={href}>{children}</Link>;
}
