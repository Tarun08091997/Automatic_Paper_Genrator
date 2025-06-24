import React, { useEffect, useRef, useState } from "react";
import CreatePaperCard from "./CreatePaperCard";
import "./CreatePaperPage.css";
import { generateExamDocx } from "./PrintDocxFile";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import SimilarityMatrix from "./SimilarityMatrix";
import { dateTimeValue } from "docx";

export default function CreatePaperPage({ fileList, examData, setHideforPrint }) {
  
  const [visibleIndex, setVisibleIndex] = useState(null);
  const containerRefs = useRef([]);    // To get which paper in view
  const [pData,setPData] = useState([]);    // To collect all the data


  useEffect(() => {
    containerRefs.current = containerRefs.current.slice(0, fileList.length);
  }, [fileList.length]);

  
  useEffect(() => {
    const newData = [];
    for (let i = 0; i < fileList.length; i++) {
      const a = [];
      for(let j=0;j<examData.sets;j++){
        a.push({})
      }
      newData.push(a);
    }
    setPData(newData);
  }, [fileList, examData.sets]);

  const setPaperData = (index, data, set) => {
    const d = [...pData];
  if (!d[index]) {
    d[index] = [];
  }

  d[index][set - 1] = data;

  setPData(d);
};



useEffect(() => {
  const handleScroll = () => {
    let maxVisibleHeight = 0;
    let visibleIdx = 0;

    containerRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(visibleBottom - visibleTop, 0);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        visibleIdx = index;
      }
    });

    setVisibleIndex(visibleIdx);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Trigger once on load
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);



  const createZipFile = async () => {
    const zip = new JSZip();

    for (const paper of pData) {
      const { examData, data, selectedQuestions, instructions, setNo } = paper;


      try {
        const result = await generateExamDocx(
          examData,
          data,
          selectedQuestions,
          instructions,
          false,
          setNo
        );

        zip.file(result.filename, result.blob);
      } catch (error) {
        console.error("Error generating DOCX for", data?.subject, error);
      }
    }

    const current = new Date();
    const date = `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`;
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Paper Created on ${date}.zip`);
  };

  return (
    <div className={`flex flex-col items-center justify-center flex-1 bg-gray-100`}>
      <div className={`w-full max-w-4xl bg-white rounded-lg p-6 shadow-md`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Subjects: {fileList.length}
            </h3>
        </div>



        {fileList.map((file, index) => (
          <div
            key={index}
            ref={(el) => (containerRefs.current[index] = el)}
            id={`paper-${index}`}
            className="paper-container p-4"
          >
            {Array.from({ length: examData.sets }, (_, i) => i + 1).map((set) => (
              <CreatePaperCard
                key={index * examData.sets + set}
                mcqs={[]} // If MCQs exist, pass them
                subjective={file.questions}
                examData={examData}
                data={{
                  program: file.program,
                  semester: file.semester,
                  subject: file.subject,
                  subjectCode: file.code,
                  COS : file.COS
                }}
                setPaperData={(data) => setPaperData(index, data, set)}
                show={true}
                setNo={set}
              />
            ))}
          </div>
        ))}
      </div>

      <SimilarityMatrix data = {pData} visibleIndex = {visibleIndex} sets = {examData.sets}/>

      <button
        onClick={createZipFile}
        className="fixed left-5 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition"
      >
        Download All
      </button>
    </div>
  );
}
