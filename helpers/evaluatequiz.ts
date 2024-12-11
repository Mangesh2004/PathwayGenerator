interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
}

interface EvaluationResult {
  score: number;
  level: string;
  detailedAnalysis: {
    correctAnswers: string[];
    incorrectAnswers: {
      question: string;
      userAnswer: string;
      correctAnswer: string;
      difficulty: string;
    }[];
    difficultyBreakdown: {
      basic: number;
      intermediate: number;
      advanced: number;
    };
  };
}

export function evaluateQuiz(userAnswers: string[], quiz: QuizQuestion[]): EvaluationResult {
  let score = 0;
  const detailedAnalysis = {
    correctAnswers: [] as string[],
    incorrectAnswers: [] as any[],
    difficultyBreakdown: {
      basic: 0,
      intermediate: 0,
      advanced: 0,
    },
  };

  // Calculate score and collect detailed analysis
  quiz.forEach((question, index) => {
    const isCorrect = userAnswers[index] === question.correctAnswer;
    
    if (isCorrect) {
      score++;
      detailedAnalysis.correctAnswers.push(question.question);
    } else {
      detailedAnalysis.incorrectAnswers.push({
        question: question.question,
        userAnswer: userAnswers[index],
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty.toLowerCase(),
      });
    }

    // Update difficulty breakdown
    const difficulty = question.difficulty.toLowerCase();
    if (difficulty.includes('basic')) detailedAnalysis.difficultyBreakdown.basic++;
    else if (difficulty.includes('intermediate')) detailedAnalysis.difficultyBreakdown.intermediate++;
    else if (difficulty.includes('advanced')) detailedAnalysis.difficultyBreakdown.advanced++;
  });

  const level =
    score >= 8
      ? "Advanced"
      : score >= 5
      ? "Intermediate"
      : score > 0
      ? "Beginner"
      : "Needs Improvement";

  return {
    score,
    level,
    detailedAnalysis,
  };
}