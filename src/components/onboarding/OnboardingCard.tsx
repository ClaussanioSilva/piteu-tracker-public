import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface OnboardingCardProps {
  children: ReactNode
  className?: string
}

export function OnboardingCard({ children, className }: OnboardingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "w-full max-w-md mx-auto bg-card rounded-2xl p-6 shadow-lg border border-border/50",
        className
      )}
    >
      {children}
    </motion.div>
  )
}
