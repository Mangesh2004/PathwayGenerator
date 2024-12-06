"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import axios from "axios";
import { useUser } from "@clerk/nextjs";

const PathwayComponent = () => {
  const [loading, setLoading] = useState(false);
  const [pathway, setPathway] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const userId = user?.id as any;

  const fetchPathway = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        `/api/generatePathway?userId=${userId}`
      );
      setPathway(data.pathway);
    } catch (err) {
      console.error("Error fetching pathway:", err);
      setError("Failed to fetch learning pathway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-5">
      <div className=" mx-auto p-6 bg-gray-900 text-gray-100 rounded-xl shadow-xl border border-gray-700">
  <h1 className="text-3xl font-extrabold mb-6 text-center text-white">
    Your Personalized Learning Pathway
  </h1>

  {error && (
    <div className="p-4 mb-6 bg-red-800 border border-red-600 rounded-lg">
      <p className="text-red-200">{error}</p>
    </div>
  )}

  {!pathway && !loading && (
    <div className="text-center">
      <Button
        onClick={fetchPathway}
        className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-transform transform hover:scale-105"
      >
        Generate Pathway
      </Button>
    </div>
  )}

  {loading && (
    <div className="flex items-center justify-center p-8 space-x-3 bg-gray-800 rounded-lg">
      <span className="text-gray-300 font-medium">
        Creating your personalized pathway...
      </span>
      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )}

  {pathway && (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-200">
        Your Learning Journey
      </h2>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
        {Array.isArray(pathway) ? (
          <div className="space-y-6">
            {pathway.map((step, index) => (
              <div
                key={index}
                className="p-4 bg-gray-700 rounded-lg shadow-lg border-l-4 border-blue-600"
              >
                <div className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-lg">
                    {index + 1}
                  </span>
                  <p className="text-gray-300 text-lg">
                    {step.replace(/\*\*/g, "")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-gray-300 text-lg">
            {typeof pathway === "string"
              ? pathway.replace(/\*\*/g, "")
              : pathway}
          </pre>
        )}
      </div>
    </div>
  )}
</div>
    </div>

  );
};

export default PathwayComponent;
