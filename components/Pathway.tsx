"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { AnimatedHeader } from "@/app/_components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { jsPDF } from "jspdf";

const Loader = () => (
  <div className="w-5 h-5 border-2 border-t-transparent border-accent rounded-full animate-spin"></div>
);

const PathwayComponent = () => {
  const [loading, setLoading] = useState(false);
  const [pathway, setPathway] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState("Visual");

  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const userId = user?.id as any;

  const fetchPathway = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        `/api/generatePathway?userId=${userId}&learningStyle=${learningStyle}`
      );
      setPathway(data.pathway);
      console.log(data.pathway);

      // setAnalysis(data.analysis);
    } catch (err) {
      console.error("Error fetching pathway:", err);
      setError("Failed to fetch learning pathway.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text("Learning Pathway", 20, 20);

      // Add learning style
      doc.setFontSize(14);
      doc.text(`Learning Style: ${learningStyle}`, 20, 35);

      // Add content
      doc.setFontSize(12);
      let yPosition = 50;

      if (Array.isArray(pathway)) {
        pathway.forEach((step, index) => {
          // Check if we need a new page
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }

          const stepText = `${index + 1}. ${step.replace(/\*\*/g, "")}`;
          const splitText = doc.splitTextToSize(stepText, 170);

          doc.text(splitText, 20, yPosition);
          yPosition += 10 * splitText.length;
        });
      } else if (typeof pathway === "string") {
        const splitText = doc.splitTextToSize(
          pathway.replace(/\*\*/g, ""),
          170
        );
        splitText.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 10;
        });
      }

      // Generate the PDF
      doc.save("learning-pathway.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-5 ">
      <AnimatedHeader
        text=" Personalized Learning Pathway"
        className="text-3xl font-extrabold mt-5 mb-10 text-center text-white"
      />
      <div>
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="p-4 border border-red-600">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-center items-center ">
        <div className="text-white font-bold text-2xl gap-2 flex justify-end mr-10 pb-6">
          <h1>Select your learning style</h1>
        </div>
        <div className="mb-6 bg-zinc-900 text-black max-w-[200px]">
          <Select onValueChange={setLearningStyle} value={learningStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select Learning Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visual">Visual</SelectItem>
              <SelectItem value="Auditory">Auditory</SelectItem>
              <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

        {/* Generate Pathway Button */}
        {/* Generate Pathway Button or Loader */}
        {!pathway && (
          <div className="text-center">
            <Button
              onClick={fetchPathway}
              className={cn(
                "px-7 py-4  shadow-md hover:scale-105 transition-all",
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
                "Show My Learning Pathway"
              )}
            </Button>
          </div>
        )}

        {/* Display Pathway */}
        {pathway && (
          <div className="space-y-8">
            <Card className="bg-zinc-800">
              <CardHeader>
                <CardTitle className="text-3xl font-bold flex justify-center text-gray-200">
                  Your Learning Journey
                </CardTitle>
                <CardDescription className="text-gray-400 flex justify-center text-xl">
                  A personalized pathway tailored to your needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(pathway) ? (
                  <div className="space-y-6">
                    {pathway.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start p-4 bg-zinc-700 rounded-lg shadow-md border-l-4 border-blue-600"
                      >
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-800 text-white rounded-full font-bold text-lg">
                          {index + 1}
                        </span>
                        <div className="ml-4 text-gray-300 text-lg">
                          {step.replace(/\*\*/g, "")}
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
              </CardContent>
            </Card>
            <div className="flex justify-center ">
              <Button
                onClick={downloadPDF}
                className="bg-green-600 hover:bg-green-700 transition-transform transform hover:scale-105 text-white px-6 py-3 rounded-md"
              >
                Download as PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default PathwayComponent;
