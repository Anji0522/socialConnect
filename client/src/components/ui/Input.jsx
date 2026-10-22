import { cn } from "@/lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
