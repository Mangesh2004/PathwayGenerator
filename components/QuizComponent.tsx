"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpCircle, Loader2, MoveLeft } from "lucide-react";
import { chatSession } from "@/models/AiModel";
import { evaluateQuiz } from "@/helpers/evaluatequiz";
import { useClerk, useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Link from "next/link";
import { AnimatedHeader } from "@/app/_components/Header";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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

const Loader = () => (
  <div className="w-5 h-5 border-2 border-t-transparent border-accent rounded-full animate-spin"></div>
);

const QuizComponent: React.FC = () => {
  const [courseName, setCourseName] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showQuizInfo, setShowQuizInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { user } = useUser();
  const { signOut } = useClerk(); //Save User to db

  const name = user?.fullName;

  const userId = user?.id;

  // const saveUser = async () => {
  //   await fetch("/api/saveUser", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(user),
  //   });
  // };
  // useEffect(() => {
  //   if (user) {
  //     saveUser();
  //   }
  // }, [user]);

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

    //Combine questions with user answers
    const questionsWithAnswers = quiz.map((question, index) => ({
      ...question,
      userAnswer: userAnswers[index],
    }));
    setShowResults(true);
    console.log("Evaluation Result:", result);

    // Save user to database
    //Update user results
    const saveQuizResults = async () => {
      await fetch("/api/saveResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          score: result.score,
          level: result.level,
          courseName,
          questions: questionsWithAnswers, // Send questions with user answers
        }),
      });
    };
    saveQuizResults();
    console.log("Evaluation Result:", result);
    // alert(`Your score: ${result.score}/10. Level: ${result.level}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20 },
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div>
      <div className="flex justify-between items-center ">
      <Link href="/">
          <Button className="mb-10 bg-white text-black hover:bg-black hover:text-white transition-transform transform hover:scale-105 px-6 py-3 rounded-md">
            <MoveLeft />
            Home
          </Button>
        </Link>
      <AnimatedHeader
        text=" Welcome back!"
        className="text-5xl absolute left-1/3 ml-20 transform -translate-x-1/2 font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
      />
      
      </div>
      <AnimatedHeader
        text="Ready to embark on your next learning adventure? Move a step ahead to build a roadmap tailored just for you!"
        className="text-gray-300 text-xl flex justify-center"
      />
      <div className=" p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 text-white border-gray-700 backdrop-blur-sm">
            <CardContent className="space-y-6 pt-6">
              {!quiz.length ? (
                <div className="space-y-6 ">
                  <div className="space-y-2">
                    <label className="text-lg text-gray-200 font-medium flex justify-center">
                      What topic would you like to master?
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Machine Learning, Data Structures, Web Development..."
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50 backdrop-blur-sm flex justify-center flex-col items-center text-center">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">
                      Get Ready for Your Personalized Quiz!
                    </h3>
                    <div className="text-gray-300 mb-4">
                      Help us understand where you stand to create the perfect
                      learning pathway. This quick quiz will assess your current
                      knowledge level and strengths in your chosen topic.
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          <HelpCircle className="h-4 w-4" />
                          Why take this quiz?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-gray-700 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-blue-300">
                            Why Take This Quiz?
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            The quiz helps us craft a learning experience
                            tailored to your specific needs. Every question is
                            designed to highlight both your strengths and areas
                            that need more focus. If you answer a question
                            incorrectly, that particular topic will be given
                            extra attention in your personalized roadmap.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleGenerateQuiz}
                      className={cn(
                        "px-6 py-3 shadow-md hover:scale-105 transition-all flex justify-center",
                        loading
                          ? "bg-zinc-600 text-white cursor-not-allowed"
                          : "bg-accent text-black hover:text-white"
                      )}
                      disabled={loading || !courseName}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        "Start Your Quiz Now"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quiz questions remain the same */}
                  {quiz.map((q, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50"
                    >
                      <h3 className="text-xl font-bold mb-4 text-gray-200">
                        {q.question}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleAnswerChange(index, option)}
                            className={`
                            p-4 rounded-lg border transition-all duration-200
                            ${
                              userAnswers[index] === option.split(".")[0].trim()
                                ? "bg-slate-200 border-blue-500 text-black"
                                : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                            }
                            flex items-center justify-between
                          `}
                          >
                            <span>{option}</span>
                            {userAnswers[index] ===
                              option.split(".")[0].trim() && (
                              <Check className="h-5 w-5 text-blue-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col justify-center sm:flex-row gap-4">
                    <Button
                      onClick={handleSubmitQuiz}
                      className={cn(
                        "px-6 py-3 shadow-md hover:scale-105 transition-all",
                        loading
                          ? "bg-zinc-600 text-white cursor-not-allowed"
                          : "bg-accent text-black hover:text-white"
                      )}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        "Submit quiz"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={showResults} onOpenChange={setShowResults}>
            <AlertDialogContent className="bg-zinc-900 border-gray-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl text-blue-300">
                  Quiz Results
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Score</span>
                        <span className="text-2xl font-bold text-blue-400">
                          {evaluation?.score}/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Level</span>
                        <span className="text-lg font-semibold text-purple-400">
                          {evaluation?.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-300">
                    Based on your performance, we will create a personalized
                    learning pathway that focuses on strengthening your
                    knowledge gaps while building upon your existing expertise.
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction asChild>
                  <Link href="/GeneratePathway">
                  <Button
                      
                      className={cn(
                        "px-6 py-3 shadow-md hover:scale-105 transition-all",
                        loading
                          ? "bg-zinc-600 text-white cursor-not-allowed"
                          : "bg-accent text-black hover:text-white"
                      )}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        "Submit quiz"
                      )}
                    </Button>
                  </Link>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizComponent;
