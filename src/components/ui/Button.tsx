// ===== src/components/ui/Button.tsx =====
import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    outline: "border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    ghost: "text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  }
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg"
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}