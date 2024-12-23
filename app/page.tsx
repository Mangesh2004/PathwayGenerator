'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Target } from "lucide-react"
import Link from "next/link"
import Hero from "./_components/Hero"
import GetStarted from "./_components/GetStarted"
import FeaturesSectionDemo from "./_components/Features"
import About from "./_components/About"
import Background from "@/components/bg"
import VideoSection from "./_components/VideoSection"


export default function Page() {
  return (
    <main className="relative min-h-screen">
      {/* Background layer */}
      <div className="fixed inset-0 z-0">
        <Background />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <Hero />
          <About />
          <GetStarted />
          <FeaturesSectionDemo />
          <VideoSection />
        </div>
      </div>
    </main>
  )
}