import React, { useEffect, useState } from "react";
import SubjectDetailDisplayCard from "./SubjectDetailDisplayCard";

export default function SelectRequiredFiles({list , subjectList, setSubjectList}) {
 

  // Handle checkbox selection for individual subjects
  const handleCheckboxChange = (fileName) => {
    setSubjectList((prev) =>
      prev.includes(fileName)
        ? prev.filter((name) => name !== fileName) // Remove if already selected
        : [...prev, fileName] // Add if not selected
    );
  };

  // Handle "Select All" and "Unselect All"
  const handleSelectAll = () => {
    if (subjectList.length === list.length) {
      // If all are selected, unselect all
      setSubjectList([]);
    } else {
      // Otherwise, select all
      setSubjectList(list.map((file) => file.subject));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {/* Display total selected subjects */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Total Subjects Selected: {subjectList.length}
        </h3>

        {/* Select All / Unselect All Button */}
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {subjectList.length === list.length ? "Unselect All" : "Select All"}
        </button>


      {/* List of subject cards */}
      <div className="space-y-4">
        {list.map((file, index) => (
          <SubjectDetailDisplayCard
            key={index}
            fileData={file}
            isSelected={subjectList.includes(file.subject)}
            onCheckboxChange={handleCheckboxChange}
          />
        ))}
      </div>

        
      </div>
    </div>
  );
}