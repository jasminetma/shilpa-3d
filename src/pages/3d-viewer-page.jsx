'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { ChevronLeft, CheckCircle } from 'lucide-react';

export default function ThreeDViewerPage({
  onNavigate,
  isLoggedIn,
  onLogout,
}) {
  const [model, setModel] = useState('nerf');
  const [pointSize, setPointSize] = useState(50);
  const [opacity, setOpacity] = useState(80);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    const modelData = {
      type: model.toUpperCase(),
      settings: {
        pointSize,
        opacity,
      },
      exportDate: new Date().toISOString(),
      format: 'JSON (Ready for 3D processing)',
    };

    const dataStr = JSON.stringify(modelData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shilpa3d-${model}-model-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} onLogout={onLogout} />

      {downloadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-accent/10 border border-accent/30 text-accent px-6 py-3 rounded-lg flex items-center gap-2 z-50"
        >
          <CheckCircle size={20} />
          Downloaded successfully!
        </motion.div>
      )}

      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => onNavigate('results')}
            className="flex items-center gap-2 text-foreground hover:text-accent transition-colors mb-8"
          >
            <ChevronLeft size={20} />
            Go Back
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-serif text-foreground mb-12"
          >
            3D Viewer
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="aspect-video bg-secondary/40 border border-border/30 rounded-2xl flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-40 h-40 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg mx-auto animate-pulse" />
                    <p className="text-muted-foreground">
                      {model === 'nerf' ? 'NeRF Model' : 'Gaussian Splatting Model'}
                    </p>
                    <p className="text-sm text-muted-foreground">Drag-Scroll-Pan</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-secondary/40 border border-border/30 rounded-2xl p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-foreground">Model</h3>
                  <p className="text-lg font-serif text-accent">{model.toUpperCase()}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-muted-foreground">Point Size</label>
                    <span className="text-sm text-accent font-medium">{pointSize}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={pointSize}
                    onChange={(e) => setPointSize(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent"
                    style={{
                      background: `linear-gradient(to right, #d4a574 0%, #d4a574 ${pointSize}%, #3a3328 ${pointSize}%, #3a3328 100%)`
                    }}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-muted-foreground">Opacity</label>
                    <span className="text-sm text-accent font-medium">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent"
                    style={{
                      background: `linear-gradient(to right, #d4a574 0%, #d4a574 ${opacity}%, #3a3328 ${opacity}%, #3a3328 100%)`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setModel(model === 'nerf' ? 'gaussian' : 'nerf')}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 rounded-full"
                >
                  {model === 'nerf' ? 'Switch to Gaussian' : 'Switch to NeRF'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border/50 text-foreground hover:bg-secondary py-6 rounded-full"
                  onClick={handleDownload}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border/50 text-foreground hover:bg-secondary py-6 rounded-full"
                  onClick={() => onNavigate('home')}
                >
                  Home
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}