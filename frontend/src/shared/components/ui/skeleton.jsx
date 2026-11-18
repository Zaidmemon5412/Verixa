import { cn } from "./utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/75", className)}
      {...props}
    />
  );
}

export { Skeleton };
