import React from 'react'

export default function SimilarityMatrix({file}) {
  return (
    <div className="fixed right-2 top-1/2 transform -translate-y-1/2 p-5 bg-red-950 text-white rounded-xl z-50 transition-opacity duration-500 opacity-100 animate-fade-in">
        {file.subject}
    </div>
  )
}
