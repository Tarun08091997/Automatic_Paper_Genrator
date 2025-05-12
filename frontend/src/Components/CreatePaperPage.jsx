import React, { useEffect, useRef, useState } from "react";
import CreatePaperCard from "./CreatePaperCard";
import "./CreatePaperPage.css";
import {generateExamDocx} from "./PrintDocxFile"
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function CreatePaperPage({ fileList, examData, setHideforPrint }) {
  const [show, setShow] = useState(true);
  const [styles, setStyles] = useState({
    instructions: {
      fontSize: "14px",
      fontStyle: "italic",
      marginBottom: "10px",
      fontFamily: "'Verdana', sans-serif",
    },
    examName: {
      fontSize: "14px",
      fontWeight: "bold",
      fontFamily: "'Arial', sans-serif",
    },
    schoolInfoKey: {
      fontSize: "14px",
      // textDecoration: "underline",
      fontFamily: "'Courier New', monospace",
    },
    schoolInfoValue: {
      fontSize: "14px",
      fontWeight: "bold",
      fontFamily: "'Courier New', monospace",
    },
    sectionHeading: {
      fontSize: "18px",
      fontWeight: "bold",
      marginTop: "20px",
      marginBottom: "10px",
      textAlign: "center",
      fontFamily: "'Georgia', serif",
    },
    sectionInstruction: {
      fontSize: "14px",
      fontStyle: "italic",
      marginBottom: "10px",
      fontFamily: "'Verdana', sans-serif",
    },
    questionHeading: {
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "10px",
      fontFamily: "'Tahoma', sans-serif",
    },
    questionRow: {
      fontSize: "14px",
      fontFamily: "'Lucida Console', monospace",
    },
  });

  const paperData = useRef();
  paperData.current = [];
  fileList.map((val) => paperData.current.push({}));
  const setPaperData = (index,data)=>{
    // create an array and update it for data
    paperData.current[index] = data;
    console.log(paperData.current);
    
  }

  const createZipFile = async () => {
    const zip = new JSZip();
    for (const paper of paperData.current) {
      const { examData, data, selectedQuestions, questionSelector, instructions } = paper;
  
      try {
        const result = await generateExamDocx(
          examData,
          data,
          selectedQuestions,
          questionSelector,
          instructions,
          false // to return blob, not save immediately
        );
  
        zip.file(result.filename, result.blob);
      } catch (error) {
        console.error("Error generating DOCX for", data?.subject, error);
      }
    }
    const current = new Date();
    const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Paper Created on ${date}.zip`);
  };

  return (
    <div className={`flex flex-col items-center justify-center flex-1 ${!show ? "hidden-print" : " bg-gray-100"}`}>
      <div className={`w-full max-w-4xl bg-white rounded-lg  ${!show ? "hidden-print" : "p-6 shadow-md"}`}>
        {/* Total Subjects count and Print All Papers button on the same line */}
        {show && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Subjects: {fileList.length}
            </h3>
          </div>
        )}

        {fileList.map((file, index) => (
          
          <div key={index} id={`paper-${index}`} className="paper-container p-4">
            <CreatePaperCard
              mcqs={[]} // If MCQs exist, pass them
              subjective={file.questions}
              examData={examData}
              data={{
                program: file.program,
                semester: file.semester,
                subject: file.subject,
                subjectCode: file.code,
              }}
              setPaperData = {(data)=>setPaperData(index,data)}
              show={show} // Pass `show` prop to control visibility inside `CreatePaperCard`
              styles = {styles}
            />
          </div>
        ))}
      </div>



      {/* Floating button for printing each paper individually */}
      <button
        onClick={createZipFile}
          className="fixed left-5 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition"
        >
          Download All
        </button>
    </div>
  );
}
