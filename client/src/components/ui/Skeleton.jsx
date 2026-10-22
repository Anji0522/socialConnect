import { cn } from "@/lib/cn";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-surface space-y-3 p-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ))}
    </div>
  );
}
