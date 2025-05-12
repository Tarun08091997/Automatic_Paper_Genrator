import React from "react";

const QuestionTable = ({ mcqQuestions, subjectiveQuestions }) => {
  console.log(subjectiveQuestions)
  // Function to group questions by a specific key
  const groupBy = (array, key) => {
    return array.reduce((result, currentItem) => {
      const group = currentItem[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(currentItem);
      return result;
    }, {});
  };

  // Sort array by a specific key
  const sortBy = (array, key) => {
    return [...array].sort((a, b) => (a[key] > b[key] ? 1 : -1));
  };

  // Sort MCQs by Unit
  const sortedMCQs = sortBy(mcqQuestions, "Unit");

  // Group Subjective Questions by Unit
  const groupedSubjective = groupBy(subjectiveQuestions, "Unit");

  return (
    <div className="p-4">
      {/* MCQ Questions */}
      <h1 className="text-2xl font-bold mb-4">MCQ Questions</h1>
      <table className="table-auto w-full border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Unit</th>
            <th className="border px-4 py-2">Question</th>
            <th className="border px-4 py-2">Option1</th>
            <th className="border px-4 py-2">Option2</th>
            <th className="border px-4 py-2">Option3</th>
            <th className="border px-4 py-2">Option4</th>
            <th className="border px-4 py-2">Answer</th>
            <th className="border px-4 py-2">CO</th>
            <th className="border px-4 py-2">RBT Level</th>
          </tr>
        </thead>
        <tbody>
          {sortedMCQs.map((q, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{q.Unit}</td>
              <td className="border px-4 py-2">{q.Question}</td>
              <td className="border px-4 py-2">{q.Option1}</td>
              <td className="border px-4 py-2">{q.Option2}</td>
              <td className="border px-4 py-2">{q.Option3}</td>
              <td className="border px-4 py-2">{q.Option4}</td>
              <td className="border px-4 py-2">{q.Answer}</td>
              <td className="border px-4 py-2">{q.CO}</td>
              <td className="border px-4 py-2">{q["RBT Level"]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Subjective Questions */}
      <h1 className="text-2xl font-bold mb-4">Subjective Questions</h1>
      {Object.entries(groupedSubjective).map(([unit, questions]) => {
        const groupedByMarks = groupBy(questions, "Marks");
        return (
          <div key={unit} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Unit {unit}</h2>
            {Object.entries(groupedByMarks).map(([marks, marksQuestions]) => {
              const sortedByLevel = sortBy(marksQuestions, "Level");
              return (
                <div key={marks} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Marks: {marks}</h3>
                  <table className="table-auto w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border px-4 py-2">Question</th>
                        <th className="border px-4 py-2">Unit</th>
                        <th className="border px-4 py-2">RBT</th>
                        <th className="border px-4 py-2">CO</th>
                        <th className="border px-4 py-2">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedByLevel.map((q, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">{q.Question}</td>
                          <td className="border px-4 py-2">{q.Unit}</td>
                          <td className="border px-4 py-2">{q.RBT}</td>
                          <td className="border px-4 py-2">{q.CO}</td>
                          <td className="border px-4 py-2">{q.Level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default QuestionTable;
