"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Ghost icon button with a real Tooltip (instead of the native `title` attribute).
export type ActionButtonProps = React.ComponentProps<typeof Button> & {
  tooltip: string;
};

export const ActionButton = ({ tooltip, children, ...props }: ActionButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" {...props}>
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);
