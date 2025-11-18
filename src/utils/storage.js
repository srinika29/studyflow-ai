export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const updateProgress = (type, data) => {
  const progress = getFromStorage('studyflow_progress', {
    quizzes: [],
    tests: [],
    flashcards: [],
    streak: 0,
    lastStudyDate: null,
    totalStudyTime: 0,
  });

  if (type === 'quiz') {
    progress.quizzes.push({
      ...data,
      date: new Date().toISOString(),
    });
  } else if (type === 'test') {
    progress.tests.push({
      ...data,
      date: new Date().toISOString(),
    });
  } else if (type === 'flashcard') {
    progress.flashcards.push({
      ...data,
      date: new Date().toISOString(),
    });
  }

  // Update streak
  const today = new Date().toDateString();
  const lastDate = progress.lastStudyDate ? new Date(progress.lastStudyDate).toDateString() : null;
  
  if (lastDate === today) {
    // Already studied today, no change
  } else if (lastDate && new Date(today) - new Date(lastDate) === 86400000) {
    // Consecutive day
    progress.streak += 1;
  } else {
    // New streak
    progress.streak = 1;
  }
  
  progress.lastStudyDate = new Date().toISOString();

  saveToStorage('studyflow_progress', progress);
  return progress;
};

export const getProgress = () => {
  return getFromStorage('studyflow_progress', {
    quizzes: [],
    tests: [],
    flashcards: [],
    streak: 0,
    lastStudyDate: null,
    totalStudyTime: 0,
  });
};

