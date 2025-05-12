import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelReader = () => {
  const [files, setFiles] = useState([]);
  const [examData, setExamData] = useState(null);
  const [data, setData] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (fileList) => {
    setFiles([...files, ...fileList]); // Store file names

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        
        // Process the CSV content into structured objects
        parseCSV(csvData);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSV = (csvString) => {
    const rows = csvString.split("\n").map((row) => row.split(","));

    let tempExamData = {};
    let tempData = {};
    let tempSelectedQuestions = [];
    let section = "";

    rows.forEach((row) => {
      const [field, value, extra] = row.map((item) => item.trim());

      if (!field) return;

      // Detect Section Headings
      if (field.includes("Exam Data")) section = "examData";
      else if (field.includes("Selected Questions")) section = "selectedQuestions";
      else if (field.includes("Difficulty Level Distribution")) section = "difficultyLevel";
      else if (field.includes("Unit Wise Marks Distribution")) section = "unitWiseMarks";

      // Process Exam Data
      if (section === "examData" && field !== "Exam Data") {
        if (field === "Included Units") {
            try {
              tempExamData[field] = JSON.parse(value);  // ✅ Try parsing JSON
            } catch (error) {
              tempExamData[field] = value.split(",").map((num) => num.trim());  // ✅ Fallback: Convert to array manually
            }
          }
      }

      // Process Selected Questions
      if (section === "selectedQuestions" && field !== "Selected Questions" && field !== "Difficulty Level") {
        if (value && extra) {
          tempSelectedQuestions.push({
            difficultyLevel: field,
            question: value,
            marks: extra,
          });
        }
      }

      // Process Other Sections
      if (section === "difficultyLevel" && field !== "Difficulty Level Distribution" && value) {
        tempExamData.difficultyLevel = tempExamData.difficultyLevel || {};
        tempExamData.difficultyLevel[field] = parseInt(value);
      }

      if (section === "unitWiseMarks" && field !== "Unit Wise Marks Distribution" && value) {
        tempExamData.unitWiseMarks = tempExamData.unitWiseMarks || {};
        tempExamData.unitWiseMarks[field] = parseInt(value);
      }
    });

    // Assign extracted exam data
    tempData = {
      program: tempExamData["Program"],
      semester: tempExamData["Semester"],
      subject: tempExamData["Subject"],
      subjectCode: tempExamData["Subject Code"],
    };
    // Store in state
    setExamData(tempExamData);
    setData(tempData);
    setSelectedQuestions(tempSelectedQuestions);
    // console.log(tempData , tempExamData , tempSelectedQuestions);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="p-6 border-2 border-dashed rounded-lg text-center bg-gray-100 w-96 mx-auto shadow-lg"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept=".xlsx, .xls"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Upload Excel Files
        </label>
        <p className="mt-2 text-gray-600">or drag & drop files here</p>

        {files.length > 0 && (
          <div className="mt-4 text-left">
            <p className="font-bold text-gray-800">Uploaded Files:</p>
            <ul className="list-disc pl-6 text-gray-700">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Display Extracted Data */}
        {examData && (
          <div className="mt-6 text-left">
            <h3 className="text-lg font-bold">Exam Data</h3>
            <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(examData, null, 2)}</pre>

            <h3 className="text-lg font-bold mt-4">Selected Questions</h3>
            <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(selectedQuestions, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelReader;
