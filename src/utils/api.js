export const callClaudeAPI = async (prompt, type = 'general') => {
  try {
    const response = await fetch('/.netlify/functions/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};

export const parsePDF = async (file) => {
  // For now, we'll extract text from PDF using a simple approach
  // In production, you'd use a library like pdf.js
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Simple text extraction - in production, use proper PDF parsing
      const text = e.target.result;
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

