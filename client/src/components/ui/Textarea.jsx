import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
