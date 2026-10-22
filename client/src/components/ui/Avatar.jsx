import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Avatar({ src, name, size = "md", className }) {
  const dim =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
        ? "h-12 w-12 text-sm"
        : size === "xl"
          ? "h-24 w-24 text-xl"
          : "h-10 w-10 text-xs";
  return src ? (
    <img src={src} alt={`${name} avatar`} className={cn("rounded-full object-cover", dim, className)} />
  ) : (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100",
        dim,
        className,
      )}
    >
      {initials(name || "?")}
    </div>
  );
}
