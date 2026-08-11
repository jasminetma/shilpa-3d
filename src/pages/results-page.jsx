'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { CheckCircle, XCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobResults } from '@/lib/api';

function StatusBadge({ success }) {
  if (success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-accent font-mono text-sm">
        <CheckCircle size={16} /> Succeeded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-destructive font-mono text-sm">
      <XCircle size={16} /> Not available
    </span>
  );
}

export default function ResultsPage({ isLoggedIn, onLogout }) {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [manifest, setManifest] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    if (!jobId) {
      setLoadError('No job ID found.');
      return;
    }

    let cancelled = false;
    setLoadError(null);

    async function load() {
      try {
        const data = await getJobResults(jobId);
        if (!cancelled) setManifest(data);
      } catch (err) {
        if (!cancelled) setLoadError('Results are not ready yet for this job.');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [jobId, retryKey]);

  const handleExportReport = () => {
    if (!manifest) return;

    const reportData = {
      exportDate: new Date().toISOString(),
      project: 'Shilpa3D Reconstruction',
      jobId,
      manifest,
    };

    const reportJson = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shilpa3d-report-${jobId}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const hasAnyOutput = manifest?.nerf_success || manifest?.gaussian_success;

  return (
    <div className="min-h-screen bg-background">
      <Header navigate={navigate} onLogout={onLogout} />

      <main className="sm:h-[calc(100vh-9rem)] pt-22 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6 sm:my-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate('/home')}
            className="flex items-center text-sm font-mono gap-2 text-secondary-foreground hover:text-accent transition-colors"
          >
            <ChevronLeft size={20} />
            Go Back
          </motion.button>
        </div>

        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-accent/10 border border-accent/30 text-accent font-mono px-4 py-3 rounded-lg flex items-center gap-2 z-50 text-sm"
          >
            <CheckCircle size={18} className="shrink-0" />
            Report exported successfully!
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 sm:space-y-16">
          {loadError ? (
            <div className="text-center space-y-3">
              <Loader2 className="animate-spin mx-auto text-muted-foreground" size={24} />
              <p className="font-mono text-muted-foreground">{loadError}</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="underline text-sm font-mono text-muted-foreground hover:text-accent"
              >
                Try again
              </button>
            </div>
          ) : !manifest ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl sm:text-3xl font-serif text-foreground">
                  {manifest.statue || 'Reconstruction'}
                </h1>
                <p className="text-sm font-mono text-muted-foreground">
                  {manifest.image_count ?? '--'} images processed
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-32">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-mono text-foreground">NeRF Output</h2>
                    <StatusBadge success={manifest.nerf_success} />
                  </div>

                  <div className="w-full aspect-[4/3] bg-secondary/40 border border-border/30 rounded-xl flex items-center justify-center px-6 text-center">
                    {manifest.nerf_success ? (
                      <p className="text-sm font-mono text-muted-foreground">
                        NeRF training finished. A stitched preview video isn't available yet —
                        the pipeline currently produces individual rendered frames rather than a video file.
                      </p>
                    ) : (
                      <p className="text-sm font-mono text-muted-foreground">
                        NeRF wasn't run or didn't complete for this job.
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between lg:flex-row-reverse">
                    <h2 className="text-xl sm:text-2xl font-mono text-foreground">Gaussian Output</h2>
                    <StatusBadge success={manifest.gaussian_success} />
                  </div>

                  <div className="w-full aspect-[4/3] bg-secondary/40 border border-border/30 rounded-xl flex items-center justify-center px-6 text-center">
                    {manifest.gaussian_success ? (
                      <p className="text-sm font-mono text-muted-foreground">
                        Gaussian Splatting model is ready — open it in the 3D Viewer.
                      </p>
                    ) : (
                      <p className="text-sm font-mono text-muted-foreground">
                        Gaussian Splatting wasn't run or didn't complete for this job.
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {manifest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 sm:mt-12"
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto font-serif !border-foreground text-foreground hover:bg-secondary px-8 py-6 rounded-full"
                onClick={handleExportReport}
              >
                Export Report
              </Button>

              <Button
                onClick={() => navigate(`/3d-viewer/${jobId}`)}
                className="w-full sm:w-auto bg-accent border border-border-cream text-accent-foreground hover:bg-accent/90 px-8 py-6 font-serif rounded-full"
                disabled={!hasAnyOutput}
              >
                Open 3D Viewer
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}