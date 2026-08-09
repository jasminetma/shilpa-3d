import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '@/lib/api';

const MIN_IMAGES = 20;
const MAX_IMAGES = 40;

export default function HomePage({ onNavigate, isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  // Two parallel arrays: previews for display, files for the real upload.
  // The old version only kept object-URL strings and threw the File
  // objects away, so there was nothing to actually send to a backend.
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Both methods on by default since Results always shows both anyway —
  // previously this started empty with no validation, so Start was
  // clickable with zero methods selected.
  const [selectedMethods, setSelectedMethods] = useState(new Set(['nerf', 'gaussian']));
  const [dragActive, setDragActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const addFiles = (fileList) => {
    const room = MAX_IMAGES - uploadedFiles.length;
    if (room <= 0) return;

    const newFiles = Array.from(fileList).slice(0, room);
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
    if (e.dataTransfer.files?.length > 0) addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) addFiles(e.target.files);
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
    // Keep at least one method selected — a job with zero methods
    // isn't a valid request.
    if (newMethods.size > 0) {
      setSelectedMethods(newMethods);
    }
  };

  const imageCountValid = uploadedFiles.length >= MIN_IMAGES && uploadedFiles.length <= MAX_IMAGES;

  const handleStart = async () => {
    if (!imageCountValid || selectedMethods.size === 0 || starting) return;

    setStartError(null);
    setStarting(true);

    try {
      const { jobId } = await createJob(uploadedFiles, Array.from(selectedMethods));
      navigate(`/processing/${jobId}`);
    } catch (err) {
      setStartError('Could not start processing. Please try again.');
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} onLogout={onLogout} />

      <main className="sm:h-[calc(100vh-9rem)] pt-31 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-12">

          {/* Upload Area */}
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
              <h2 className="text-3xl md:text-4xl font-mono text-foreground">
                Upload Your Images Here
              </h2>
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

          {/* Uploaded Images */}
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
                <p className="text-xs font-mono text-muted-foreground">
                  Need at least {MIN_IMAGES} images for a usable reconstruction.
                </p>
              )}

              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-w-min">
                  {uploadedImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-secondary/40 rounded-lg overflow-hidden border border-border/30 group"
                    >
                      <img src={image} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
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

          {/* Processing Methods */}
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
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={`p-4 rounded-4xl border-2 transition-all ${
                    selectedMethods.has(method.id)
                      ? 'border-accent bg-accent/10 hover:bg-accent/20'
                      : 'border-accent bg-background hover:border-accent/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-serif text-accent">{method.name}</h4>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {startError && (
            <p className="text-center text-sm font-mono text-destructive">{startError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary px-8 py-6 rounded-full"
              onClick={clearAll}
              disabled={uploadedImages.length === 0 || starting}
            >
              Clear
            </Button>
            <Button
              onClick={handleStart}
              className="bg-accent border border-border-cream text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-medium rounded-full"
              disabled={!imageCountValid || selectedMethods.size === 0 || starting}
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