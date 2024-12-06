import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, Trophy } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br p-3 sm:p-5 from-gray-900 via-black to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10 sm:py-20">
        <div className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Personalized Learning Journey
          </h1>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
            Discover your optimal learning path through our adaptive quiz system and AI-powered recommendations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mt-10 sm:mt-20 px-2">
          <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-200">
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg w-fit">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-3 sm:mt-4">
              Adaptive Learning
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              Personalized quizzes that adapt to your knowledge level
            </p>
          </div>

          <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-200">
            <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg w-fit">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-3 sm:mt-4">
              Smart Pathways
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              AI-generated learning paths based on your performance
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-20 text-center px-2">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
            Ready to start your personalized learning journey?
          </h3>
          <Link href="/Quiz">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 
                           hover:from-purple-600 hover:to-pink-600 text-white 
                           px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl 
                           transition-all duration-200 shadow-lg hover:shadow-xl">
              Take the Quiz Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}