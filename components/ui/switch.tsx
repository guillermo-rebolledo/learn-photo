"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";

type SwitchProps = Omit<ComponentProps<typeof BaseSwitch.Root>, "render" | "nativeButton">;

// Editable shadcn primitive backed by Base UI and styled in the Learn Photo system.
export function Switch(props: SwitchProps) {
  return (
    <BaseSwitch.Root
      nativeButton
      render={<button type="button" />}
      {...props}
    >
      <BaseSwitch.Thumb className="switch-thumb" />
    </BaseSwitch.Root>
  );
}
