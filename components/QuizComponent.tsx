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
import prisma from "@/app/libs/prismadb";
import axios from "axios";
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
      console.log("Formatted Quiz:", formattedQuiz);

      

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

    // Save user to database
    //Update user results
    const saveQuizResults = async () => {
      await fetch("/api/saveResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, result }),
      });
    };
    saveQuizResults();
    console.log("Evaluation Result:", result);
    alert(`Your score: ${result.score}/10. Level: ${result.level}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Generator</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Input for course name */}
        <Input
          type="text"
          placeholder="Enter course name (e.g., DSA in Java)"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />
        <Button
          onClick={handleGenerateQuiz}
          disabled={loading || !courseName}
          className="mt-4"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            "Generate Quiz"
          )}
        </Button>
        <Button onClick={() => signOut({ redirectUrl: '/' })}>Sign out</Button>


        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Display Quiz */}
        {quiz.length > 0 && !loading && (
          <div className="mt-6 space-y-4">
            {quiz.map((q, index) => (
              <div key={index} className="p-4 border rounded-md">
                <h3 className="font-bold">{q.question}</h3>
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} className="block mt-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={
                        userAnswers[index] === option.split(".")[0].trim()
                      }
                      onChange={() => handleAnswerChange(index, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
            <Button onClick={handleSubmitQuiz} className="mt-4">
              Submit Quiz
            </Button>

          </div>
        )}

        {/* Evaluation result */}
        {evaluation && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">Your Results</h3>
            <p>Score: {evaluation.score}/10</p>
            <p>Level: {evaluation.level}</p>
          </div>
        )}

        <Link href={'/GeneratePathway'} >
        <Button>
          Generate Pathway
        </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QuizComponent;
