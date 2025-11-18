import { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles, Clock, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { callClaudeAPI } from '../utils/api';
import { updateProgress } from '../utils/storage';

function MockTest({ notes }) {
  const [testConfig, setTestConfig] = useState({
    duration: 60, // minutes
    questionCount: 10,
    questionTypes: ['mcq', 'short'],
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const gradeTest = useCallback(async () => {
    setLoading(true);
    
    try {
      let totalMarks = 0;
      let earnedMarks = 0;
      const gradedAnswers = {};

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        totalMarks += q.marks || 1;

        if (q.type === 'mcq') {
          if (answers[i] === q.correct) {
            earnedMarks += q.marks || 1;
            gradedAnswers[i] = { correct: true, score: q.marks || 1 };
          } else {
            gradedAnswers[i] = { correct: false, score: 0 };
          }
        } else if (q.type === 'short') {
          // Grade short answers using AI
          const userAnswer = answers[i] || '';
          if (userAnswer.trim()) {
            const gradingPrompt = `Grade this short answer question:

Question: ${q.question}
Expected keywords: ${q.keywords?.join(', ') || 'N/A'}
Student answer: ${userAnswer}
Maximum marks: ${q.marks || 5}

Provide a score from 0 to ${q.marks || 5} and a brief explanation. Return as JSON:
{"score": number, "explanation": "text"}`;

            try {
              const gradingResult = await callClaudeAPI(gradingPrompt, 'grading');
              const jsonMatch = gradingResult.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const grade = JSON.parse(jsonMatch[0]);
                const score = Math.min(Math.max(0, grade.score || 0), q.marks || 5);
                earnedMarks += score;
                gradedAnswers[i] = {
                  correct: score >= (q.marks || 5) * 0.7,
                  score,
                  explanation: grade.explanation,
                };
              } else {
                // Fallback: check for keywords
                const keywordCount = q.keywords?.filter(kw =>
                  userAnswer.toLowerCase().includes(kw.toLowerCase())
                ).length || 0;
                const score = Math.round(((keywordCount / (q.keywords?.length || 1)) * (q.marks || 5)));
                earnedMarks += score;
                gradedAnswers[i] = { correct: score >= (q.marks || 5) * 0.7, score };
              }
            } catch (err) {
              // Fallback grading
              const keywordCount = q.keywords?.filter(kw =>
                userAnswer.toLowerCase().includes(kw.toLowerCase())
              ).length || 0;
              const score = Math.round(((keywordCount / (q.keywords?.length || 1)) * (q.marks || 5)));
              earnedMarks += score;
              gradedAnswers[i] = { correct: score >= (q.marks || 5) * 0.7, score };
            }
          } else {
            gradedAnswers[i] = { correct: false, score: 0 };
          }
        }
      }

      const percentage = (earnedMarks / totalMarks) * 100;
      setResults({
        totalMarks,
        earnedMarks,
        percentage,
        gradedAnswers,
      });

      // Save progress
      updateProgress('test', {
        totalMarks,
        earnedMarks,
        percentage,
        duration: testConfig.duration,
        questionCount: testConfig.questionCount,
      });
    } catch (err) {
      setError('Error grading test. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [questions, answers, testConfig]);

  const handleAutoSubmit = useCallback(async () => {
    if (testSubmitted) return;
    setTestSubmitted(true);
    await gradeTest();
  }, [testSubmitted, gradeTest]);

  useEffect(() => {
    if (testStarted && timeRemaining !== null && timeRemaining > 0 && !testSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining, testSubmitted, handleAutoSubmit]);

  const generateTest = async () => {
    if (!notes.trim()) {
      setError('Please add notes first from the Home page');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mcqCount = testConfig.questionTypes.includes('mcq') 
        ? Math.ceil(testConfig.questionCount * 0.7) 
        : 0;
      const shortCount = testConfig.questionTypes.includes('short')
        ? testConfig.questionCount - mcqCount
        : 0;

      const prompt = `Generate a comprehensive mock test based on the following study notes.

Requirements:
- Total questions: ${testConfig.questionCount}
- Multiple choice questions: ${mcqCount}
- Short answer questions: ${shortCount}
- Difficulty: Mix of easy, medium, and hard questions
- Cover key topics from the notes

For multiple choice questions, format as:
{
  "type": "mcq",
  "question": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 1,
  "marks": 2
}

For short answer questions, format as:
{
  "type": "short",
  "question": "Question text?",
  "marks": 5,
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Study notes:
${notes}

Return ONLY valid JSON array with exactly ${testConfig.questionCount} questions.`;

      const result = await callClaudeAPI(prompt, 'mocktest');
      
      // Try to extract JSON from the response
      let jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const testQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(testQuestions);
        setTestStarted(true);
        setTimeRemaining(testConfig.duration * 60); // Convert to seconds
        setAnswers({});
      } else {
        throw new Error('Could not parse test questions from AI response');
      }
    } catch (err) {
      setError('Failed to generate test. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit the test?')) {
      setTestSubmitted(true);
      await gradeTest();
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestSubmitted(false);
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setTimeRemaining(null);
    setError('');
  };

  if (!testStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
          <h1 className="text-4xl font-bold gradient-text mb-2">Smart Mock Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a full test paper with timer and AI grading
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Test Configuration</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Duration</label>
              <div className="flex gap-4">
                {[30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTestConfig({ ...testConfig, duration: mins })}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      testConfig.duration === mins
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Number of Questions</label>
              <input
                type="number"
                min="5"
                max="30"
                value={testConfig.questionCount}
                onChange={(e) => setTestConfig({ ...testConfig, questionCount: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Question Types</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={testConfig.questionTypes.includes('mcq')}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...testConfig.questionTypes, 'mcq']
                        : testConfig.questionTypes.filter(t => t !== 'mcq');
                      setTestConfig({ ...testConfig, questionTypes: types });
                    }}
                    className="w-5 h-5"
                  />
                  <span>Multiple Choice Questions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={testConfig.questionTypes.includes('short')}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...testConfig.questionTypes, 'short']
                        : testConfig.questionTypes.filter(t => t !== 'short');
                      setTestConfig({ ...testConfig, questionTypes: types });
                    }}
                    className="w-5 h-5"
                  />
                  <span>Short Answer Questions</span>
                </label>
              </div>
            </div>

            <button
              onClick={generateTest}
              disabled={testConfig.questionTypes.length === 0}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !testSubmitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Generating test questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (testSubmitted && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card text-center">
          <h2 className="text-3xl font-bold mb-4">Test Results</h2>
          <div className="text-6xl font-bold gradient-text mb-2">
            {results.earnedMarks} / {results.totalMarks}
          </div>
          <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-6">
            {results.percentage.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                results.percentage >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : results.percentage >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${results.percentage}%` }}
            />
          </div>

          {/* Score Breakdown */}
          <div className="grid md:grid-cols-2 gap-4 mt-6 text-left">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">MCQ Score</p>
              <p className="text-2xl font-bold">
                {questions.filter(q => q.type === 'mcq').reduce((acc, q, i) => {
                  const idx = questions.indexOf(q);
                  return acc + (results.gradedAnswers[idx]?.score || 0);
                }, 0)} / {questions.filter(q => q.type === 'mcq').reduce((acc, q) => acc + (q.marks || 1), 0)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Short Answer Score</p>
              <p className="text-2xl font-bold">
                {questions.filter(q => q.type === 'short').reduce((acc, q, i) => {
                  const idx = questions.indexOf(q);
                  return acc + (results.gradedAnswers[idx]?.score || 0);
                }, 0)} / {questions.filter(q => q.type === 'short').reduce((acc, q) => acc + (q.marks || 5), 0)}
              </p>
            </div>
          </div>

          <button
            onClick={resetTest}
            className="btn-primary mt-6"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Take Another Test
          </button>
        </div>

        {/* Detailed Review */}
        {questions.map((q, index) => {
          const grade = results.gradedAnswers[index];
          return (
            <div
              key={index}
              className={`card ${
                grade?.correct
                  ? 'border-green-500 dark:border-green-400'
                  : 'border-red-500 dark:border-red-400'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {grade?.correct ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">
                      Question {index + 1}: {q.question}
                    </h3>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {grade?.score || 0} / {q.marks || (q.type === 'mcq' ? 2 : 5)} marks
                    </span>
                  </div>

                  {q.type === 'mcq' && (
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg ${
                            optIndex === q.correct
                              ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500'
                              : optIndex === answers[index] && !grade?.correct
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
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'short' && (
                    <div className="space-y-3">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm font-semibold mb-1">Your Answer:</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {answers[index] || 'No answer provided'}
                        </p>
                      </div>
                      {grade?.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-sm font-semibold mb-1">Feedback:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {grade.explanation}
                          </p>
                        </div>
                      )}
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

  if (loading && testSubmitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Grading your test...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Timer */}
      <div className="card bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-center gap-3">
          <Clock className="w-6 h-6" />
          <span className="text-3xl font-bold">
            {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
          </span>
        </div>
        {timeRemaining !== null && timeRemaining < 300 && (
          <p className="text-center mt-2 text-yellow-200">
            Less than 5 minutes remaining!
          </p>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, index) => (
        <div key={index} className="card">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">
              Question {index + 1} ({q.type === 'mcq' ? 'MCQ' : 'Short Answer'}) - {q.marks || (q.type === 'mcq' ? 2 : 5)} marks
            </h3>
          </div>
          <p className="text-lg mb-4">{q.question}</p>

          {q.type === 'mcq' && (
            <div className="space-y-2">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => setAnswers({ ...answers, [index]: optIndex })}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    answers[index] === optIndex
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}. {option}
                </button>
              ))}
            </div>
          )}

          {q.type === 'short' && (
            <textarea
              value={answers[index] || ''}
              onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
              placeholder="Type your answer here..."
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          )}
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={testSubmitted}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
}

export default MockTest;

