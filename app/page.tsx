'use client'
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target } from "lucide-react";
import Link from "next/link";
import Hero from "./_components/Hero";
import GetStarted from "./_components/GetStarted";
import FeaturesSectionDemo from "./_components/Features";
import About from "./_components/About";

export default function Page() {
  return (
    <div>
      <div className="fixed top-0 z-[-2] min-h-screen max-w-screen w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <Hero />
        <About />

        {/* Bottom CTA */}

        <GetStarted  />

        {/* Features Grid */}
        <FeaturesSectionDemo />
      </div>
    </div>
  );
}
