import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ className, size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-cyan-400", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-white/60">{text}</span>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingState({ isLoading, error, children, className }: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
    <div className={cn("text-center p-8", className)}>
      <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h2.138a2 2 0 0 1 2.804 2.804V17.196a2 2 0 0 1-2.804 2.804H7.196a2 2 0 0 1-2.804-2.804V9.804a2 2 0 0 1 2.804-2.804z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-white/60 mb-4">{error}</p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        size="sm"
      >
        Try Again
      </Button>
    </div>
  );
  }

  return <>{children}</>;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center p-8", className)}>
      {icon && (
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-white/60 mb-4">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
