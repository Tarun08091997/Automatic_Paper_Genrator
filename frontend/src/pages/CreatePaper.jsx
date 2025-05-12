import React, { useState, useEffect } from "react";
import ExamQuestionTable from "./ExamQuestionTable";

const CreatePaper = ({ setVisible, data, mcqs, subjectives }) => {
  const [examData, setExamData] = useState({
    examinationType: "",
    month: "",
    year: "",
    duration: "",
    units: 3,
    mcqQuestions: 0,
    oneMarkQuestions: 0,
    twoMarksQuestions: 5,
    fiveMarksQuestions: 2,
    tenMarksQuestions: 2,
  });

  const [viewExamTable,setViewExamTable] = useState(false);

  const resetData = () =>{
    setExamData({
      examinationType: "",
      month: "",
      year: "",
      duration: "",
      units: 3,
      mcqQuestions: 0,
      oneMarkQuestions: 0,
      twoMarksQuestions: 5,
      fiveMarksQuestions: 2,
      tenMarksQuestions: 2,
    })
  } 

  useEffect(() => {
    if (examData.examinationType === "MID TERM EXAMINATION") {
      setExamData({
        examinationType: "MID TERM EXAMINATION",
        month: "",
        year: "",
        duration: "1 Hour",
        units: 3,
        mcqQuestions: 0,
        oneMarkQuestions: 0,
        twoMarksQuestions: 5,
        fiveMarksQuestions: 2,
        tenMarksQuestions: 2,
      });
    } else if (examData.examinationType === "END TERM EXAMINATION") {
      setExamData({
        examinationType: "END TERM EXAMINATION",
        month: "",
        year: "",
        duration: "3 Hours",
        units: 6,
        mcqQuestions: 0,
        oneMarkQuestions: 10,
        twoMarksQuestions: 5,
        fiveMarksQuestions: 5,
        tenMarksQuestions: 3,
      });
    }
  }, [examData.examinationType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExamData({ ...examData, [name]: value });
  };
  const handleNumChange=(e) =>{
    const {name , value} = e.target;
    setExamData({...examData , [name]:parseFloat(value)});
  }

  const calculateTotalMarks = () => {
    const mcqMarks = (examData.mcqQuestions || 0) * 1;
    const oneMark = (examData.oneMarkQuestions || 0) * 1;
    const twoMarks = (examData.twoMarksQuestions || 0) * 2;
    const fiveMarks = (examData.fiveMarksQuestions || 0) * 5;
    const tenMarks = (examData.tenMarksQuestions || 0) * 10;
    return mcqMarks + oneMark + twoMarks + fiveMarks + tenMarks;
  };

  if(viewExamTable){
    return(
      <ExamQuestionTable setView={setViewExamTable} mcqs={mcqs} subjective = {subjectives} examData = {examData} data = {data}/>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* General Exam Details Section */}
      <div className="border border-gray-300 rounded-md bg-gray-50 p-4">
        <h2 className="text-lg font-bold mb-4">Exam Details</h2>
        <div className="flex flex-row gap-4 items-center">
          {/* Examination Type Select */}
          <select
            name="examinationType"
            value={examData.examinationType}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 w-1/4"
          >
            <option value="" disabled>
              Select Examination Type
            </option>
            <option value="END TERM EXAMINATION">END TERM EXAMINATION</option>
            <option value="MID TERM EXAMINATION">MID TERM EXAMINATION</option>
          </select>

          {/* Month Select */}
          <select
            name="month"
            value={examData.month}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 w-1/4"
          >
            <option value="" disabled>
              Select Month
            </option>
            {[
              "JANUARY",
              "FEBRUARY",
              "MARCH",
              "APRIL",
              "MAY",
              "JUNE",
              "JULY",
              "AUGUST",
              "SEPTEMBER",
              "OCTOBER",
              "NOVEMBER",
              "DECEMBER",
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {/* Year Input */}
          <input
            type="number"
            name="year"
            value={examData.year}
            onChange={handleChange}
            placeholder="Enter Year"
            className="border border-gray-300 rounded-md p-2 w-1/4"
          />

          {/* Duration Select */}
          <select
            name="duration"
            value={examData.duration}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 w-1/4"
          >
            <option value="" disabled>
              Select Duration
            </option>
            {["30 Minutes", "2 Hours", "3 Hours", "2.5 Hours"].map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions and Units Section */}
      <div className="border border-gray-300 rounded-md bg-gray-50 p-4">
        <h2 className="text-lg font-bold mb-4">Questions and Units</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Type</th>
              <th className="border border-gray-300 p-2">Available</th>
              <th className="border border-gray-300 p-2">Input</th>
              <th className="border border-gray-300 p-2">Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {/* Units Row */}
            <tr>
              <td className="border border-gray-300 p-2">Number of Units</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  name="units"
                  value={examData.units}
                  onChange={handleNumChange}
                  placeholder="Enter units"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </td>
              <td className="border border-gray-300 p-2">-</td>
            </tr>

            {/* Questions Rows */}
            {[
              { label: "MCQ Questions", weight: 1, name: "mcqQuestions" },
              { label: "1 Mark Questions", weight: 1, name: "oneMarkQuestions" },
              { label: "2 Marks Questions", weight: 2, name: "twoMarksQuestions" },
              { label: "5 Marks Questions", weight: 5, name: "fiveMarksQuestions" },
              { label: "10 Marks Questions", weight: 10, name: "tenMarksQuestions" },
            ].map(({ label, weight, name }) => (
              <tr key={name}>
                <td className="border border-gray-300 p-2">{label}</td>
                <td className="border border-gray-300 p-2">
                  {name === "mcqQuestions" ? mcqs.length : subjectives.length}
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    name={name}
                    value={examData[name]}
                    onChange={handleNumChange}
                    placeholder={`Enter ${label}`}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  {(examData[name] || 0) * weight}
                </td>
              </tr>
            ))}

            {/* Total Marks Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 p-2" colSpan={3}>
                Total Marks
              </td>
              <td className="border border-gray-300 p-2">{calculateTotalMarks()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
            <button
              onClick={()=>setVisible(false)}
              className="bg-yellow-300 text-white px-6 py-3 rounded shadow hover:bg-yellow-600"
            >
              back
            </button>
            <button
              onClick={resetData}
              className="bg-red-500 text-white px-6 py-3 rounded shadow hover:bg-red-600"
            >
              Cancel
            </button>
            
            <button
              onClick={()=>setViewExamTable(true)}
              className={`px-6 py-3 rounded shadow ${
                examData.month && examData.duration && examData.examinationType && examData.year
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
              disabled = {!(examData.month && examData.duration && examData.examinationType && examData.year)}
            >
              Create Paper
            </button>
      </div>

    </div>
  );
};

export default CreatePaper;
