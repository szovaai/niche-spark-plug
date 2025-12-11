import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Completion */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-1.5 flex-1 rounded-full" />
          <Skeleton className="h-1.5 flex-1 rounded-full" />
          <Skeleton className="h-1.5 flex-1 rounded-full" />
          <Skeleton className="h-1.5 flex-1 rounded-full" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
