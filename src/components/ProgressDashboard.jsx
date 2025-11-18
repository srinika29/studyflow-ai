import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Clock, BarChart3, Sparkles } from 'lucide-react';
import { getProgress } from '../utils/storage';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function ProgressDashboard() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  useEffect(() => {
    // Refresh progress when component is focused
    const handleFocus = () => {
      setProgress(getProgress());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (!progress) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No progress data yet. Start studying to see your stats!</p>
        </div>
      </div>
    );
  }

  const quizzes = progress.quizzes || [];
  const tests = progress.tests || [];
  const flashcards = progress.flashcards || [];

  // Calculate statistics
  const totalQuizzes = quizzes.length;
  const totalTests = tests.length;
  const averageQuizScore = quizzes.length > 0
    ? quizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizzes.length
    : 0;
  const averageTestScore = tests.length > 0
    ? tests.reduce((sum, t) => sum + (t.percentage || 0), 0) / tests.length
    : 0;
  const streak = progress.streak || 0;

  // Prepare chart data
  const quizScoresData = quizzes.slice(-10).map((q, index) => ({
    name: `Quiz ${index + 1}`,
    score: q.percentage || 0,
  }));

  const testScoresData = tests.slice(-10).map((t, index) => ({
    name: `Test ${index + 1}`,
    score: t.percentage || 0,
  }));

  const recentActivity = [
    ...quizzes.slice(-5).map(q => ({ type: 'Quiz', date: q.date, score: q.percentage })),
    ...tests.slice(-5).map(t => ({ type: 'Test', date: t.date, score: t.percentage })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  const pieData = [
    { name: 'Quizzes', value: totalQuizzes },
    { name: 'Tests', value: totalTests },
    { name: 'Flashcards', value: flashcards.length },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899'];

  const improvementData = quizzes.length > 1
    ? quizzes.map((q, index) => ({
        attempt: index + 1,
        score: q.percentage || 0,
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
        <h1 className="text-4xl font-bold gradient-text mb-2">Progress Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and see your improvement over time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quizzes Taken</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalQuizzes}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {averageQuizScore > 0 ? averageQuizScore.toFixed(1) : '0'}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Study Streak</p>
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {streak} {streak === 1 ? 'day' : 'days'}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-pink-600 dark:text-pink-400 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tests Completed</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalTests}
              </p>
            </div>
            <Target className="w-12 h-12 text-indigo-600 dark:text-indigo-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quiz Scores Chart */}
        {quizScoresData.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Recent Quiz Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizScoresData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Activity Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Activity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvement Over Time */}
      {improvementData.length > 1 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Improvement Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={improvementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" label={{ value: 'Quiz Attempt', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Score"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Test Scores */}
      {testScoresData.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Test Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testScoresData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.type === 'Quiz'
                        ? 'bg-purple-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold">{activity.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{activity.score.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalQuizzes === 0 && totalTests === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't taken any quizzes or tests yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Start studying to see your progress here!
          </p>
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;

