'use client'
import React from 'react';
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { motion } from "framer-motion";
import { AnimatedHeader } from './Header';

interface Word {
  text: string;
  className: string;
}

const Hero: React.FC = () => {
  const words: Word[] = [
    {
      text: "Navigate",
      className: "text-purple-500 dark:text-purple-400"
    },
    {
      text: "your",
      className: "text-slate-300"
    },
    {
      text: "pathway",
      className: "text-pink-500 dark:text-pink-400"
    },
    {
      text: "towards",
      className: "text-slate-300"
    },
    {
      text: "knowledge",
      className: "text-emerald-500 dark:text-emerald-400 font-bold"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[30vh] space-y-8">
      <AnimatedHeader text="SAARTHI" className="text-4xl font-title md:text-6xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500 bg-clip-text text-transparent" />
      <TypewriterEffectSmooth 
        words={words} 
        cursorClassName="h-8 w-[3px] bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse" 
      />
    </div>
  );
};

export default Hero;