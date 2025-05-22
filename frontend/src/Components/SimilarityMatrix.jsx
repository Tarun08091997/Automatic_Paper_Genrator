import React, { useState } from "react";

export default function SimilarityMatrix({ data , visibleIndex }) {
  const [showMatrix, setShowMatrix] = useState(file.sets > 1);

  const getSimilarity = (setA, setB) => {
    if (!setA.selectedQuestions || !setB.selectedQuestions) return 0;

    const idsA = new Set(setA.selectedQuestions.map(q => q.id || q.text));
    const idsB = new Set(setB.selectedQuestions.map(q => q.id || q.text));

    const common = [...idsA].filter(id => idsB.has(id));
    return common.length;
  };

  return (
    <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-50 text-white transition-opacity duration-500 opacity-100">
      {showMatrix ? (
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg w-72 animate-fade-in">
          <h4 className="text-lg font-semibold mb-2 text-center border-b border-gray-600 pb-1">
            Similarity Matrix
          </h4>
          <p className="text-sm text-gray-300 mb-3 text-center">
            Subject: <span className="font-bold text-white">{file.subject}</span>
          </p>
          <table className="table-auto w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-700 p-1">Set</th>
                {setsData.map((_, i) => (
                  <th key={i} className="border border-gray-700 p-1">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {setsData.map((setA, i) => (
                <tr key={i}>
                  <td className="border border-gray-700 p-1 font-bold text-center">
                    {i + 1}
                  </td>
                  {setsData.map((setB, j) => (
                    <td key={j} className="border border-gray-700 p-1 text-center">
                      {i === j ? "—" : getSimilarity(setA, setB)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => setShowMatrix(false)}
            className="mt-3 w-full py-1 text-sm bg-red-600 hover:bg-red-700 rounded"
          >
            Close
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowMatrix(true)}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl shadow text-sm font-semibold"
        >
          Show Similarity Matrix
        </button>
      )}
    </div>
  );
}

