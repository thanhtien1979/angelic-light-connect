import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/60",
        shimmer && "animate-pulse motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

interface SkeletonLineProps extends SkeletonProps {
  width?: "full" | "3/4" | "1/2" | "1/3" | "1/4";
  size?: "xs" | "sm" | "md" | "lg";
}

function SkeletonLine({ 
  width = "full", 
  size = "md", 
  className, 
  ...props 
}: SkeletonLineProps) {
  const widthClasses = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/3": "w-1/3",
    "1/4": "w-1/4",
  };

  const sizeClasses = {
    xs: "h-2",
    sm: "h-3",
    md: "h-4",
    lg: "h-5",
  };

  return (
    <Skeleton
      className={cn(widthClasses[width], sizeClasses[size], "rounded", className)}
      {...props}
    />
  );
}

interface SkeletonAvatarProps extends SkeletonProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

function SkeletonAvatar({ size = "md", className, ...props }: SkeletonAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], "rounded-full shrink-0", className)}
      {...props}
    />
  );
}

interface SkeletonCardProps extends SkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

function SkeletonCard({ 
  lines = 3, 
  showAvatar = false, 
  showImage = false,
  className, 
  ...props 
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card/50 border border-border/30 p-4 space-y-3",
        className
      )}
      {...props}
    >
      {showImage && (
        <Skeleton className="w-full h-32 rounded-lg mb-3" />
      )}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="1/2" size="sm" />
            <SkeletonLine width="1/3" size="xs" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? "3/4" : "full"}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonListProps extends SkeletonProps {
  count?: number;
  showAvatar?: boolean;
  compact?: boolean;
}

function SkeletonList({ 
  count = 3, 
  showAvatar = true, 
  compact = false,
  className, 
  ...props 
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 rounded-xl bg-muted/20 border border-border/20",
            compact ? "p-2" : "p-4"
          )}
        >
          {showAvatar && <SkeletonAvatar size={compact ? "sm" : "md"} />}
          <div className="flex-1 space-y-2">
            <SkeletonLine width="1/2" size={compact ? "xs" : "sm"} />
            <SkeletonLine width="1/3" size="xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonGridProps extends SkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  showImage?: boolean;
}

function SkeletonGrid({ 
  count = 6, 
  columns = 3, 
  showImage = true,
  className, 
  ...props 
}: SkeletonGridProps) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage={showImage} lines={2} />
      ))}
    </div>
  );
}

// Specific skeleton for user/profile items
function SkeletonUserItem({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/20",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="space-y-2">
          <SkeletonLine width="full" size="sm" className="w-24" />
          <SkeletonLine width="full" size="xs" className="w-16" />
        </div>
      </div>
      <Skeleton className="w-20 h-8 rounded-md" />
    </div>
  );
}

// Skeleton for notification items
function SkeletonNotification({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("flex items-start gap-3 p-3 rounded-lg", className)}
      {...props}
    >
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="3/4" size="sm" />
        <SkeletonLine width="1/2" size="xs" />
      </div>
    </div>
  );
}

// Skeleton for stat cards
function SkeletonStatCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card/50 border border-border/30 p-4 space-y-3",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <SkeletonLine width="1/3" size="sm" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-16 h-8 rounded" />
      <SkeletonLine width="1/2" size="xs" />
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonLine, 
  SkeletonAvatar, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonGrid,
  SkeletonUserItem,
  SkeletonNotification,
  SkeletonStatCard
};
