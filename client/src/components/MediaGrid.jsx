import { mediaSrc } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useRef } from "react";

export function MediaGrid({ media, onDoubleTap }) {
  const lastTapRef = useRef(0);

  if (!media?.length) return null;
  const shown = media.slice(0, 5);
  const extra = media.length - 5;
  const count = shown.length;

  function handleTouchEnd(e) {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      onDoubleTap?.();
    }
    lastTapRef.current = now;
  }

  function handleDoubleClick(e) {
    e.preventDefault();
    onDoubleTap?.();
  }

  return (
    <div
      className={cn(
        "mt-3 grid gap-1 overflow-hidden rounded-xl select-none",
        count === 1 && "grid-cols-1",
        count === 2 && "grid-cols-2",
        count >= 3 && "grid-cols-2",
      )}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
    >
      {shown.map((m, i) => {
        const tall = count === 3 && i === 0;
        const isVideo = m.type === "video" || m.url?.match(/\.(mp4|webm|mov)$/i);

        return (
          <div
            key={`${m.url}-${i}`}
            className={cn("relative bg-muted overflow-hidden", tall && "row-span-2", count === 1 && "max-h-[440px]")}
          >
            {isVideo ? (
              <video
                src={mediaSrc(m.url)}
                controls
                className={cn(
                  "h-full w-full object-cover",
                  count === 1 ? "max-h-[440px]" : "min-h-[140px] max-h-[240px]",
                )}
              />
            ) : (
              <img
                src={mediaSrc(m.url)}
                alt=""
                className={cn(
                  "h-full w-full object-cover transition duration-200 hover:scale-[1.02]",
                  count === 1 ? "max-h-[440px]" : "min-h-[140px] max-h-[240px]",
                )}
                loading="lazy"
              />
            )}
            {extra > 0 && i === shown.length - 1 && (
              <div className="absolute inset-0 grid place-items-center bg-black/60 text-2xl font-bold text-white pointer-events-none">
                +{extra}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
