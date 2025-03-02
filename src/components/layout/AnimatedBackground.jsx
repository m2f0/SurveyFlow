import React from "react";
import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  // Create an array of 100 dots
  const dots = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    initialX:
      Math.random() *
      (typeof window !== "undefined" ? window.innerWidth : 1000),
    initialY:
      Math.random() *
      (typeof window !== "undefined" ? window.innerHeight : 1000),
    targetX:
      Math.random() *
      (typeof window !== "undefined" ? window.innerWidth : 1000),
    targetY:
      Math.random() *
      (typeof window !== "undefined" ? window.innerHeight : 1000),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 flex pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute w-1.5 h-1.5 bg-primary rounded-full blur-[0.5px]"
          initial={{
            x: dot.initialX,
            y: dot.initialY,
          }}
          animate={{
            x: dot.targetX,
            y: dot.targetY,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
