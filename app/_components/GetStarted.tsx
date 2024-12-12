import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Waypoints } from "lucide-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { AnimatedHeader } from "./Header";

export default function GetStarted() {
  const items = [
    {
      title: "Take Quiz",
      href: "/Quiz",
      icon: <img src="/brain.png" alt="Brain" className="w-5 h-5" />,
    },
    {
      title: "Generate Pathway",
      href: "/GeneratePathway",
      icon: <Waypoints className="w-5 h-5" />,
    },
  ];
  return (
    <div>
      <div className=" sm:mt-9 text-center px-2 ">
        
        <AnimatedHeader text="Learning Simplified, Progress Amplified!" className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6" />

       
      </div>
      <FloatingDock items={items}  />
    </div>
  );
}
