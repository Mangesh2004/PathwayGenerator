'use client'

import QuizComponent from '@/components/QuizComponent'
import Background from "@/components/bg"
import React from 'react'

export default function Quiz() {
  return (
    <main className="relative min-h-screen">
      {/* Background layer */}
      <div className="fixed inset-0 z-0">
        <Background />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <QuizComponent />
        </div>
      </div>
    </main>
  )
}