import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export function GradientText({ children, className, from, to }: GradientTextProps) {
  const style =
    from && to
      ? { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }
      : undefined;

  return (
    <span
      className={cn("gradient-text", className)}
      style={style}
    >
      {children}
    </span>
  );
}
