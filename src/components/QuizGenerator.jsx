import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { callClaudeAPI } from '../utils/api';
import { updateProgress } from '../utils/storage';

function QuizGenerator({ notes }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Pre-populated sample questions
  const sampleQuestions = [
    {
      question: "What is the primary function of mitochondria?",
      options: ["Protein synthesis", "Energy production (ATP)", "DNA replication", "Waste removal"],
      correct: 1,
      explanation: "Mitochondria are known as the powerhouses of the cell, producing ATP through cellular respiration."
    },
    {
      question: "Which process converts light energy into chemical energy in plants?",
      options: ["Respiration", "Photosynthesis", "Transpiration", "Fermentation"],
      correct: 1,
      explanation: "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose."
    },
    {
      question: "What is the smallest unit of matter?",
      options: ["Molecule", "Atom", "Cell", "Electron"],
      correct: 1,
      explanation: "An atom is the smallest unit of matter that retains the properties of an element."
    },
    {
      question: "In which phase of mitosis do chromosomes align at the center?",
      options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
      correct: 1,
      explanation: "During metaphase, chromosomes align at the metaphase plate in the center of the cell."
    },
    {
      question: "What is the chemical formula for water?",
      options: ["H2O2", "H2O", "HO", "H3O"],
      correct: 1,
      explanation: "Water consists of two hydrogen atoms and one oxygen atom, giving it the formula H2O."
    },
    {
      question: "Which organelle is responsible for protein synthesis?",
      options: ["Mitochondria", "Ribosome", "Nucleus", "Golgi apparatus"],
      correct: 1,
      explanation: "Ribosomes are the cellular structures responsible for protein synthesis."
    },
    {
      question: "What is the pH of a neutral solution?",
      options: ["0", "7", "14", "10"],
      correct: 1,
      explanation: "A pH of 7 indicates a neutral solution, neither acidic nor basic."
    },
    {
      question: "Which gas makes up approximately 78% of Earth's atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"],
      correct: 1,
      explanation: "Nitrogen makes up about 78% of Earth's atmosphere, with oxygen at about 21%."
    },
    {
      question: "What is the speed of light in a vacuum?",
      options: ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s", "3 × 10^4 m/s"],
      correct: 0,
      explanation: "The speed of light in a vacuum is approximately 3 × 10^8 meters per second."
    },
    {
      question: "Which process involves the movement of water through a semipermeable membrane?",
      options: ["Diffusion", "Osmosis", "Active transport", "Facilitated diffusion"],
      correct: 1,
      explanation: "Osmosis is the movement of water molecules through a semipermeable membrane from an area of lower solute concentration to higher."
    }
  ];

  useEffect(() => {
    if (quizStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  const startQuiz = () => {
    if (!notes.trim()) {
      setError('Please add notes first from the Home page. Using sample questions instead.');
      setQuestions(sampleQuestions.slice(0, questionCount));
      setQuizStarted(true);
      setTimeRemaining(questionCount * 60); // 1 minute per question
      return;
    }
    generateQuiz();
  };

  const generateQuiz = async () => {
    setLoading(true);
    setError('');
    setQuizStarted(true);
    setTimeRemaining(questionCount * 60); // 1 minute per question

    try {
      const difficultyPrompt = {
        easy: 'simple and straightforward',
        medium: 'moderate difficulty',
        hard: 'challenging and complex'
      };

      const prompt = `Based on the following study notes, generate exactly ${questionCount} multiple-choice questions with ${difficultyPrompt[difficulty]} difficulty level.

For each question, provide:
1. A clear, well-formulated question
2. Four answer options (A, B, C, D)
3. The correct answer (0-indexed: 0, 1, 2, or 3)
4. A brief explanation

Format your response as a JSON array where each object has:
- "question": the question text
- "options": array of 4 options
- "correct": index of correct answer (0-3)
- "explanation": why this answer is correct

Study notes:
${notes}

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 1,
    "explanation": "Explanation text"
  }
]`;

      const result = await callClaudeAPI(prompt, 'quiz');
      
      // Try to extract JSON from the response
      let jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const quizQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(quizQuestions);
      } else {
        // Fallback to sample questions
        setQuestions(sampleQuestions.slice(0, questionCount));
        setError('Using sample questions. AI response format was invalid.');
      }
    } catch (err) {
      // Fallback to sample questions
      setQuestions(sampleQuestions.slice(0, questionCount));
      setError('Using sample questions. Failed to generate from notes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    if (!submitted) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: index,
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    
    // Save progress
    updateProgress('quiz', {
      score: correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100,
      difficulty,
    });

    // Confetti effect for high scores
    if ((correct / questions.length) * 100 >= 80) {
      createConfetti();
    }
  };

  const createConfetti = () => {
    const colors = ['#a855f7', '#3b82f6', '#ec4899'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.position = 'fixed';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '50%';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 20);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setQuizStarted(false);
    setTimeRemaining(null);
    setError('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
          <h1 className="text-4xl font-bold gradient-text mb-2">Intelligent Quiz Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Quiz Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Difficulty Level</label>
              <div className="flex gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      difficulty === level
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Number of Questions</label>
              <div className="flex gap-4">
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      questionCount === count
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="btn-primary w-full"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Generating quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card text-center">
          <h2 className="text-3xl font-bold mb-4">Quiz Results</h2>
          <div className="text-6xl font-bold gradient-text mb-2">
            {score} / {questions.length}
          </div>
          <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-6">
            {percentage.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                percentage >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : percentage >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <button
            onClick={resetQuiz}
            className="btn-primary"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Take Another Quiz
          </button>
        </div>

        {questions.map((q, index) => {
          const userAnswer = selectedAnswers[index];
          const isCorrect = userAnswer === q.correct;
          return (
            <div
              key={index}
              className={`card ${
                isCorrect
                  ? 'border-green-500 dark:border-green-400'
                  : 'border-red-500 dark:border-red-400'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-3">
                    Question {index + 1}: {q.question}
                  </h3>
                  <div className="space-y-2 mb-4">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg ${
                          optIndex === q.correct
                            ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500'
                            : optIndex === userAnswer && !isCorrect
                            ? 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {option}
                        {optIndex === q.correct && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                            ✓ Correct
                          </span>
                        )}
                        {optIndex === userAnswer && !isCorrect && (
                          <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {!isCorrect && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Explanation:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-600 dark:text-yellow-400">{error}</p>
        </div>
      )}

      {/* Timer and Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">
              Time: {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
            </span>
          </div>
          <span className="text-sm font-semibold">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">{currentQ.question}</h2>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizGenerator;

