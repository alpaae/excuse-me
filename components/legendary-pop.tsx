'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LegendaryPopProps {
  onComplete?: () => void;
}

export function LegendaryPop({ onComplete }: LegendaryPopProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Main pop animation */}
          <motion.div
            className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl border-2 border-yellow-300"
            initial={{ 
              scale: 0,
              opacity: 0,
              rotate: -10
            }}
            animate={{ 
              scale: 1,
              opacity: 1,
              rotate: 0
            }}
            exit={{ 
              scale: 0.8,
              opacity: 0,
              rotate: 10
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.3
            }}
          >
            {/* Sparkle effects */}
            <motion.div
              className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -top-2 -right-2 w-3 h-3 bg-orange-300 rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            <motion.div
              className="absolute -bottom-2 -left-3 w-2 h-2 bg-yellow-200 rounded-full"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
            <motion.div
              className="absolute -bottom-2 -right-3 w-3 h-3 bg-orange-200 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
            />

            {/* Text content */}
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <motion.div
                className="text-4xl mb-2"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎭
              </motion.div>
              <motion.h2
                className="text-2xl font-bold mb-1"
                animate={{ 
                  textShadow: [
                    "0 0 5px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.8)",
                    "0 0 5px rgba(255,255,255,0.5)"
                  ]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Legendary!
              </motion.h2>
              <motion.p
                className="text-sm opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                You got a legendary excuse!
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
