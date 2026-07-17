"use client";

import { useEffect } from "react";

export function LessonPositionTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const key = "learn-photo-progress";
      const saved = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(key, JSON.stringify({ ...saved, lesson: slug }));
    } catch {
      localStorage.setItem("learn-photo-progress", JSON.stringify({ lesson: slug }));
    }
  }, [slug]);

  return null;
}
