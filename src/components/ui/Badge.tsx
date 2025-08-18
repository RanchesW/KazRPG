// ===== src/components/ui/Badge.tsx =====
import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-700 text-slate-200",
    success: "bg-green-600 text-green-100",
    warning: "bg-yellow-600 text-yellow-100", 
    danger: "bg-red-600 text-red-100",
    info: "bg-blue-600 text-blue-100"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}