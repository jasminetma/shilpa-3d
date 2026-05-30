'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/header';
import { Trash2, Download, Eye, CheckCircle } from 'lucide-react';

const mockHistory = [
  { id: 1, date: '2024/02/06', model: 'Model NeRF' },
  { id: 2, date: '2024/02/06', model: 'Model NeRF' },
];

export default function HistoryPage({ onNavigate, isLoggedIn, onLogout, previousPage = 'home' }) {
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [historyItems, setHistoryItems] = useState(mockHistory);

  const handleDownload = (id) => {
    const item = historyItems.find((h) => h.id === id);
    if (item) {
      const data = JSON.stringify(item, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shilpa3d-${item.date.replace(/\//g, '-')}-${item.model}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setHistoryItems(historyItems.filter((item) => item.id !== id));
      setDeletingId(null);
      setSuccessMessage('Item deleted from history');
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 500);
  };

  const handleGoBack = () => {
    if (previousPage === 'results' || previousPage === '3d-viewer') {
      onNavigate('results');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} onLogout={onLogout} />

      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-accent/10 border border-accent/30 text-accent p-4 rounded-lg mb-6 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              {successMessage}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 mb-12"
          >
            <button
              onClick={handleGoBack}
              className="text-foreground hover:text-accent transition-colors flex items-center gap-2"
            >
              ← Go Back
            </button>
            <h1 className="text-4xl font-serif text-foreground">History</h1>
          </motion.div>

          <div className="space-y-4">
            {historyItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-secondary/40 border border-border/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex gap-6 flex-1">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                      <div className="text-2xl font-serif text-accent">📿</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-lg text-foreground font-serif">{item.date}</p>
                    <p className="text-sm text-muted-foreground">{item.model}</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 text-foreground hover:bg-secondary gap-2"
                    onClick={() => onNavigate('3d-viewer')}
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 text-foreground hover:bg-secondary gap-2"
                    onClick={() => handleDownload(item.id)}
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-border/50 text-foreground hover:bg-secondary gap-2 ${
                      deletingId === item.id ? 'opacity-50 cursor-wait' : ''
                    }`}
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {historyItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 py-12"
            >
              <p className="text-2xl text-muted-foreground">No reconstructions yet</p>
              <Button
                onClick={() => onNavigate('home')}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 rounded-full"
              >
                Create Your First Model
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}