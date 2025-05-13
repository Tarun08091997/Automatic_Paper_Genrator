import { useState } from "react";

import { parseFile } from "./fileParser";
import ExamData from "./ExamData";
import AnalysisORPaper from "./AnalysisORPaper";

const processFiles = async (filteredFiles) => {
  const failedFiles = []; // Track names of failed files

  try {
    const fileData = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const data = await parseFile(file);
          return data;
        } catch (err) {
          console.error(`Error parsing file ${file.name}:`, err);
          failedFiles.push(file.name); // Add to failed list
          return null;
        }
      })
    );

    const validFileData = fileData.filter((data) => data !== null);

    // Show alert with failed file names, if any
    if (failedFiles.length > 0) {
      alert(
        `Some files could not be processed:\n\n${failedFiles.join("\n")}`
      );
    }

    console.log("Uploaded File Filtered Data:", validFileData);
    return validFileData;
  } catch (err) {
    console.error("Error processing files:", err);
    throw err;
  }
};


function FileSelector() {
  const [fileList, setFileList] = useState([]);
  const [viewFileSelector, setViewFileSelector] = useState(true);
  const [examData , setExamData] = useState([]);
  const [dataGiven , setDataGiven] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    // Filter only Excel and CSV files
    const filteredFiles = files.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return ["xls", "xlsx", "csv"].includes(ext);
    });

    processFiles(filteredFiles)
      .then((data) => {
        setFileList(data);
      })
      .catch((err) => {
        console.error("Failed to process files:", err);
      });

    if(filteredFiles.length > 0){
      setViewFileSelector(false)
    }
    else{
      setViewFileSelector(true);
      alert("No Files Found")
    }
  };

  if (viewFileSelector === true) {
    return (
      <div className="flex flex-col items-center  justify-start h-screen bg-gray-100">
        <ExamData setExamData={setExamData} setDataGiven={setDataGiven} />
        <div className="p-6 bg-white rounded-lg shadow-md">
          {/* File Input */}
          <input
            type="file"
            // webkitdirectory="true"
            multiple
            onChange={handleFileChange}
            className="mb-4"
            disabled={!dataGiven}
          />
          <h3 className="text-lg font-semibold text-gray-700">
            Total Excel/CSV Files: {fileList.length}
          </h3>
        </div>
      </div>
    );
  } else {
    return (
      <AnalysisORPaper
        setList={setFileList}
        list={fileList}
        setViewFileSelector={setViewFileSelector}
        examData={examData}
      />
      
    );
  }
}

export default FileSelector;