import React from 'react';

export default function VideoSection() {
  return (
    <div className="relative">
      {/* Darker ambient background with reduced opacity gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 via-purple-950/30 to-slate-950/30 blur-2xl" />
      
      {/* Video container with darker glassmorphism */}
      <div className="relative mt-8 flex justify-center items-center pb-16">
        <div className="bg-black/40 p-4 rounded-xl backdrop-blur-sm">
          <iframe
            className="border-4 border-gray-400/20 rounded-lg shadow-2xl"
            width="1000"
            height="563"
            src="https://www.youtube.com/embed/VQIZEEmE83o?si=V8E_JMewfjpyE3yy"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}