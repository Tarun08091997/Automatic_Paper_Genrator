import React, { useState, useEffect } from "react";
import logo from "../assets/CT_University_logo.png"
import './examQuestionTable.css'

const ExamQuestionTable = ({setView, mcqs, subjective, examData }) => {
  const [selectedQuestions, setSelectedQuestions] = useState({
    mcqs1Mark: [],
    subjective1Mark: [],
    subjective2Mark: [],
    subjective5Mark: [],
    subjective10Mark: [],
  });

  let section = 65;
  const checkSection = ()=>{
    section = section + 1 ;
    return String.fromCharCode(section-1);
  }


  // Select Questions 
  useEffect(() => {
    console.log(examData);
    const selectQuestions = (questions, numberOfQuestions) => {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, numberOfQuestions);
    };

    const mcqs1Mark = selectQuestions(mcqs, examData.mcqQuestions);
    const subjective1Mark = selectQuestions(
      subjective.filter((q) => q.Marks === 1),
      examData.oneMarkQuestions
    );
    const subjective2Mark = selectQuestions(
      subjective.filter((q) => q.Marks === 2),
      examData.twoMarksQuestions
    );
    const subjective5Mark = selectQuestions(
      subjective.filter((q) => q.Marks === 5),
      examData.fiveMarksQuestions
    );
    const subjective10Mark = selectQuestions(
      subjective.filter((q) => q.Marks === 10),
      examData.tenMarksQuestions
    );

    setSelectedQuestions({
      mcqs1Mark,
      subjective1Mark,
      subjective2Mark,
      subjective5Mark,
      subjective10Mark,
    });
  }, [mcqs, subjective, examData]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 max-w-[8.27in] mx-auto border border-gray-300 bg-white font-normal">
      {/* Exam Header */}
      <p className="text-center">Registration No…………………………… &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Exam Seat No……………………………… &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  Q.P Set ………………. </p>
      <img className="ml-[40%] w-[120px] mt-10" src={logo} alt="CT University Logo" />
      <div className="text-center mt-4">
        <h1 className="text-2xl font-bold uppercase">{examData.examinationType}</h1>
      </div>

      {/* Exam Information Table */}
      <table className="table-auto w-full border-collapse border border-gray-300 ">
        <tbody>
          <tr>
            <td colSpan="2" className="border px-2 py-1 text-center">
              School Name:
            </td>
            <td colSpan="4" className="border font-semibold px-2 py-1 text-center">
              {data.schoolName}
            </td>
          </tr>
          <tr>
            <td className="border px-2 py-1 text-center">Program</td>
            <td className="border px-2 py-1 text-center font-semibold">{data.programme}</td>
            <td className="border px-2 py-1 text-center">Semester</td>
            <td className="border px-2 py-1 text-center font-semibold">{data.semester}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 text-center">
              Subject Code
            </td>
            <td className="border px-2 py-1 text-center font-semibold">{data.subjectCode}</td>
            <td className="border px-2 py-1 text-center">
              Subject Name
            </td>
            <td className="border px-2 py-1 text-center font-semibold">{data.subject}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1 text-center">
              Max Marks
            </td>
            <td className="border px-2 py-1 text-center font-semibold">60</td>
            <td className="border px-2 py-1 text-center ">Duration</td>
            <td className="border px-2 py-1 text-center font-semibold">
              {examData.duration}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Instructions */}
      <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr>
            <th
              colSpan="4"
              className="border px-2 py-1 text-left font-bold bg-gray-100"
            >
              Instructions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="4" className="border px-2 py-1">1. Write your registration no./seat no. on the top immediately on receipt of this question paper.</td>
          </tr>
          <tr>
            <td colSpan="4" className="border px-2 py-1">2. In Sec-A each question carries 1 mark, attempt all questions, and answer theory questions in minimum 50-100 words.</td>
          </tr>
          <tr>
            <td colSpan="4" className="border px-2 py-1">3. In Sec-B each question carries 2 marks, attempt all questions, and answer in minimum 100-200 words.</td>
          </tr>
          <tr>
            <td colSpan="4" className="border px-2 py-1">4. In Sec-C, each question carries 5 marks, attempt any four questions, answer in minimum 250-300 words.</td>
          </tr>
          <tr>
            <td colSpan="4" className="border px-2 py-1">5. In Sec-D, each question carries 10 marks, attempt any two questions, answer in minimum 500-600 words.</td>
          </tr>
          <tr>
            <td colSpan="4" className="border px-2 py-1">6. Word Limit is not applicable for Numerical based Questions/Graph based questions.</td>
          </tr>
        </tbody>
      </table>

      {/* 1 Marks Questions*/}
      { examData.oneMarkQuestions !== 0 && <h3 className="text-xl font-bold text-center my-4">
        Section {checkSection()} 
      </h3> }
      { examData.oneMarkQuestions !== 0 && <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr>
            <th className="border px-2 py-1">Sr. No.</th>
            <th className="border px-2 py-1">Question</th>
            <th className="border px-2 py-1">CO</th>
            <th className="border px-2 py-1">RBT Level</th>
          </tr>
        </thead>
        <tbody>
          {[...selectedQuestions.mcqs1Mark, ...selectedQuestions.subjective1Mark].map(renderQuestionRow)}
        </tbody>
      </table> }

      {/* 2 Marks Questions */}
      {examData.twoMarksQuestions != 0 && <h3 className="text-xl font-bold text-center my-4">
        Section {checkSection()} 
      </h3> }
      { examData.twoMarksQuestions != 0 && <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr>
            <th className="border px-2 py-1">Sr. No.</th>
            <th className="border px-2 py-1">Question</th>
            <th className="border px-2 py-1">CO</th>
            <th className="border px-2 py-1">RBT Level</th>
          </tr>
        </thead>
        <tbody>
          {selectedQuestions.subjective2Mark.map(renderQuestionRow)}
        </tbody>
      </table> }

      {/* 5 Marks Questions */}
      {examData.fiveMarksQuestions != 0 && <h3 className="text-xl font-bold text-center my-4">
        Section {checkSection()} 
      </h3> }
      { examData.fiveMarksQuestions !=0 && <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr>
            <th className="border px-2 py-1">Sr. No.</th>
            <th className="border px-2 py-1">Question</th>
            <th className="border px-2 py-1">CO</th>
            <th className="border px-2 py-1">RBT Level</th>
          </tr>
        </thead>
        <tbody>{selectedQuestions.subjective5Mark.map(renderQuestionRow)}</tbody>
      </table>}

      {/* 10 Marks questions*/}
      {examData.tenMarksQuestions != 0 && <h3 className="text-xl font-bold text-center my-4">
        Section {checkSection()} 
      </h3>}
      {examData.tenMarksQuestions != 0 && <table className="table-auto w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr>
            <th className="border px-2 py-1">Sr. No.</th>
            <th className="border px-2 py-1">Question</th>
            <th className="border px-2 py-1">CO</th>
            <th className="border px-2 py-1">RBT Level</th>
          </tr>
        </thead>
        <tbody>{selectedQuestions.subjective10Mark.map(renderQuestionRow)}</tbody>
      </table>}

      {/* Print Button */}
      <div className="text-center mt-8">
      {/* <button
              onClick={()=>setView(false)}
              className="bg-yellow-300 text-white px-6 py-3 rounded shadow hover:bg-yellow-600"
            >
              back
            </button> */}

        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded no-print"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default ExamQuestionTable;
