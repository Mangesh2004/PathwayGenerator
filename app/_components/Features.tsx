'use client';
import { cn } from "@/lib/utils";

import { BookmarkPlusIcon, CommandIcon, FileEditIcon, FileQuestionIcon, LucideWaypoints, SmartphoneCharging } from "lucide-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: 'Personalized Quizzes',
      description: 'Boost your skills with quizzes tailored to your unique learning level and goals. These quizzes adapt to challenge you and ensure you\'re learning at right pace.',
      icon: <FileQuestionIcon/>
    },
    {
      title: 'Pathway Generator',
      description: 'Create a step-by-step roadmap to achieve your learning objectives with ease. The roadmap evolves based on your preferences & knowledge level & progress, keeping you on track toward your goals.',
      icon:<LucideWaypoints/>
    },
    {
      title: 'Resource Companion',
      description: 'Access curated resources at every step of your learning journey, ensuring you have the right tools to succeed according to your learning style—auditory, visual, and kinesthetic.',
      icon: <BookmarkPlusIcon/>
    },
    {
      title: 'Feedback Hub',
      description: 'Receive actionable insights and suggestions to continuously improve your learning. Feedback is personalized to help you focus on areas where you can grow the most.',
      icon:<FileEditIcon/>
        },
    {
      title: 'Adaptive Learning',
      description: 'Experience a dynamic platform that evolves based on your performance and preferences. The system adjusts content difficulty to suit your learning style and pace.',
      icon: <SmartphoneCharging/>
    },
    {
      title: 'Community Collaboration',
      description: 'Engage with a vibrant learning community to share knowledge, ideas, and experiences. Collaborate on projects, ask questions, and learn together with peers who are on similar journeys.',
      icon:<CommandIcon/>
    }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 3) && "lg:border-l dark:border-neutral-800",
        index < 3 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t bg-zinc-800 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b bg-zinc-800 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-300 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <div className="text-sm text-slate-200 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </div>
    </div>
  );
};
