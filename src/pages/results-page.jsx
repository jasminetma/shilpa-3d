'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { CheckCircle } from 'lucide-react';

export default function ResultsPage({
  onNavigate,
  isLoggedIn,
  onLogout,
}) {
  // Track if export was successful
  const [exportSuccess, setExportSuccess] = useState(false);

  // Handle report export functionality
  const handleExportReport = () => {
    // Create a comprehensive report with all reconstruction metrics
    const reportData = {
      exportDate: new Date().toISOString(),
      project: 'Shilpa3D Reconstruction',

      results: {
        nerf: {
          name: 'NeRF Output',

          metrics: {
            psnr: '29.4',
            ssim: '0.91',
            processingTime: '80 MIN',
          },
        },

        gaussian: {
          name: 'Gaussian Splatting Output',

          metrics: {
            psnr: '28.1',
            ssim: '0.89',
            processingTime: '18 MIN',
          },
        },
      },
    };

    // Convert report to JSON and create downloadable file
    const reportJson = JSON.stringify(reportData, null, 2);

    const blob = new Blob([reportJson], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `shilpa3d-report-${new Date().getTime()}.json`;

    link.click();

    URL.revokeObjectURL(url);

    // Show success message
    setExportSuccess(true);

    setTimeout(() => {
      setExportSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="pt-24 pb-12">
        
        {/* Success message notification */}
        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-accent/10 border border-accent/30 text-accent px-6 py-3 rounded-lg flex items-center gap-2 z-50"
          >
            <CheckCircle size={20} />
            Report exported successfully!
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto px-8 py-14 space-y-16">
          
          {/* Title */}
          {/* <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-serif text-foreground text-center">
              Reconstruction Results
            </h1>
          </motion.div> */}

          {/* Results Grid */}
          <div className="grid lg:grid-cols-2 gap-32">
            
            {/* NeRF Output */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-mono text-foreground">
                NeRF Output
              </h2>

              <div className="w-140 h-120 bg-secondary/40 border border-border/30 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  {/* <div className="w-32 h-32 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg mx-auto" />

                  <p className="text-muted-foreground font-mono text-sm">
                    3D NeRF Reconstruction
                  </p> */}
                </div>
              </div>

              <div className="grid grid-cols-3  text-center text-sm">
                
                <div className="text-accent font-mono">
                  <p>
                    PSNR 29.4
                  </p>
                </div>

                <div className="text-accent font-mono">
                  <p>
                    SSIM 0.91
                  </p>
                </div>

                <div className="text-foreground font-mono">
                  <p>
                    Time 80 MIN
                  </p>
                </div>
              </div>
            </motion.div>


            {/* Gaussian Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-mono text-foreground text-right">
                Gaussian Output
              </h2>

              <div className="w-140 h-120 bg-secondary/40 border border-border/30 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  {/* <div className="w-32 h-32 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg mx-auto" /> */}

                  {/* <p className="text-muted-foreground font-mono text-sm">
                    3D Gaussian Splatting
                  </p> */}
                </div>
              </div>

              <div className="grid grid-cols-3  text-center text-sm">
                
                <div className="text-accent font-mono">
                  <p>
                    PSNR 28.1
                  </p>
                </div>

                <div className="text-accent font-mono">
                  <p>
                    SSIM 0.89
                  </p>
                </div>

                <div className="text-foreground font-mono">
                  <p>
                    Time 18 MIN
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            
            {/* Export Report button */}
            <Button
              variant="outline"
              className="font-mono border-border/50 text-foreground hover:bg-secondary px-8 py-6 rounded-full"
              onClick={handleExportReport}
            >
              Export Report
            </Button>

            {/* Open 3D Viewer button */}
            <Button
              onClick={() => onNavigate('3d-viewer')}
              className="bg-accent border border-border-cream text-accent-foreground hover:bg-accent/90 px-8 py-6 font-mono rounded-full"
            >
              Open 3D Viewer
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}