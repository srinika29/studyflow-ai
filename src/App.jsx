import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import Home from './components/Home';
import NoteSummarizer from './components/NoteSummarizer';
import FlashcardGenerator from './components/FlashcardGenerator';
import QuizGenerator from './components/QuizGenerator';
import MockTest from './components/MockTest';
import ProgressDashboard from './components/ProgressDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('studyflow_darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studyflow_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('home')}
            className="text-2xl font-bold gradient-text cursor-pointer"
          >
            StudyFlow AI
          </button>
          <nav className="hidden md:flex gap-4">
            <button
              onClick={() => navigate('home')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('summarizer')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'summarizer'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Summarize
            </button>
            <button
              onClick={() => navigate('flashcards')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'flashcards'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => navigate('quiz')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'quiz'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Quiz
            </button>
            <button
              onClick={() => navigate('mocktest')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'mocktest'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Mock Test
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Dashboard
            </button>
          </nav>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <Home navigate={navigate} notes={notes} setNotes={setNotes} />
        )}
        {currentPage === 'summarizer' && (
          <NoteSummarizer notes={notes} setNotes={setNotes} />
        )}
        {currentPage === 'flashcards' && (
          <FlashcardGenerator notes={notes} />
        )}
        {currentPage === 'quiz' && (
          <QuizGenerator notes={notes} />
        )}
        {currentPage === 'mocktest' && (
          <MockTest notes={notes} />
        )}
        {currentPage === 'dashboard' && (
          <ProgressDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Powered by{' '}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              Claude AI
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            © 2024 StudyFlow AI. Built for intelligent learning.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

