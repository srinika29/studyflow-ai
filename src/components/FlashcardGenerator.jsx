import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { callClaudeAPI } from '../utils/api';
import { updateProgress } from '../utils/storage';

function FlashcardGenerator({ notes }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('studyflow_flashcards');
    if (saved) {
      const data = JSON.parse(saved);
      setFlashcards(data.cards || []);
      setKnownCards(new Set(data.known || []));
    }
  }, []);

  const generateFlashcards = async () => {
    if (!notes.trim()) {
      setError('Please add notes first from the Home page');
      return;
    }

    setLoading(true);
    setError('');
    setFlipped(false);
    setCurrentIndex(0);
    setKnownCards(new Set());

    try {
      const prompt = `Based on the following study notes, generate 12-15 high-quality flashcards. Each flashcard should have:
1. A clear, concise question on the front
2. A detailed, accurate answer on the back

Format your response as a JSON array where each object has "question" and "answer" fields.

Study notes:
${notes}

Return ONLY valid JSON in this exact format:
[
  {"question": "Question 1?", "answer": "Answer 1"},
  {"question": "Question 2?", "answer": "Answer 2"}
]`;

      const result = await callClaudeAPI(prompt, 'flashcards');
      
      // Try to extract JSON from the response
      let jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const cards = JSON.parse(jsonMatch[0]);
        setFlashcards(cards);
        localStorage.setItem('studyflow_flashcards', JSON.stringify({
          cards,
          known: [],
        }));
        updateProgress('flashcard', { count: cards.length });
      } else {
        throw new Error('Could not parse flashcards from AI response');
      }
    } catch (err) {
      setError('Failed to generate flashcards. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleKnow = () => {
    const newKnown = new Set(knownCards);
    newKnown.add(currentIndex);
    setKnownCards(newKnown);
    
    const saved = localStorage.getItem('studyflow_flashcards');
    if (saved) {
      const data = JSON.parse(saved);
      data.known = Array.from(newKnown);
      localStorage.setItem('studyflow_flashcards', JSON.stringify(data));
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handleStudyAgain = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      // Start over
      setCurrentIndex(0);
      setFlipped(false);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards(new Set());
  };

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const knownCount = knownCards.size;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
        <h1 className="text-4xl font-bold gradient-text mb-2">AI Flashcard Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate interactive flashcards from your notes
        </p>
      </div>

      {!flashcards.length && !loading && (
        <div className="card text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {notes ? 'Click the button below to generate flashcards from your notes' : 'Please add notes first from the Home page'}
          </p>
          <button
            onClick={generateFlashcards}
            disabled={!notes.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate from Notes
          </button>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Generating flashcards...</p>
          </div>
        </div>
      )}

      {flashcards.length > 0 && !loading && (
        <>
          {/* Progress Bar */}
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Known: {knownCount} / {flashcards.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="card min-h-[400px]">
            <div
              className={`flip-card ${flipped ? 'flipped' : ''} w-full h-full`}
              onClick={handleFlip}
            >
              <div className="flip-card-inner w-full h-full">
                <div className="flip-card-front w-full h-full flex items-center justify-center p-8 cursor-pointer">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Question</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {currentCard?.question}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                      Click to flip
                    </p>
                  </div>
                </div>
                <div className="flip-card-back w-full h-full flex items-center justify-center p-8 cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Answer</p>
                    <p className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                      {currentCard?.answer}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                      Click to flip back
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleKnow}
              className="flex items-center gap-2 btn-primary bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5" />
              I know this
            </button>
            <button
              onClick={handleStudyAgain}
              className="flex items-center gap-2 btn-secondary"
            >
              <RotateCcw className="w-5 h-5" />
              Study again
            </button>
            <button
              onClick={reset}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FlashcardGenerator;

