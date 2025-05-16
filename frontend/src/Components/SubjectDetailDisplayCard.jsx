import React, { useState} from "react";
import QuestionAnalytics from "../pages/QuestionAnalytics";
import CreatePaper from "../pages/CreatePaper";

const SubjectDetailDisplayCard = ({ fileData, isSelected, onCheckboxChange}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Track if the card is expanded

  // Handle card click to expand/collapse
  const handleCardClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isExpanded ? "bg-gray-50" : "bg-white"
      }`}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            onChange={() => onCheckboxChange(fileData.subject)}
            checked={isSelected}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
          />
          <div>
            <h4 className="text-md font-medium text-gray-800">{fileData.subject}</h4>
            <p className="text-sm text-gray-500">
              Code: {fileData.code}
            </p>
          </div>
        </div>
        <span
          className={`transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {fileData ?  
                ( 
                <QuestionAnalytics mcqQuestions = {[]} subjectiveQuestions = {fileData.questions} COS = {fileData.COS} unitCOS = {fileData.Unit_Wise_COS}/>
            
          ) : (
            <p className="text-gray-600">No data available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectDetailDisplayCard;