import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface MotivationalMessageProps {
  message: string
}

export function MotivationalMessage({ message }: MotivationalMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20"
    >
      <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{message}</p>
    </motion.div>
  )
}
