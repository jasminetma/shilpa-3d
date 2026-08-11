'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/shared/header';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobStatus, getJobResults } from '@/lib/api';

export default function ProcessingPage({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [stage, setStage] = useState('not_started');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);

  const pollTimer = useRef(null);
  const navigateTimer = useRef(null);
  const failCount = useRef(0);

  useEffect(() => {
    if (!jobId) {
      setError('No job ID found. Please start a new upload.');
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const data = await getJobStatus(jobId);
        if (cancelled) return;

        failCount.current = 0;
        setReconnecting(false);

        setProgress(data.progress);
        setStage(data.stage);

        if (data.status === 'failed') {
          setError('Processing failed. Please try uploading again.');
          return;
        }

        try {
          await getJobResults(jobId);
          navigateTimer.current = setTimeout(() => {
            if (!cancelled) navigate(`/results/${jobId}`);
          }, 1500);
          return;
        } catch (resultsErr) {
          // Not ready yet — expected mid-job.
        }

        pollTimer.current = setTimeout(poll, 2000);
      } catch (err) {
        if (cancelled) return;

        failCount.current += 1;

        if (failCount.current >= 15) {
          setError(
            'Lost connection to the server. Your job may still be running — refreshing this page will resume checking on it.'
          );
          return;
        }

        setReconnecting(true);
        const backoff = Math.min(2000 * failCount.current, 15000);
        pollTimer.current = setTimeout(poll, backoff);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer.current);
      clearTimeout(navigateTimer.current);
    };
  }, [jobId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="sm:h-[calc(100vh-9rem)] pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-6 space-y-12 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-2"
          >
            <img src="/assets/main.png" alt="Shilpa3D Logo" className="w-[400px] h-auto object-contain" />
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-4 text-center font-mono text-sm space-y-3"
            >
              <p>{error}</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => window.location.reload()} className="underline hover:text-destructive/80">
                  Retry now
                </button>
                <button onClick={() => navigate('/home')} className="underline hover:text-destructive/80">
                  Back to upload
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {reconnecting && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono text-muted-foreground text-center -mt-6"
                >
                  Reconnecting to server…
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-full max-w-2xl space-y-2"
              >
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-background border border-border/60 rounded-2xl p-4 w-full max-w-2xl text-center"
              >
                <p className="font-mono text-sm text-muted-foreground capitalize">
                  {stage.replace(/_/g, ' ')}
                </p>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}