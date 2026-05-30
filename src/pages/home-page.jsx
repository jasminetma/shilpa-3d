'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { X } from 'lucide-react';

const mockHistory = []; // (not used here but keeping structure clean)

export default function HomePage({ onNavigate, isLoggedIn, onLogout }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState(new Set());
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      const newImages = Array.from(files).slice(0, 40 - uploadedImages.length);
      const imageUrls = newImages.map((file) => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...imageUrls]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const newImages = Array.from(files).slice(0, 40 - uploadedImages.length);
      const imageUrls = newImages.map((file) => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...imageUrls]);
    }
  };

  const deleteImage = (indexToDelete) => {
    setUploadedImages(uploadedImages.filter((_, idx) => idx !== indexToDelete));
  };

  const toggleMethod = (method) => {
    const newMethods = new Set(selectedMethods);

    if (newMethods.has(method)) {
      newMethods.delete(method);
    } else {
      newMethods.add(method);
    }

    if (newMethods.size > 0) {
      setSelectedMethods(newMethods);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} onLogout={onLogout} />

      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-12">

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'bg-accent/20 border-accent'
                : 'bg-secondary/40 border-border/30'
            } border-2 border-dashed`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif text-foreground">
                Upload Your Images Here
              </h2>

              <p className="text-muted-foreground">
                Drag and Drop or Select Files from Computer
              </p>

              <p className="text-sm text-muted-foreground">
                JPG/PNG 20/40 images
              </p>

              <label htmlFor="file-input">
                <Button
                  asChild
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-base rounded-full cursor-pointer"
                >
                  <span>Select a File</span>
                </Button>
              </label>

              <input
                id="file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Images */}
          {uploadedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif text-foreground">
                  Uploaded Images
                </h3>

                <span className="text-accent font-serif">
                  {uploadedImages.length}/40
                </span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-w-min">

                  {uploadedImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-secondary/40 rounded-lg overflow-hidden border border-border/30 group"
                    >
                      <img
                        src={image}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        onClick={() => deleteImage(idx)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <div className="bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors">
                          <X size={20} className="text-white" />
                        </div>
                      </button>
                    </div>
                  ))}

                </div>
              </div>
            </motion.div>
          )}

          {/* Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif text-foreground">
                Processing Methods
              </h3>

              <p className="text-sm text-muted-foreground mt-2">
                Select one or both methods to compare results
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { id: 'nerf', name: 'NeRF', description: 'Neural Radiance Fields' },
                { id: 'gaussian', name: 'Gaussian Splatting', description: '3D Gaussian Splats' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectedMethods.has(method.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-border/50 bg-secondary/20 hover:border-accent/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-serif text-foreground">
                      {method.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary px-8 py-6 rounded-full"
              onClick={() => setUploadedImages([])}
              disabled={uploadedImages.length === 0}
            >
              Clear
            </Button>

            <Button
              onClick={() => onNavigate('processing')}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 rounded-full"
              disabled={uploadedImages.length === 0}
            >
              Start
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}