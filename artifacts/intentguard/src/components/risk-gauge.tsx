import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  // Score is 0-100
  const normalizedScore = Math.max(0, Math.min(100, score));
  const rotation = (normalizedScore / 100) * 180 - 90; // -90 to 90
  
  let color = "text-green-500";
  let bgFill = "bg-green-500";
  let label = "Low Risk";
  
  if (normalizedScore >= 40 && normalizedScore < 75) {
    color = "text-yellow-500";
    bgFill = "bg-yellow-500";
    label = "Medium Risk";
  } else if (normalizedScore >= 75) {
    color = "text-destructive";
    bgFill = "bg-destructive";
    label = "High Risk";
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background Arc */}
        <div className="absolute top-0 left-0 w-full h-48 rounded-full border-[12px] border-muted" />
        
        {/* Foreground Arc Wrapper */}
        <div className="absolute top-0 left-0 w-full h-48">
          <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray="276.46" // 2 * PI * 44
              strokeDashoffset="138.23" // Half of circumference (hide half)
              className="text-muted"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray="276.46"
              initial={{ strokeDashoffset: 276.46 }}
              animate={{ strokeDashoffset: 276.46 - (138.23 * (normalizedScore / 100)) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className={color}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-1 h-16 origin-bottom rounded-t-full bg-foreground z-10"
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          style={{ x: "-50%" }}
        >
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 rounded-full bg-foreground" />
        </motion.div>
      </div>

      <div className="mt-4 text-center">
        <motion.div 
          className="text-4xl font-bold font-mono tracking-tighter"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {normalizedScore}
        </motion.div>
        <motion.div 
          className={`text-sm font-medium mt-1 uppercase tracking-widest ${color}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {label}
        </motion.div>
      </div>
    </div>
  );
}
