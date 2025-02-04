"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { AnimatedHeader } from "@/app/_components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
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
import Link from "next/link";
import { MoveLeft } from "lucide-react";

const Loader = () => (
  <div className="w-5 h-5 border-2 border-t-transparent border-accent rounded-full animate-spin"></div>
);

const PathwayComponent = () => {
  const [loading, setLoading] = useState(false);
  const [pathway, setPathway] = useState("");
  const [learningStyle, setLearningStyle] = useState("Visual");
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const generatePathway = async () => {
    setLoading(true);
    setError(null);
    setPathway("");

    try {
      const controller = new AbortController();
      const response = await fetch(
        `/api/generatePathway?userId=${user?.id}&learningStyle=${learningStyle}`,

        {
          method: "POST",
          signal: controller.signal,
        }
      );

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setPathway((prev) => prev + decoder.decode(value));
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Request aborted");
      } else {
        setError("Failed to generate pathway. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;

    doc.setFontSize(18);
    doc.text("Learning Pathway", margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(
      pathway,
      doc.internal.pageSize.width - margin * 2
    );

    lines.forEach((line: string | string[]) => {
      if (yPos > doc.internal.pageSize.height - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 10;
    });

    doc.save("learning-pathway.pdf");
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center ">
        <Link href="/">
          <Button className="mb-10 bg-white text-black hover:bg-black hover:text-white transition-transform transform hover:scale-105 px-6 py-3 rounded-md">
            <MoveLeft />
            Home
          </Button>
        </Link>
        <AnimatedHeader
          text="Personalized Learning Pathway"
          className="text-3xl font-extrabold mt-5 mb-10 mr-20 text-center text-white"
        />
        <div>
          {error && (
            <Alert variant="destructive" className="p-4 border border-red-600">
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      

      {!pathway && (
        <div className="text-center">
          <Button
            onClick={generatePathway}
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
              "Generate Pathway"
            )}
          </Button>
        </div>
      )}

      

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
