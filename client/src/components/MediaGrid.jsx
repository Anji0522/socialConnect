import { mediaSrc } from "@/lib/api";
import { cn } from "@/lib/cn";

export function MediaGrid({ media }) {
  if (!media?.length) return null;
  const shown = media.slice(0, 5);
  const extra = media.length - 5;
  const count = shown.length;
  return (
    <div
      className={cn(
        "mt-3 grid gap-1 overflow-hidden rounded-xl",
        count === 1 && "grid-cols-1",
        count === 2 && "grid-cols-2",
        count >= 3 && "grid-cols-2",
      )}
    >
      {shown.map((m, i) => {
        const tall = count === 3 && i === 0;
        return (
          <div
            key={`${m.url}-${i}`}
            className={cn("relative bg-muted", tall && "row-span-2", count === 1 && "max-h-[420px]")}
          >
            <img
              src={mediaSrc(m.url)}
              alt=""
              className={cn(
                "h-full w-full object-cover",
                count === 1 ? "max-h-[420px]" : "min-h-[140px] max-h-[220px]",
              )}
              loading="lazy"
            />
            {extra > 0 && i === shown.length - 1 && (
              <div className="absolute inset-0 grid place-items-center bg-black/50 text-2xl font-semibold text-white">
                +{extra}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
