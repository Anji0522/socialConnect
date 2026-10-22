import { cn } from "@/lib/cn";

export function Button({ className, variant = "primary", size = "md", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "gradient" &&
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:opacity-95",
        variant === "secondary" && "bg-muted text-foreground hover:bg-muted/80",
        variant === "ghost" && "hover:bg-muted text-foreground",
        variant === "danger" && "bg-destructive text-destructive-foreground hover:opacity-90",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    />
  );
}
