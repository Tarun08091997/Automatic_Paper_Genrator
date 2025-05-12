import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/CT_University_logo.png";
import "./createPaperCard.css";
import DistributionCharts from "./DistributionCharts";
import { SelectQuestions } from "./selectQuestion";
import "./CreatePaperPage.css"
import {generateExamDocx} from "./PrintDocxFile"


const CreatePaperCard = ({ mcqs, subjective, examData, data , setPaperData, show , styles}) => {
  const paperRef = useRef(null);
  const [questionSelector, setQuestionSelector] = useState({ results: null });
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [sectionMap, setSectionMap] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const sectionLetters = ["A", "B", "C", "D", "E", "F"];
  const [instructions, setInstructions] = useState({
    TopInstruction: [],
    SectionInstruction: []
  });


  useEffect(() => {
    const initialSelectedQuestions = {};
    const newSectionMap = {};

    const marks = Object.keys(examData.sections || {}).sort((a, b) => parseInt(a) - parseInt(b));

    marks.forEach((mark) => {
      initialSelectedQuestions[mark] = [];
      const index = marks.indexOf(mark);
      if (index < sectionLetters.length) {
        newSectionMap[mark] = sectionLetters[index];
      }
    });

    setSelectedQuestions(initialSelectedQuestions);
    setSectionMap(newSectionMap);
  }, [examData.sections]);


  useEffect(() => {
    if (mcqs && subjective && examData.sections) {
      setIsGenerating(true);
      setError(null);

      try {
        const selector = new SelectQuestions(mcqs, subjective, examData);
        const results = selector.getSelectedQuestions();

        setQuestionSelector({
          instance: selector,
          results: results,
        });

        setSelectedQuestions(results.selectedQuestions);
      } catch (err) {
        setError("Failed to generate paper. Please try again.");
        console.error("Question generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    }
  }, [refreshCount]);

  useEffect(()=>{
    setPaperData({
      examData, data, selectedQuestions, questionSelector, instructions
    })
  },[selectedQuestions,instructions])


  // useEffect(() => {
  //   if (printCount > 0 && paperRef.current) {
  //     printAsPDF(paperRef.current.innerHTML, data.subject);
  //   }
  // }, [printCount]);

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
  };

  const renderQuestionRow = (question, index) => (
    <tr key={index} className="border" style={styles.questionRow}>
      <td className="border px-2 py-1 text-center">{index + 1}</td>
      <td className="border px-2 py-1">{question.Question}</td>
      {question.Options && (
        <td className="border px-2 py-1">{question.Options.join(", ")}</td>
      )}
      <td className="border px-2 py-1">{question.CO}</td>
      <td className="border px-2 py-1">{question.RBT}</td>
    </tr>
  );

  useEffect(() => {
    if (!examData.sections) return;
  
    const generatedInstructions = Object.keys(examData.sections)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((mark, index) => {
        const section = sectionMap[mark];
        const sectionData = examData.sections[mark];
        if (!section || !sectionData) return null;
  
        const isCompulsory = sectionData.inputQuestions === sectionData.reqQuestions;
        return isCompulsory
          ? `${index + 2}. In Sec-${section} each question carries ${mark} mark(s), attempt all questions, and answer in minimum ${sectionData.reqWords} words.`
          : `${index + 2}. In Sec-${section} each question carries ${mark} mark(s), attempt any ${sectionData.reqQuestions} out of ${sectionData.inputQuestions} questions, and answer in minimum ${sectionData.reqWords} words.`;
      })
      .filter(Boolean);
  
    // Add the last instruction at the end
    const finalInstruction = `${generatedInstructions.length + 2}. Word Limit is not applicable for Numerical/Graph-based questions.`;
    generatedInstructions.push(finalInstruction);

    generatedInstructions.unshift("1. Write your registration no./seat no. on the top immediately on receipt of this question paper.")
  
    setInstructions(prev => ({
      ...prev,
      TopInstruction: generatedInstructions
    }));
  }, [examData.sections, sectionMap]);

  const renderInstructions = () => {
    return instructions.TopInstruction.map((instruction, index) => (
      <tr key={index}>
        <td colSpan="4" className="border px-2 py-1" style={styles.instructions}>
          {instruction}
        </td>
      </tr>
    ));
  };

  useEffect(() => {
    if (!examData.sections) return;
  
    const sectionInstructions = Object.keys(examData.sections)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((mark) => {
        const section = sectionMap[mark];
        const sectionData = examData.sections[mark];
        if (!section || !sectionData || sectionData.inputQuestions <= 0) return null;
  
        const isCompulsory = sectionData.inputQuestions === sectionData.reqQuestions;
        return isCompulsory
          ? `Section ${section} is compulsory. Attempt all questions. (Answer Limit: ${sectionData.reqWords} words)`
          : `Section ${section}: Do any ${sectionData.reqQuestions} of ${sectionData.inputQuestions} questions. (Answer Limit: ${sectionData.reqWords} words)`;
      })
      .filter(Boolean); // remove nulls
  
    setInstructions(prev => ({
      ...prev,
      SectionInstruction: sectionInstructions
    }));
  }, [examData.sections, sectionMap]);
  

  const renderQuestionSection = (mark, index) => {
    const section = sectionMap[mark];
    const sectionData = examData.sections?.[mark];
    const questions = selectedQuestions[mark] || [];
  
    if (!section || !sectionData || sectionData.inputQuestions <= 0) return null;
  
    const totalMarks = sectionData.reqQuestions * parseInt(mark);
    const sectionInstruction = instructions.SectionInstruction[index];
  
    return (
      <React.Fragment key={mark}>
        <h3 style={styles.sectionHeading}>Section {section}</h3>
        <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
          <tbody>
            <tr className="bg-gray-100">
              <td colSpan="3" className="border px-2 py-1" style={styles.sectionInstruction}>
                {sectionInstruction}
              </td>
              <td className="border px-2 py-1 text-center font-semibold">
                ({mark}×{sectionData.reqQuestions} = {totalMarks})
              </td>
            </tr>
            <tr>
              <th className="border px-2 py-1" style={styles.questionHeading}>Q.No.</th>
              <th className="border px-2 py-1" style={styles.questionHeading}>Question</th>
              <th className="border px-2 py-1" style={styles.questionHeading}>CO</th>
              <th className="border px-2 py-1" style={styles.questionHeading}>RBT Level</th>
            </tr>
            {questions.map(renderQuestionRow)}
          </tbody>
        </table>
      </React.Fragment>
    );
  };


  const renderQuestionPaper = () => {
    return(
      <div ref={paperRef} className={show ? "p-4 mx-auto bg-white font-normal border border-gray-300" : "p-4 mx-auto bg-white font-normal"}>
        <div className="text-center my-5" style={styles.questionRow}>
          <div className="flex justify-between">
          <p>Registration No. .............</p>
          <p>Exam Seat No. .............</p>
          <p>Q.P Set .....</p>
          </div>
          <img src={logo} alt="University Logo" className="mx-auto w-32 mt-4" />
          <div className="flex justify-center space-x-2">
            <h1 className="text-2xl font-bold uppercase mt-2" style={styles.examName}>
              {examData.examinationType}
            </h1>
            <h3 className="text-2xl font-bold mt-2" style={styles.examName}>{`${examData.month} , ${examData.year}`}</h3>
          </div>
        </div>


          {/* Exam Info Table */}
        <table className="w-full border-collapse border border-gray-300 my-4">
          <tbody>
            <tr>
              <td colSpan="2" className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>School Name:</td>
              <td colSpan="2" className="border font-semibold px-2 py-1 text-center">
                {examData.school}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>Program</td>
              <td className="border px-2 py-1 text-center font-semibold" style={styles.schoolInfoValue}>{data.program}</td>
              <td className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>Semester</td>
              <td className="border px-2 py-1 text-center font-semibold" style={styles.schoolInfoValue}>{data.semester}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>Subject Code</td>
              <td className="border px-2 py-1 text-center font-semibold" style={styles.schoolInfoValue}>{data.subjectCode}</td>
              <td className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>Subject Name</td>
              <td className="border px-2 py-1 text-center font-semibold" style={styles.schoolInfoValue}>{data.subject}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>Max Marks</td>
              <td className="border px-2 py-1 text-center font-semibold" style={styles.schoolInfoValue}>60</td>
              <td className="border px-2 py-1 text-center" style={styles.schoolInfoKey}>Duration</td>
              <td className="border px-2 py-1 text-center font-semibold" style={styles.schoolInfoValue}>
                {examData.duration}
              </td>
            </tr>
          </tbody>
        </table>

          {/* Instructions */}
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr>
              <th colSpan="4" className="border px-2 py-1 text-left font-bold bg-gray-100">
                Instructions
              </th>
            </tr>
          </thead>
          <tbody>
            {renderInstructions()}
          </tbody>
        </table>

        {Object.keys(sectionMap).map(renderQuestionSection)}

      </div>
    )
  }

  return (
    <div className={show ? "p-4 rounded-lg bg-white border" : "p-4 rounded-lg bg-white"}>
      {show && <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-800">{data.subject}</h4>
        <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors text-sm px-3 py-1 mt-2 mb-2"
          title="Generate new question paper with same parameters"
        >
          {isGenerating ? "Generating..." : "↻ Regenerate Paper"}
        </button>
      </div>}

      {show && error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {renderQuestionPaper()}
      
      {show && <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors text-sm px-3 py-1 mt-2 mb-2"
          title="Generate new question paper with same parameters"
        >
          {isGenerating ? "Generating..." : "↻ Regenerate Paper"}
        </button>}

        {/* Distribution Charts */}
        {show && questionSelector.results && (
          <div className="mt-6">
            <DistributionCharts 
              unitDistribution={questionSelector.results.unitDistribution}
              difficultyDistribution={questionSelector.results.difficultyDistribution}
            />
        </div>
      )}

      
      {
        show && <button
        onClick={() => generateExamDocx(examData, data, selectedQuestions, questionSelector, instructions)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
      >
        Print to DOCX
      </button>
      }
      
      
    </div>
  );
};

export default CreatePaperCard;



{/* {show && (
        <div className="flex justify-between mb-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors text-sm px-3 py-1 mt-2 mb-2" onClick={saveToExcel}>
          Save to Excel
        </button>
      </div>
      )} */}


// const saveToExcel = () => {
  //   const sheetData = [];
  
  //   // Add Exam Data (two-column format)
  //   sheetData.push(["Exam Data"]);
  //   sheetData.push(["Field", "Value"]);
  //   sheetData.push(["Examination Type", examData.examinationType]);
  //   sheetData.push(["Month", examData.month]);
  //   sheetData.push(["Year", examData.year]);
  //   sheetData.push(["Duration", examData.duration]);
  //   sheetData.push(["Total Units", examData.units]);
  //   sheetData.push(["Included Units", JSON.stringify(examData.includedUnits)]);
  //   sheetData.push(["School", examData.school]);
  //   sheetData.push(["Program", data.program]);
  //   sheetData.push(["Semester", data.semester]);
  //   sheetData.push(["Subject", data.subject]);
  //   sheetData.push(["Subject Code", data.subjectCode]);
  
  //   // Add Difficulty Level Distribution
  //   sheetData.push([]);
  //   sheetData.push(["Difficulty Level Distribution"]);
  //   sheetData.push(["Difficulty Level", "Marks"]);
  //   Object.entries(examData.difficultyLevel).forEach(([level, marks]) => {
  //     sheetData.push([level, marks]);
  //   });
  
  //   // Add a separator row
  //   sheetData.push([]);
  //   sheetData.push(["Selected Questions"]);
  //   sheetData.push(["Difficulty Level", "Question", "Marks", "Unit", "CO", "Level"]);
    
  //   // Add selected questions with their details
  //   Object.keys(selectedQuestions).forEach(difficultyLevel => {
  //     selectedQuestions[difficultyLevel].forEach(question => {
  //       sheetData.push([
  //         difficultyLevel,
  //         question.Question,
  //         question.Marks,
  //         question.Unit,
  //         question.CO,
  //         question.Level
  //       ]);
  //     });
  //   });
  
  //   // Add another separator row
  //   sheetData.push([]);
  //   sheetData.push(["Difficulty Wise Marks Distribution"]);
  //   sheetData.push(["Difficulty Level", "Marks"]);
  //   Object.entries(questionSelector.instance.FinalDifficultyWiseMarkDistribution).forEach(([difficulty, marks]) => {
  //     sheetData.push([difficulty, marks]);
  //   });
  
  //   // Add another separator row
  //   sheetData.push([]);
  //   sheetData.push(["Unit Wise Marks Distribution"]);
  //   sheetData.push(["Unit", "Marks"]);
  //   Object.entries(questionSelector.instance.FinalUnitWiseMarkDistribution).forEach(([unit, marks]) => {
  //     sheetData.push([unit, marks]);
  //   });
  
  //   // Convert sheetData to worksheet
  //   const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  //   // Create a workbook and append the single sheet
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Exam Data");
  
  //   // Generate the Excel file
  //   const filename = `${data.subject}-${data.subjectCode}.xlsx`;
  //   const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
  //   // Trigger the download
  //   saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
  // };