# StudyFlow AI

An intelligent, AI-powered study platform that transforms your notes into interactive learning experiences. Built with React, TypeScript, and Claude AI.

## Features

### 🎯 Core Features

- **Smart Note Upload & Processing**
  - Text area for pasting study notes
  - PDF/document upload support
  - AI automatically extracts key topics and concepts
  - Generates beautiful summaries with main points

- **AI Flashcard Generator**
  - Automatically creates 10-15 flashcards from your notes
  - Question on front, answer on back
  - Smooth flip animations
  - "I know this" / "Study again" buttons
  - Progress tracking

- **Intelligent Quiz Generator**
  - Difficulty selector (Easy/Medium/Hard)
  - Question count options (5/10/15)
  - Pre-populated sample questions
  - Timer for each quiz session
  - Instant feedback after submission
  - Explanations for wrong answers
  - Beautiful results page with score breakdown
  - Confetti animation for scores >80%

- **Smart Mock Test**
  - Customizable duration (30min/1hr/2hr)
  - Configurable question count
  - Multiple choice and short answer questions
  - Live countdown timer
  - Auto-submit when time expires
  - AI grades short answers
  - Detailed performance report with score breakdown

- **Progress Dashboard**
  - Charts showing tests taken, average scores, improvement over time
  - Study streak counter
  - Topics mastered vs. needs work
  - Time spent studying
  - Visual data representation with Recharts

### 🎨 Design Features

- Modern gradient theme (purple/blue/pink)
- Dark mode toggle
- Fully responsive design
- Smooth animations and transitions
- Loading skeletons during AI processing
- Professional UI/UX

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic Claude API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studyflow-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

For local development, create a `.env` file in the root directory:
```
ANTHROPIC_API_KEY=your_api_key_here
```

For Netlify deployment, add the environment variable in your Netlify dashboard:
- Go to Site settings → Environment variables
- Add `ANTHROPIC_API_KEY` with your API key

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Deployment

#### Netlify

1. Push your code to a Git repository
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable `ANTHROPIC_API_KEY` in Netlify dashboard
6. Deploy!

The Netlify function will automatically be deployed from the `netlify/functions` directory.

## Project Structure

```
studyflow-ai/
├── netlify/
│   └── functions/
│       └── claude.js          # Serverless function for Claude API
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # Entry point
│   ├── components/
│   │   ├── Home.jsx           # Landing page with note upload
│   │   ├── NoteSummarizer.jsx # AI summary generator
│   │   ├── FlashcardGenerator.jsx # Flashcard creation and study
│   │   ├── QuizGenerator.jsx  # Quiz generation and taking
│   │   ├── MockTest.jsx       # Mock test with timer
│   │   └── ProgressDashboard.jsx # Progress tracking and charts
│   ├── utils/
│   │   ├── api.js            # API utility functions
│   │   └── storage.js        # localStorage utilities
│   └── index.css             # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
├── netlify.toml
└── README.md
```

## Usage

1. **Upload Notes**: Start by pasting your study notes or uploading a PDF on the Home page
2. **Generate Summary**: Click "Generate Summary" to get an AI-powered summary of your notes
3. **Create Flashcards**: Use the Flashcard Generator to create interactive study cards
4. **Take Quizzes**: Generate and take quizzes with customizable difficulty and question count
5. **Mock Tests**: Create full-length mock tests with timers and AI grading
6. **Track Progress**: View your learning journey in the Progress Dashboard

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Claude AI** - Content generation and grading
- **Netlify Functions** - Serverless API proxy

## API Integration

All API calls go through the Netlify serverless function at `/.netlify/functions/claude` to keep your API key secure. The function proxies requests to the Anthropic Claude API.

## Data Storage

All user data (progress, flashcards, quiz results) is stored in browser localStorage for persistence without requiring a backend server.

## Features in Detail

### PDF Upload
Currently supports basic text extraction from PDFs. For production use, consider integrating a proper PDF parsing library like `pdf.js`.

### AI Grading
Short answer questions are graded using Claude AI, which analyzes the answer against expected keywords and provides detailed feedback.

### Progress Tracking
- Automatic streak calculation
- Score tracking across quizzes and tests
- Visual charts for improvement over time
- Activity distribution analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is built for educational purposes.

## Acknowledgments

- Powered by Claude AI by Anthropic
- Built with modern web technologies

---

**Note**: Make sure to set your `ANTHROPIC_API_KEY` environment variable before deploying or running in production mode.

