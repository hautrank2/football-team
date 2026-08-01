import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

// Shared layout for full-page states (coming-soon / error / 404 / in-development).
export const PageState = ({ icon: Icon, title, description, action, className }: PageStateProps) => (
  <div
    className={cn(
      "flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-8 text-center",
      className
    )}
  >
    <Icon className="size-12 text-muted-foreground" />
    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
    {description ? <p className="max-w-md text-muted-foreground">{description}</p> : null}
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);
