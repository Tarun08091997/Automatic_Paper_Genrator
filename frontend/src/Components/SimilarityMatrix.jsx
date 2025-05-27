import React, { useEffect, useState } from "react";

export default function SimilarityMatrix({ data, visibleIndex, sets = 1 }) {
  const [matrices, setMatrices] = useState({});
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    const allMatrices = {};

    for (let subjectIndex = 0; subjectIndex < data.length; subjectIndex++) {
      const setsData = data[subjectIndex];
      if (!setsData || setsData.length < sets) continue;

      const subjectMatrix = [];

      for (let i = 0; i < sets; i++) {
        const row = [];
        for (let j = 0; j < sets; j++) {
          if (i === j) {
            row.push("—");
          } else {
            row.push(getSimilarity(setsData[i], setsData[j]));
          }
        }
        subjectMatrix.push(row);
      }

      allMatrices[subjectIndex] = subjectMatrix;
    }

    setMatrices(allMatrices);
    console.log("Similarity Matrix" , allMatrices);
  }, [data, sets]);

  const getSimilarity = (setA, setB) => {
    if (!setA?.selectedQuestions || !setB?.selectedQuestions) return 0;

    const flattenQuestions = (selected) =>
      Object.values(selected).flat();

    const questionsA = flattenQuestions(setA.selectedQuestions);
    const questionsB = flattenQuestions(setB.selectedQuestions);

    const mapB = new Map();
    for (const q of questionsB) {
      const key = q.Question;
      mapB.set(key, q.Marks);
    }

    let commonMarks = 0;

    for (const qA of questionsA) {
      const key = qA.Question;
      if (mapB.has(key)) {
        const mark = parseFloat(qA.Marks) || 0;
        commonMarks += mark;
      }
    }

    return commonMarks;
  };


  const matrix = matrices[visibleIndex] || [];
  const file = data?.[visibleIndex]?.[0]?.data || {};

  return (
    <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-50 text-white transition-opacity duration-500 opacity-100">
      {showMatrix ? (
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg w-72 animate-fade-in">
          <h4 className="text-lg font-semibold mb-2 text-center border-b border-gray-600 pb-1">
            Similarity Matrix
          </h4>
          <p className="text-sm text-gray-300 mb-3 text-center">
            Subject:{" "}
            <span className="font-bold text-white">{file.subject}</span>
          </p>
          <table className="table-auto w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-700 p-1">Set</th>
                {matrix.map((_, i) => (
                  <th key={i} className="border border-gray-700 p-1">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td className="border border-gray-700 p-1 font-bold text-center">
                    {i + 1}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className="border border-gray-700 p-1 text-center"
                    >
                      {val}
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
