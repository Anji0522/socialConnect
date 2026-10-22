import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function StoryViewer({ group, onClose }) {
  const [i, setI] = useState(0);
  const item = group.items[i];

  useEffect(() => {
    const t = setTimeout(() => {
      if (i < group.items.length - 1) setI((n) => n + 1);
      else onClose();
    }, 4000);
    return () => clearTimeout(t);
  }, [i, group.items.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black">
        <div className="absolute left-2 right-2 top-2 z-10 flex gap-1">
          {group.items.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 overflow-hidden rounded bg-white/30">
              <div className={`h-full bg-white ${idx < i ? "w-full" : idx === i ? "w-full animate-pulse" : "w-0"}`} />
            </div>
          ))}
        </div>
        <button className="absolute right-2 top-6 z-10 text-white" onClick={onClose} aria-label="Close story">
          <X />
        </button>
        <img src={item.mediaUrl} alt={`${group.user.name} story`} className="h-[70vh] w-full object-cover" />
        <p className="absolute bottom-4 left-4 text-sm text-white">{group.user.name}</p>
      </div>
    </div>
  );
}
