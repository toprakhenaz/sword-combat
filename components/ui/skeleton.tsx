import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md bg-gray-800/50 skeleton-shine", className)} {...props} />
}

export { Skeleton }
