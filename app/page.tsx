'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { chatSession } from '@/models/AiModel';

const QuizGeneration = () => {
  const [courseName, setCourseName] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleGenerateQuiz = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setQuiz(null);
    setError(null);
    setShowAnswers(false);

    try {
      const prompt = `Generate a quiz with 10 questions ranging from basic to advanced for the course: "${courseName}". 
      Questions should cover basic, intermediate, and advanced topics, with multiple-choice options and correct answers. 
      Include difficulty level for each question. Format the questions as:
      1. Question 1?
      A. Option 1
      B. Option 2
      C. Option 3
      D. Option 4
      Correct Answer: (e.g., A)`;

      const result = await chatSession.sendMessage(prompt);
      const quizContent = result.response.text();
      setQuiz(quizContent);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.' as any);
    } finally {
      setLoading(false);
    }
  };

  const formatQuiz = (quizText: any) => {
    return quizText.split('\n').map((line: any, index: any) => {
      // Question number with difficulty
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} className="mt-8 first:mt-4">
            <h3 className="text-lg font-bold text-gray-800">
              {line}
            </h3>
          </div>
        );
      }
      // Multiple choice options
      else if (line.match(/^[A-D]\./)) {
        return (
          <div key={index} className="ml-4 mt-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name={`question-${index}`}
                className="mt-1"
                onChange={(e) => handleAnswerChange(e, line)}
              />
              <span className="text-gray-700">{line}</span>
            </label>
          </div>
        );
      }
      // Correct answer
      else if (line.match(/^Correct Answer:/i)) {
        return showAnswers ? (
          <div key={index} className="mt-3 ml-4 p-2 bg-green-50 rounded-md">
            <p className="text-green-700 font-medium">
              {line}
            </p>
          </div>
        ) : null;
      }
      // Difficulty level
      else if (line.match(/^Difficulty:/i)) {
        return (
          <div key={index} className="ml-4 mt-1">
            <span className="text-sm text-gray-500 italic">
              {line}
            </span>
          </div>
        );
      }
      // Other lines
      return line.trim() && (
        <p key={index} className="ml-4 mt-1 text-gray-600">
          {line}
        </p>
      );
    });
  };

  const handleAnswerChange = (e: any, line: string) => {
    
      const correctAnswer = (quiz as any).split('\n').find((l: string) => l.startsWith('Correct Answer:'))?.split(': ')[1];
    
    
    if (e.target.checked && line.endsWith(correctAnswer)) {
      e.target.parentElement.classList.add('bg-green-50');
      e.target.parentElement.classList.remove('bg-red-50');
    } else {
      e.target.parentElement.classList.add('bg-red-50');
      e.target.parentElement.classList.remove('bg-green-50');
      setShowAnswers(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateQuiz}>
          <Input
            type="text"
            placeholder="Enter course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Generating Quiz...</span>
              </div>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quiz && (
          <div className="mt-8">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Quiz for {courseName}
              </h2>
              <div className="space-y-2">
                {formatQuiz(quiz)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizGeneration;