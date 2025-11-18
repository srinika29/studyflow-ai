import { useState } from 'react';
import { Upload, FileText, BookOpen, Brain, BarChart3, Sparkles } from 'lucide-react';
import { parsePDF } from '../utils/api';

function Home({ navigate, notes, setNotes }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (file) => { if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) { setUploadStatus('Processing PDF...'); try { const text = await parsePDF(file); setNotes(text); setUploadStatus('PDF processed successfully!'); setTimeout(() => setUploadStatus(''), 3000); } catch (error) { setUploadStatus('Error processing PDF. Please paste text instead.'); console.error(error); } } else if (file.type.startsWith('text/')) { const reader = new FileReader(); reader.onload = (e) => { setNotes(e.target.result); setUploadStatus('File loaded successfully!'); setTimeout(() => setUploadStatus(''), 3000); }; reader.readAsText(file); } else { setUploadStatus('Unsupported file type. Please upload PDF or text files.'); } };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Smart Summarization',
      description: 'AI extracts key topics and generates beautiful summaries from your notes',
      action: () => navigate('summarizer'),
      color: 'from-purple-500 to-purple-700',
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Flashcard Generator',
      description: 'Automatically create 10-15 interactive flashcards with flip animations',
      action: () => navigate('flashcards'),
      color: 'from-blue-500 to-blue-700',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Intelligent Quiz',
      description: 'Generate customizable quizzes with difficulty levels and instant feedback',
      action: () => navigate('quiz'),
      color: 'from-pink-500 to-pink-700',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Progress Tracker',
      description: 'Visualize your learning journey with charts and statistics',
      action: () => navigate('dashboard'),
      color: 'from-indigo-500 to-indigo-700',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-5xl md:text-6xl font-bold gradient-text">
            StudyFlow AI
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          Your Intelligent Study Companion
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Transform your notes into interactive learning experiences with AI-powered tools
        </p>
      </section>

      {/* Note Upload Section */}
      <section className="card max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Study Notes</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop your PDF or text file here, or click to browse
          </p>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-secondary inline-block cursor-pointer"
          >
            Choose File
          </label>
          {uploadStatus && (
            <p className={`mt-4 ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {uploadStatus}
            </p>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold mb-2">
            Or paste your notes here:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes, lecture content, or any text you want to learn from..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {notes.length} characters
          </p>
        </div>

        {notes && (
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('summarizer')}
              className="btn-primary"
            >
              Generate Summary
            </button>
            <button
              onClick={() => navigate('flashcards')}
              className="btn-primary"
            >
              Create Flashcards
            </button>
            <button
              onClick={() => navigate('quiz')}
              className="btn-primary"
            >
              Take Quiz
            </button>
            <button
              onClick={() => navigate('mocktest')}
              className="btn-primary"
            >
              Mock Test
            </button>
          </div>
        )}
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Core Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={feature.action}
            >
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

