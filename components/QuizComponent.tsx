"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { chatSession } from "@/models/AiModel";
import { evaluateQuiz } from "@/helpers/evaluatequiz";
import { useClerk, useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Link from "next/link";

// Define Types for Quiz and Evaluation
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string; // Example: 'A', 'B', 'C', 'D'
  difficulty: string; // Example: 'Basic', 'Intermediate', 'Advanced'
}

interface EvaluationResult {
  level: string;
  score: number;
}

const QuizComponent: React.FC = () => {
  const [courseName, setCourseName] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const { user } = useUser();
  const { signOut } = useClerk()  //Save User to db

  const userId=user?.id

  const saveUser = async () => {
    await fetch("/api/saveUser", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    
  };
  useEffect(() => {
    if (user) {
      saveUser();
    }
  }, [user]);

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setQuiz([]);
    setError("");
    setEvaluation(null);

    try {
      const prompt = `Generate a quiz with 10 questions ranging from basic to advanced for the course: "${courseName}". 
        Questions should include multiple-choice options only (A, B, C, D) and the correct answer. Question should not contain any other type. Format as:
        1. Question text
        A. Option 1
        B. Option 2
        C. Option 3
        D. Option 4
        Correct Answer: <Correct option>
        Difficulty: <Basic/Intermediate/Advanced>
  }`;

      const data = await chatSession.sendMessage(prompt);
      const quizContent = data.response.text();

      // Format quiz from API response
      const formattedQuiz = formatQuiz(quizContent);

      

      setQuiz(formattedQuiz);
      setUserAnswers(Array(formattedQuiz.length).fill("")); // Initialize user answers
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format quiz data
  const formatQuiz = (quizContent: string): QuizQuestion[] => {
    const lines = quizContent.split("\n").filter((line) => line.trim());
    const questions: QuizQuestion[] = [];
    let currentQuestion: QuizQuestion | any = null;

    lines.forEach((line) => {
      if (line.match(/^\d+\./)) {
        // If a new question is found, push the previous question and start a new one
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = {
          question: line,
          options: [],
          correctAnswer: "",
          difficulty: "",
        };
      } else if (line.match(/^[A-D]\./)) {
        // Option (A, B, C, D)
        currentQuestion?.options.push(line);
      } else if (line.startsWith("Correct Answer:")) {
        // Correct answer
        if (currentQuestion)
          currentQuestion.correctAnswer = line.split(": ")[1];
      } else if (line.startsWith("Difficulty:")) {
        // Difficulty level
        if (currentQuestion) currentQuestion.difficulty = line.split(": ")[1];
      }
    });

    if (currentQuestion) questions.push(currentQuestion); // Add last question
    return questions;
  };

  // Handle user answer selection
  const handleAnswerChange = (index: number, selectedOption: string) => {
    // Extract the letter (e.g., "C" from "C. Answer Text")
    const optionLetter = selectedOption.split(".")[0].trim();
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = optionLetter; // Store only the letter
    setUserAnswers(updatedAnswers);
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    if (quiz.length === 0 || userAnswers.length === 0) {
      alert("Please complete the quiz first!");
      return;
    }

    const result = evaluateQuiz(userAnswers, quiz);
    setEvaluation(result);

    console.log("Evaluation Result:", result);
    const score = result.score;
    const level = result.level;
    

    // Save user to database
    //Update user results
    const saveQuizResults = async () => {
      await fetch("/api/saveResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, score,level, courseName, quiz }),
      });
    };
    saveQuizResults();
    console.log("Evaluation Result:", result);
    alert(`Your score: ${result.score}/10. Level: ${result.level}`);
  };

  return (
    <div className="min-h-screen  bg-slate-900 p-5">
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700 p-4 overflow-auto">
  <CardHeader className="border-b border-gray-700">
    <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      Quiz Generator
    </CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-6 pt-6">
    <div className="relative">
      <Input
        type="text"
        placeholder="Enter course name (e.g., DSA in Java)"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        required
        className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-blue-500"
      />
    </div>

    <div className="flex gap-4">
      <Button
        onClick={handleGenerateQuiz}
        disabled={loading || !courseName}
        className="bg-gradient-to-r from-blue-300 to-purple-400 hover:from-blue-800 hover:to-purple-800 text-black hover:text-white"
      >
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          "Generate Quiz"
        )}
      </Button>
      
      <Button 
        onClick={() => signOut({ redirectUrl: '/' })}
        variant="outline"
        className="bg-gradient-to-r from-blue-300 to-purple-400 hover:from-blue-800 hover:to-purple-800 text-black hover:text-white"
      >
        Sign out
      </Button>
    </div>

    {error && (
      <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-red-200">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {quiz.length > 0 && !loading && (
      <div className="space-y-6">
        {quiz.map((q, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-blue-300">{q.question}</h3>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => handleAnswerChange(index, option)}
                  className={`
                    p-4 rounded-lg border transition-all duration-200
                    ${userAnswers[index] === option.split(".")[0].trim()
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'}
                    flex items-center justify-between
                  `}
                >
                  <span>{option}</span>
                  {userAnswers[index] === option.split(".")[0].trim() && (
                    <Check className="h-5 w-5 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <Button 
          onClick={handleSubmitQuiz}
          className="bg-gradient-to-r from-blue-300 to-purple-400 hover:from-blue-800 hover:to-purple-800 text-black hover:text-white"
        >
          Submit Quiz
        </Button>
        <Link href="/GeneratePathway" className="block mt-6">
      <Button className="bg-gradient-to-r from-blue-300 to-purple-400 hover:from-blue-800 hover:to-purple-800 text-black hover:text-white">
        Generate Learning Pathway
      </Button>
    </Link>
      </div>
    )}

    {evaluation && (
      <div className="mt-6 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-blue-300 mb-4">Your Results</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Score</span>
            <span className="text-2xl font-bold text-blue-400">{evaluation.score}/10</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Level</span>
            <span className="text-lg font-semibold text-purple-400">{evaluation.level}</span>
          </div>
        </div>
      </div>
    )}

    
  </CardContent>
</Card>
    </div>
  );
};

export default QuizComponent;
