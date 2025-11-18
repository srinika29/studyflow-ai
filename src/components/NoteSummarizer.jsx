import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { callClaudeAPI } from '../utils/api';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    // Loop through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Please try a different file.');
  }
}

function NoteSummarizer({ notes, setNotes }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!notes.trim()) {
      setError('Please enter some notes first');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const prompt = `Please analyze the following study notes and create a comprehensive, well-organized summary. Extract the key topics and concepts, and present them in a clear, structured format with main points highlighted. Make it easy to understand and visually appealing when displayed.

Notes:
${notes}

Please provide:
1. Main topics identified
2. Key concepts for each topic
3. Important points to remember
4. Any connections or relationships between concepts

Format the summary with clear headings and bullet points.`;

      const result = await callClaudeAPI(prompt, 'summarize');
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
        <h1 className="text-4xl font-bold gradient-text mb-2">AI Note Summarizer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let AI extract key topics and create a beautiful summary from your notes
        </p>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold mb-2">
          Your Study Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your study notes here..."
          className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <button
          onClick={generateSummary}
          disabled={loading || !notes.trim()}
          className="btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Summary...
            </span>
          ) : (
            'Generate AI Summary'
          )}
        </button>
      </div>

      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        </div>
      )}

      {summary && !loading && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">AI-Generated Summary</h2>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <div
              className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: summary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteSummarizer;

