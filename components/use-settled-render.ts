"use client";

import { useEffect, useState } from "react";

const refinementDelay = 180;

export function useSettledRender<Value>(key: string, value: Value) {
  const [settledRender, setSettledRender] = useState(() => ({ key, value }));

  useEffect(() => {
    const timer = window.setTimeout(() => setSettledRender({ key, value }), refinementDelay);
    return () => window.clearTimeout(timer);
  }, [key, value]);

  return {
    isSettled: settledRender.key === key,
    settledValue: settledRender.value,
  };
}
