'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function About() {

  const fadeUpVariants = {
    hidden: { 
      opacity: 0,
      y: 30
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto "
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.p
        variants={fadeUpVariants}
        className="mt-[3px] font-normal sm:text-[25px] text-[15px] text-justify text-gray-300"
      >
        <span className="font-semibold block leading-relaxed text-center">
        Unleash your potential with SAARTHI – your personalized learning companion! By analyzing your strengths and weaknesses in each topic, we craft tailored roadmaps and provide curated resources at every step, all designed to match your unique skills, goals, and learning style.</span>
      </motion.p>
    </motion.div>
  );
}