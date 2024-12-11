// components/ui/animated-header.tsx
import { motion } from "framer-motion";

interface AnimatedHeaderProps {
  text: string;
  className?: string;
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ text , className }) => {
  return (
    <motion.h1 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {text}
    </motion.h1>
  );
};