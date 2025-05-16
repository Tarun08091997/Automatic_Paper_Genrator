import React, { useState } from 'react'
import SelectRequiredFiles from "./SelectRequiredFiles";
import CreatePaperPage from "./CreatePaperPage"

export default function AnalysisORPaper({ setList, list, setViewFileSelector ,examData}) {
    const [selectedSubjects , setSelectedSubjects] = useState([]);
    const [showPaper , setShowPaper] = useState(false);
    const [hideForPrint,setHideforPrint] = useState(false);
    
    const getFilesofSelectedSubjects=()=>{
        return list.filter((file)=> selectedSubjects.includes(file.subject));
    }
    
  return (
    <div className='flex flex-col'>
        {
            !showPaper ? (
                <SelectRequiredFiles
                    subjectList = {selectedSubjects}
                    setSubjectList = {setSelectedSubjects}
                    list={list}
                />
            ) : (
                <CreatePaperPage fileList = {getFilesofSelectedSubjects()}  examData = {examData} setHideforPrint = {setHideforPrint}/>
            )
        }

        {/* Back and Submit Buttons */}
        {!hideForPrint && <div className="mt-6 flex space-x-4 self-center">
          <button
            onClick={() => {
              setViewFileSelector(true);
              setList([]);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Back
          </button>

          <button
            onClick={() => {
              setShowPaper(false)
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Select Subjects
          </button>
        
          <button
            onClick={() => setShowPaper(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>}
    </div>
  )
}
