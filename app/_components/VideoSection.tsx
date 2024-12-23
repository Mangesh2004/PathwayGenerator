import React from 'react'

export default function VideoSection() {
  return (
    <div>
      <div className="mt-8 flex justify-center items-center pb-16">
        <iframe
          className="border-4 border-gray-300 rounded-lg shadow-lg"
          width="1000"
          height="563"
          src="https://www.youtube.com/embed/VQIZEEmE83o?si=V8E_JMewfjpyE3yy"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}
