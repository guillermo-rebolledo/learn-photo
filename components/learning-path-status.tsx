"use client";

import { useEffect, useState } from "react";

export function LearningPathStatus() {
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    try { setComplete(JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.capstoneComplete === true); } catch { /* Invalid Progress is ignored. */ }
  }, []);
  return complete ? <p className="completion learning-path-complete"><strong>Learning Path complete</strong> — every Lesson and the Sandbox remain unlocked.</p> : null;
}
