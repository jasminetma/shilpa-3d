import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/shared/header';
import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '@/lib/api';

const MIN_IMAGES = 20;
const MAX_IMAGES = 40;

export default function HomePage({ onNavigate, isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [statueName, setStatueName] = useState('');
  const [selectedMethods, setSelectedMethods] = useState(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const addFiles = (fileList) => {
    const room = MAX_IMAGES - uploadedFiles.length;
    if (room <= 0) return;

    const newFiles = Array.from(fileList)
      .filter((file) => file.type === 'image/jpeg' || file.type === 'image/png')
      .slice(0, room);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setUploadedImages((prev) => [...prev, ...newPreviews]);
  };

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
    if (e.dataTransfer.files?.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const deleteImage = (indexToDelete) => {
    URL.revokeObjectURL(uploadedImages[indexToDelete]);
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const clearAll = () => {
    uploadedImages.forEach((url) => URL.revokeObjectURL(url));
    setUploadedImages([]);
    setUploadedFiles([]);
    const input = document.getElementById('file-input');
    if (input) input.value = '';
  };

  const toggleMethod = (method) => {
    const newMethods = new Set(selectedMethods);
    if (newMethods.has(method)) {
      newMethods.delete(method);
    } else {
      newMethods.add(method);
    }
    setSelectedMethods(newMethods);
  };

  const imageCountValid = uploadedFiles.length >= MIN_IMAGES && uploadedFiles.length <= MAX_IMAGES;
  const methodSelected = selectedMethods.size > 0;
  const nameValid = statueName.trim().length > 0;
  const canStart = imageCountValid && methodSelected && nameValid && !starting;

  const handleStart = async () => {
    if (!canStart) return;

    setStartError(null);
    setStarting(true);

    try {
      const result = await createJob(uploadedFiles, Array.from(selectedMethods), statueName.trim());

      if (!result?.jobId) {
        console.error('createJob() resolved without a jobId:', result);
        throw new Error('No job ID returned from server.');
      }

      navigate(`/processing/${result.jobId}`);
    } catch (err) {
      console.error('Failed to start processing job:', err);
      setStartError(
        err?.message
          ? `Could not start processing: ${err.message}`
          : 'Could not start processing. Please try again.'
      );
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <main className="sm:h-[calc(100vh-9rem)] pt-31 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`rounded-2xl p-24 text-center cursor-pointer transition-all border-2 border-dashed ${
              dragActive ? 'bg-border/20 border-accent' : 'bg-border/40 border-foreground'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-mono text-foreground">Upload Your Images Here</h2>
              <p className="font-mono font-normal text-muted-foreground">Drag and Drop or Select Files from Computer</p>
              <p className="text-sm font-mono text-muted-foreground">JPG/PNG {MIN_IMAGES}-{MAX_IMAGES} images</p>

              <label htmlFor="file-input">
                <Button
                  asChild
                  className="bg-accent border border-border-cream text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-medium rounded-full"
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

          {uploadedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif text-foreground">Uploaded Images</h3>
                <span className={`font-serif ${imageCountValid ? 'text-accent' : 'text-muted-foreground'}`}>
                  {uploadedImages.length}/{MAX_IMAGES}
                </span>
              </div>

              {!imageCountValid && (
                <p className="text-xs font-mono text-destructive">
                  {uploadedFiles.length < MIN_IMAGES
                    ? `Add ${MIN_IMAGES - uploadedFiles.length} more image${MIN_IMAGES - uploadedFiles.length === 1 ? '' : 's'} to start (need at least ${MIN_IMAGES}).`
                    : `Remove ${uploadedFiles.length - MAX_IMAGES} image${uploadedFiles.length - MAX_IMAGES === 1 ? '' : 's'} to start (max ${MAX_IMAGES}).`}
                </p>
              )}

              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 w-max">
                  {uploadedImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0 w-32 h-32 sm:w-36 sm:h-36 bg-secondary/40 rounded-lg overflow-hidden border border-border/30 group"
                    >
                      <img src={image} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-3 max-w-md mx-auto"
          >
            <label className="text-sm font-mono text-muted-foreground block text-center">
              Name this reconstruction
            </label>
            <Input
              value={statueName}
              onChange={(e) => setStatueName(e.target.value)}
              placeholder="e.g. Garden Buddha"
              className="font-mono text-center h-12 rounded-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif text-foreground">PROCESSING METHODS</h3>
            </div>

            <div className="font-mono grid md:grid-cols-2 gap-6">
              {[
                { id: 'nerf', name: 'NeRF' },
                { id: 'gaussian', name: 'Gaussian Splatting' },
              ].map((method) => {
                const isSelected = selectedMethods.has(method.id);
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => toggleMethod(method.id)}
                    className={`p-4 rounded-4xl border-2 transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/10 hover:bg-accent/20'
                        : 'border-border bg-background hover:border-accent/50'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <h4 className={`text-lg font-serif ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                        {method.name}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>

            {!methodSelected && (
              <p className="text-center text-sm font-mono text-destructive">
                Please select at least one processing method.
              </p>
            )}
          </motion.div>

          {startError && (
            <p className="text-center text-sm font-mono text-destructive">{startError}</p>
          )}

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary px-8 py-6 rounded-full"
              onClick={clearAll}
              disabled={uploadedImages.length === 0 || starting}
            >
              Clear
            </Button>

            <Button
              type="button"
              onClick={handleStart}
              className="bg-accent border border-border-cream text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-medium rounded-full"
              disabled={!canStart}
            >
              {starting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Starting...
                </>
              ) : (
                'Start'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}