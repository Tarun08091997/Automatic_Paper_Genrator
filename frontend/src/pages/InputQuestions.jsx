import React, { useState } from "react";
import UploadFile from "./UploadFile"; // Assuming UploadFile is in the same directory
import QuestionTable from "./QuestionTable"; // Assuming QuestionTable is in the same directory
import QuestionAnalytics from "./QuestionAnalytics";
import CreatePaper from "./CreatePaper";

const InputQuestions = () => {
  const [data, setData] = useState({
    schoolName: "",
    department: "",
    programme: "",
    specialization: "",
    semester: "",
    subject: "",
    subjectCode: "",
  });

  const [mcqCSV, setMcqCSV] = useState(null);
  const [subCSV, setSubCSV] = useState(null);
  const [showTables, setShowTables] = useState(false);
  const [createPaperVisible,setCreatePaperVisible] = useState(false);

  const handleInputChange = (name, value) => {
    setData({ ...data, [name]: value });
  };

  const resetData = () => {
    setData({
      schoolName: "",
      department: "",
      programme: "",
      specialization: "",
      semester: "",
      subject: "",
      subjectCode: "",
    });
    setMcqCSV(null);
    setSubCSV(null);
    setShowTables(false);
    setCreatePaperVisible(false);
  };

  const handleMCQ = (mcqData) => {
    setMcqCSV(mcqData);
  };

  const handleSubjective = (subData) => {
    setSubCSV(subData);
  };

  const isSubmitDisabled = Object.values(data).some((value) => value === "");

  const submitData = () => {
    console.log("Submitted Data:", data);
    console.log("MCQ Data:", mcqCSV[1].Question);
    console.log("Subjective Data:", subCSV);
    // Show the tables upon successful submission
    setShowTables(true);
  };
  
  if(createPaperVisible){
    return(
      <CreatePaper setVisible={setCreatePaperVisible} data = {data} mcqs={mcqCSV} subjectives={subCSV}/>
    )
  }
  else{
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center space-y-2">
      {/* Part 1: Inputs */}
      <div className="bg-white p-4 rounded shadow-md w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-6">Input Details</h2>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "School Name", name: "schoolName", options: ["School A", "School B", "School C"] },
            { label: "Department", name: "department", options: ["CSE", "ECE", "ME"] },
            { label: "Programme", name: "programme", options: ["B.Tech", "M.Tech", "MBA"] },
            { label: "Specialization", name: "specialization", options: ["AI", "IoT", "Robotics"] },
            { label: "Semester", name: "semester", options: ["1", "2", "3", "4"] },
          ].map(({ label, name, options }) => (
            <div key={name}>
              <label className="block font-medium mb-1">{label}</label>
              <select
                value={data[name]}
                onChange={(e) => handleInputChange(name, e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none"
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {[
            { label: "Subject", name: "subject" },
            { label: "Subject Code", name: "subjectCode" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block font-medium mb-1">{label}</label>
              <input
                type="text"
                value={data[name]}
                onChange={(e) => handleInputChange(name, e.target.value)}
                placeholder={`Enter ${label}`}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: UploadFile Component */}
      <div className="bg-white p-4 rounded shadow-md w-full max-w-4xl flex items-center">
        <div>
          <h2 className="text-xl font-bold mb-3">Upload Objective Questions</h2>
          <UploadFile handleFile={handleMCQ} />
        </div>
        {mcqCSV && (
          <span className="text-green-500 text-xl font-bold">&#10003;</span>
        )}
      </div>

      {/* Part 3: UploadFile Component */}
      <div className="bg-white p-4 rounded shadow-md w-full max-w-4xl flex items-center">
        <div>
          <h2 className="text-xl font-bold mb-3">Upload Subjective Questions</h2>
          <UploadFile handleFile={handleSubjective} />
        </div>
        {subCSV && (
          <span className="text-green-500 text-xl font-bold">&#10003;</span>
        )}
      </div>

      {/* Part 4: Buttons */}
      <div className="w-full max-w-4xl flex justify-between">
        <button
          onClick={resetData}
          className="bg-red-500 text-white px-6 py-3 rounded shadow hover:bg-red-600"
        >
          Cancel
        </button>
        <button
          onClick={submitData}
          disabled={isSubmitDisabled || !subCSV || !mcqCSV}
          className={`px-6 py-3 rounded shadow ${
            isSubmitDisabled || !subCSV || !mcqCSV
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Submit
        </button>
      </div>

      {/* Part 5: Question Tables */}
      {showTables && (
        <div className="w-full max-w-6xl mt-6">
          <h2 className="text-2xl font-bold mb-4">Question Tables</h2>
          <QuestionTable
            mcqQuestions={mcqCSV}
            subjectiveQuestions={subCSV}
          />
          <QuestionAnalytics 
            mcqQuestions={mcqCSV}
            subjectiveQuestions={subCSV}
         />
         <div className="flex justify-between">
            <button
              onClick={resetData}
              className="bg-red-500 text-white px-6 py-3 rounded shadow hover:bg-red-600"
            >
              Cancel
            </button>
            
            <button
              onClick={()=>setCreatePaperVisible(true)}
              className={"px-6 py-3 rounded shadow bg-blue-500 text-white hover:bg-blue-600"}
            >
              Create Paper
            </button>
         </div>
         
        </div>
      )}

        
    </div>
  );}
};

export default InputQuestions;
