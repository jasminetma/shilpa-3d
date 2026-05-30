'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/shared/header';

// Array of processing stages that will be displayed
const stages = [
  {
    name: '24 images loaded......',
    detail: 'COLMAP',
  },
  {
    name: '3,412 sparse point',
    detail: 'NeRF iter 55241 | loss : 0.0043',
  },
  {
    name: 'Gaussian Splatting queued',
    detail: '',
  },
];

// ProcessingPage component - Shows progress while 3D model is being processed
export default function ProcessingPage({
  onNavigate,
  isLoggedIn,
  onLogout,
}) {
  // Track which processing stage we're currently on
  const [currentStage, setCurrentStage] = useState(0);

  // Track overall progress percentage
  const [progress, setProgress] = useState(0);

  // Effect hook to advance through processing stages
  useEffect(() => {
    // Update the current stage every 3 seconds
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) =>
        prev < stages.length - 1 ? prev + 1 : prev
      );
    }, 3000);

    // Cleanup interval when component unmounts
    return () => clearInterval(stageInterval);
  }, []);

  // Effect hook to simulate progress bar advancement
  useEffect(() => {
    // Update progress every 500ms to simulate processing
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Continue incrementing progress until we reach 100%
        if (prev >= 100) return 100;

        // Add random increment between 5-15% for natural progression
        return Math.min(prev + 5 + Math.random() * 10, 100);
      });
    }, 500);

    // Cleanup interval when component unmounts
    return () => clearInterval(progressInterval);
  }, []);

  // Effect hook to auto-navigate to results when processing completes
  useEffect(() => {
    // If progress reaches 100%, wait 2 seconds then navigate
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onNavigate('results');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [progress, onNavigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 space-y-12 flex flex-col items-center justify-center min-h-[60vh]">
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <path
                d="M32 8 L45 20 L45 50 Q45 55 40 55 L24 55 Q19 55 19 50 L19 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              />

              <circle
                cx="32"
                cy="22"
                r="2.5"
                fill="currentColor"
                className="text-accent"
              />

              <path
                d="M32 24 L32 32 M28 27 L36 27 M32 32 L28 38 M32 32 L36 38"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              />

              <path
                d="M24 50 L22 55 L26 52 L32 54 L38 52 L42 55 L40 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              />
            </svg>

            <div>
              <h1 className="text-4xl font-serif text-foreground mb-2">
                <span className="text-accent">shilpa</span>3D
              </h1>

              <p className="text-lg text-muted-foreground uppercase tracking-widest">
                Bringing Sculptures to Life
              </p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-lg space-y-4"
          >
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                animate={{
                  width: `${Math.min(progress, 100)}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {Math.round(Math.min(progress, 100))}%
            </p>
          </motion.div>

          {/* Status Messages */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-secondary/40 border border-border/30 rounded-2xl p-8 max-w-lg"
          >
            <div className="space-y-4 font-mono text-sm">
              {stages.map((stage, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentStage >= idx ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                  className={
                    currentStage >= idx
                      ? 'text-accent'
                      : 'text-muted-foreground'
                  }
                >
                  <div>{stage.name}</div>

                  {stage.detail && (
                    <div className="text-xs mt-1">
                      {stage.detail}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Completion message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress >= 100 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            {progress >= 100 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="space-y-2"
              >
                <p className="text-lg font-serif text-accent">
                  Processing Complete!
                </p>

                <p className="text-sm text-muted-foreground">
                  Redirecting to results...
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}