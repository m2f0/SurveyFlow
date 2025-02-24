import { motion } from "framer-motion";

export const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden opacity-10 flex">
    {[...Array(100)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 bg-primary rounded-full blur-[0.5px]"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          transition: {
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
      />
    ))}
  </div>
);
