import { User } from 'lucide-react';

export default function Header({ onNavigate, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 border-b border-border/30 backdrop-blur-sm z-50 bg-background/80">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/main.png"
            alt="Shilpa3D Logo"
            className="w-[100px] h-auto object-contain"
          />
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('history')}
            className="text-foreground hover:text-accent transition-colors"
          >
            History
          </button>

          <button
            onClick={onLogout}
            className="text-foreground hover:text-accent transition-colors"
          >
            Sign Out
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 bg-secondary/40 rounded-full px-4 py-2">
            <User size={20} className="text-accent" />
            <span className="text-foreground font-serif">Ram</span>
          </div>
        </nav>
      </div>
    </header>
  );
}