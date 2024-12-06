// Define types for better TypeScript support
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string; // Example: 'A', 'B', 'C', 'D'
}

interface EvaluationResult {
  score: number;
  level: string;
}

/**
 * Evaluates the quiz answers.
 *
 * @param userAnswers - Array of user's answers (e.g., ['A', 'B', ...]).
 * @param quiz - Array of quiz questions with correct answers.
 * @returns Evaluation result with score and level.
 */
export function evaluateQuiz(userAnswers: string[], quiz: QuizQuestion[]): EvaluationResult {
  let score = 0;

  // Calculate score
  quiz.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      score++;
    }
    console.log(userAnswers[index], "    ", question.correctAnswer);
    
  });

  // Determine the user's level based on the score
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
  };
}
