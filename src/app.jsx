import { useState } from 'react';
import LandingPage from './pages/landing-page';
import LoginPage from './pages/login-page';
import SignUpPage from './pages/signup-page';
import HomePage from './pages/home-page';
import ProcessingPage from './pages/processing-page';
import ResultsPage from './pages/results-page';
import ThreeDViewerPage from './pages/3d-viewer-page';
import HistoryPage from './pages/history-page';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [previousPage, setPreviousPage] = useState('home');

  const navigateTo = (page) => {
    if (['landing', 'login', 'signup', 'home', 'processing', 'results', '3d-viewer', 'history'].includes(page)) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {currentPage === 'login' && <LoginPage onNavigate={navigateTo} onLogin={handleLogin} />}
      {currentPage === 'signup' && <SignUpPage onNavigate={navigateTo} onSignUp={handleLogin} />}
      {currentPage === 'home' && (
        <HomePage onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}
      {currentPage === 'processing' && (
        <ProcessingPage onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}
      {currentPage === 'results' && (
        <ResultsPage onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}
      {currentPage === '3d-viewer' && (
        <ThreeDViewerPage onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}
      {currentPage === 'history' && (
        <HistoryPage onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} previousPage={previousPage} />
      )}
    </div>
  );
}