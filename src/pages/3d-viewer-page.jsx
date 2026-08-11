'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { getJobModels } from '@/lib/api';

export default function ThreeDViewerPage({ isLoggedIn, onLogout }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [models, setModels] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [viewerError, setViewerError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();
  const { jobId } = useParams();

  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // Fetch model URLs
  useEffect(() => {
    if (!jobId) {
      setLoadError('No job ID found.');
      return;
    }

    let cancelled = false;
    setLoadError(null);

    async function load() {
      try {
        const data = await getJobModels(jobId);
        if (!cancelled) setModels(data);
      } catch (err) {
        if (!cancelled) setLoadError('Could not load 3D models for this job.');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [jobId, retryKey]);

  // Mount the gaussian-splats-3d viewer once we have a real .ply URL
  useEffect(() => {
    const gaussianUrl = models?.gaussian?.url;
    if (!gaussianUrl || !containerRef.current) return;

    setViewerError(null);

    const viewer = new GaussianSplats3D.Viewer({
      rootElement: containerRef.current,
      cameraUp: [0, -1, 0],
      initialCameraPosition: [0, 0, 5],
      initialCameraLookAt: [0, 0, 0],
    });
    viewerRef.current = viewer;

    viewer
      .addSplatScene(gaussianUrl, {
        format: GaussianSplats3D.SceneFormat.Ply,
        splatAlphaRemovalThreshold: 5,
      })
      .then(() => {
        viewer.start();
      })
      .catch((err) => {
        console.error('Failed to load splat scene:', err);
        setViewerError('Could not load the 3D model. The file may be missing or malformed.');
      });

    return () => {
      try {
        viewerRef.current?.dispose();
      } catch (e) {
        // dispose can throw if the viewer never fully initialized — safe to ignore
      }
      viewerRef.current = null;
    };
  }, [models]);

  const handleDownloadGaussian = () => {
    if (!models?.gaussian?.url) return;
    const link = document.createElement('a');
    link.href = models.gaussian.url;
    link.download = `shilpa3d-gaussian-model-${new Date().getTime()}.ply`;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const hasGaussian = !!models?.gaussian?.url;

  return (
    <div className="min-h-screen bg-background">
      <Header navigate={navigate} onLogout={onLogout} />

      {downloadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-28 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-sm bg-accent/10 border border-accent/30 text-accent px-4 py-3 font-mono rounded-lg flex items-center gap-2 z-50 text-sm"
        >
          <CheckCircle size={18} className="shrink-0" />
          Downloaded successfully!
        </motion.div>
      )}

      <main className="sm:h-[calc(100vh-9rem)] pt-28 sm:pt-38 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate(`/results/${jobId}`)}
            className="flex items-center text-sm font-mono gap-2 text-secondary-foreground hover:text-accent transition-colors mb-8"
          >
            <ChevronLeft size={20} />
            Go Back
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-mono text-secondary-foreground mb-12"
          >
            3D Viewer
          </motion.h1>

          {loadError ? (
            <div className="text-center space-y-3">
              <p className="font-mono text-destructive">{loadError}</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="underline text-sm font-mono text-muted-foreground hover:text-accent"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="col-span-1"
              >
                <div className="w-full h-[300px] sm:h-[480px] bg-border/40 border border-border/30 rounded-2xl overflow-hidden relative">
                  {!models && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-muted-foreground" size={28} />
                    </div>
                  )}

                  {models && !hasGaussian && (
                    <div className="w-full h-full flex items-center justify-center px-6 text-center">
                      <p className="text-sm font-mono text-muted-foreground">
                        No Gaussian Splatting model is available for this job.
                      </p>
                    </div>
                  )}

                  {viewerError && (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center bg-border/40">
                      <p className="text-sm font-mono text-destructive">{viewerError}</p>
                    </div>
                  )}

                  {/* gaussian-splats-3d mounts its own canvas into this div */}
                  <div ref={containerRef} className="w-full h-full" />

                  {hasGaussian && !viewerError && (
                    <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-secondary-foreground font-mono pointer-events-none">
                      Drag-Scroll-Pan
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="bg-background border border-2 border-dashed border-border/60 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-mono text-foreground">Model</h3>
                    <p className="text-2xl font-mono text-accent">GAUSSIAN SPLAT</p>
                  </div>

                  {!hasGaussian && models && (
                    <p className="text-sm font-mono text-muted-foreground pt-2 border-t border-border/30">
                      NeRF output currently has no interactive or video preview —
                      the pipeline produces individual frames, not a viewable file yet.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none sm:w-40 !border-foreground font-serif text-foreground hover:bg-secondary py-6 rounded-full"
                    onClick={handleDownloadGaussian}
                    disabled={!hasGaussian}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none sm:w-40 !border-foreground text-foreground font-serif hover:bg-secondary py-6 rounded-full"
                    onClick={() => navigate('/home')}
                  >
                    Home
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}