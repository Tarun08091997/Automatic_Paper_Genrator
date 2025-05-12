import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/CT_University_logo.png";
import "./createPaperCard.css";
import { printAsPDF } from "./fileParser";
import DistributionCharts from "./DistributionCharts";
import { SmartQuestionSelector } from "./smartQuestionSelector";
import { SelectQuestions } from "./selectQuestion";

const CreatePaperCard = ({ mcqs, subjective, examData, data, printCount }) => {
  // Refs and state
  const paperRef = useRef(null);
  const [questionSelector,setQuestionSelector] = useState({ results: null });
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [sectionMap, setSectionMap] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const sectionLetters = ["A", "B", "C", "D", "E", "F"];

  // Initialize section mapping and question structure
  useEffect(() => {
    const initialSelectedQuestions = {};
    const newSectionMap = {};
    
    const marks = Object.keys(examData.sections || {}).sort((a, b) => parseInt(a) - parseInt(b));
    
    marks.forEach(mark => {
      initialSelectedQuestions[mark] = [];
      const index = marks.indexOf(mark);
      if (index < sectionLetters.length) {
        newSectionMap[mark] = sectionLetters[index];
      }
    });

    setSelectedQuestions(initialSelectedQuestions);
    setSectionMap(newSectionMap);
  }, [examData.sections]);

  // Generate questions (re-runs when dependencies or refreshCount changes)
  useEffect(() => {
    if (mcqs && subjective && examData.sections) {
      setIsGenerating(true);
      setError(null);
      
      try {
        const selector = new SelectQuestions(mcqs, subjective, examData);
        const results = selector.getSelectedQuestions();
        
        setQuestionSelector({
          instance: selector,
          results: results
        });
        
        setSelectedQuestions(results.selectedQuestions);
        console.log(results.selectedQuestions[1][0]);
      } catch (err) {
        setError('Failed to generate paper. Please try again.');
        console.error("Question generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    }
  }, [mcqs, subjective, examData, refreshCount]);

  // Handle PDF printing
  useEffect(() => {
    if (printCount > 0 && paperRef.current) {
      printAsPDF(paperRef.current.innerHTML, data.subject);
    }
  }, [printCount]);

  // Refresh question paper
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  // Render a single question row
  const renderQuestionRow = (question, index) => (
    <tr key={index} className="border">
      <td className="border px-2 py-1 text-center">{index + 1}</td>
      <td className="border px-2 py-1">{question.Question}</td>
      {question.Options && (
        <td className="border px-2 py-1">{question.Options.join(", ")}</td>
      )}
      <td className="border px-2 py-1">{question.CO}</td>
      <td className="border px-2 py-1">{question.RBT}</td>
    </tr>
  );

  // Render exam instructions
  const renderInstructions = () => {
    if (!examData.sections) return null;

    return Object.keys(examData.sections)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((mark, index) => {
        const section = sectionMap[mark];
        const sectionData = examData.sections[mark];
        if (!section || !sectionData) return null;

        const isCompulsory = sectionData.inputQuestions === sectionData.reqQuestions;
        const instruction = isCompulsory
          ? `${index + 2}. In Sec-${section} each question carries ${mark} mark(s), attempt all questions, and answer in minimum ${sectionData.reqWords} words.`
          : `${index + 2}. In Sec-${section} each question carries ${mark} mark(s), attempt any ${sectionData.reqQuestions} out of ${sectionData.inputQuestions} questions, and answer in minimum ${sectionData.reqWords} words.`;

        return (
          <tr key={`${mark}-mark`}>
            <td colSpan="4" className="border px-2 py-1">
              {instruction}
            </td>
          </tr>
        );
      });
  };

  // Render a question section
  const renderQuestionSection = (mark) => {
    const section = sectionMap[mark];
    const sectionData = examData.sections?.[mark];
    const questions = selectedQuestions[mark] || [];
    
    if (!section || !sectionData || sectionData.inputQuestions <= 0) return null;

    const isCompulsory = sectionData.inputQuestions === sectionData.reqQuestions;
    const totalMarks = sectionData.reqQuestions * parseInt(mark);

    return (
      <React.Fragment key={mark}>
        <h3 className="text-xl font-bold text-center my-4">Section {section}</h3>
        <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <td colSpan="3" className="border px-2 py-1">
                {isCompulsory 
                  ? `Section ${section} is compulsory. Attempt all questions. (Answer Limit: ${sectionData.reqWords} words)`
                  : `Section ${section}: Do any ${sectionData.reqQuestions} of ${sectionData.inputQuestions} questions. (Answer Limit: ${sectionData.reqWords} words)`}
              </td>
              <td className="border px-2 py-1 text-center font-semibold">
                ({mark}×{sectionData.reqQuestions} = {totalMarks})
              </td>
            </tr>
            <tr>
              <th className="border px-2 py-1">Q.No.</th>
              <th className="border px-2 py-1">Question</th>
              <th className="border px-2 py-1">CO</th>
              <th className="border px-2 py-1">RBT Level</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(renderQuestionRow)}
          </tbody>
        </table>
      </React.Fragment>
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-800">{data.subject}</h4>
        <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors ${
            isGenerating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Generate new question paper with same parameters"
        >
          {isGenerating ? 'Generating...' : '↻ Regenerate Paper'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div ref={paperRef} className="p-4 max-w-[8.27in] mx-auto border border-gray-300 bg-white font-normal">
        {/* Exam Header */}
        <div className="text-center">
          <p>Registration No. __________________ Exam Seat No. __________________ Q.P Set ________</p>
          <img src={logo} alt="University Logo" className="mx-auto w-32 mt-4" />
          <h1 className="text-2xl font-bold uppercase mt-2">{examData.examinationType}</h1>
        </div>

        {/* Exam Info Table */}
        <table className="w-full border-collapse border border-gray-300 my-4">
          <tbody>
            <tr>
              <td colSpan="2" className="border px-2 py-1 text-center">School Name:</td>
              <td colSpan="2" className="border font-semibold px-2 py-1 text-center">
                {examData.school}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">Program</td>
              <td className="border px-2 py-1 text-center font-semibold">{data.program}</td>
              <td className="border px-2 py-1 text-center">Semester</td>
              <td className="border px-2 py-1 text-center font-semibold">{data.semester}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">Subject Code</td>
              <td className="border px-2 py-1 text-center font-semibold">{data.subjectCode}</td>
              <td className="border px-2 py-1 text-center">Subject Name</td>
              <td className="border px-2 py-1 text-center font-semibold">{data.subject}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">Max Marks</td>
              <td className="border px-2 py-1 text-center font-semibold">60</td>
              <td className="border px-2 py-1 text-center">Duration</td>
              <td className="border px-2 py-1 text-center font-semibold">
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
            <tr>
              <td colSpan="4" className="border px-2 py-1">
                1. Write your registration no./seat no. on the top immediately on receipt of this question paper.
              </td>
            </tr>
            {renderInstructions()}
            <tr>
              <td colSpan="4" className="border px-2 py-1">
                {Object.keys(examData.sections).length + 2}. Word Limit is not applicable for Numerical/Graph-based questions.
              </td>
            </tr>
          </tbody>
        </table>

        {/* Question Sections */}
        {Object.keys(examData.sections)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(renderQuestionSection)}
      </div>

      <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors ${
            isGenerating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Generate new question paper with same parameters"
        >
          {isGenerating ? 'Generating...' : '↻ Regenerate Paper'}
      </button>
      

      {/* Distribution Charts */}
      {questionSelector.results && (
        <div className="mt-6">
          <DistributionCharts 
            unitDistribution={questionSelector.results.unitDistribution}
            difficultyDistribution={questionSelector.results.difficultyDistribution}
          />
        </div>
      )}
    </div>
  );
};
