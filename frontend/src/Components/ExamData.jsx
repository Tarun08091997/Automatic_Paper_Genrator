import React, { useState, useEffect } from "react";

const ExamData = ({ setExamData, setDataGiven }) => {
  const [localExamData, setLocalExamData] = useState({
    examinationType: "",
    month: "",
    year: "2025",
    duration: "",
    units: 3,
    school: "",
    difficultyLevel: {
      hard: 20,
      normal: 30,
      easy: 50,
    },
    sets:1,
    sections: {
      1: {
        inputQuestions: 0,
        reqQuestions: 0,
        reqWords: "50-100"
      },
      2: {
        inputQuestions: 5,
        reqQuestions: 5,
        reqWords: "100-200"
      },
      5: {
        inputQuestions: 2,
        reqQuestions: 2,
        reqWords: "250-300"
      },
      10: {
        inputQuestions: 2,
        reqQuestions: 1,
        reqWords: "500-600"
      }
    },
    includedUnits: [1, 2, 3],
    reqMarksByUnits: {
      1: 0,
      2: 0,
      3: 0
    }
  });

  const [newSectionMark, setNewSectionMark] = useState("");

  const schools = [
    "School of Engineering and Technology",
    "School of Law",
    "School of Health Science",
    "School of Optometry",
    "School of Pharmaceutical Science",
    "School of Management, Hotel Management and Design",
    "School of Arts, Science, Humanities and Physical Education",
    "School of Allied Health Science",
  ];

  const isDataComplete = () => {
    return (
      localExamData.examinationType &&
      localExamData.month &&
      localExamData.year &&
      localExamData.duration &&
      localExamData.school &&
      localExamData.total_marks == caculateTotalByUnit()
    );
  };

  const INPUTDESIGN = "mt-2 p-1 text-[16px] border border-gray-300 rounded-lg";
  const INPUTTEXTDESIGN = "block text-sm font-medium text-gray-700";

  useEffect(() => {
    setExamData(localExamData);
    setDataGiven(isDataComplete());
  }, [localExamData, setExamData, setDataGiven]);

  useEffect(() => {
    calculateTotalMarks();
    requiredMarksByUnit();
  }, [localExamData.sections, localExamData.includedUnits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalExamData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);

    setLocalExamData((prev) => {
      const updatedData = { ...prev, [name]: newValue };

      if (name === "units") {
        const totalUnits = newValue;
        const includedUnits = Array.from({ length: totalUnits }, (_, i) => i + 1);
        const reqMarksByUnits = {};
        
        includedUnits.forEach(unit => {
          reqMarksByUnits[unit] = prev.reqMarksByUnits[unit] || 0;
        });
        
        updatedData.includedUnits = includedUnits;
        updatedData.reqMarksByUnits = reqMarksByUnits;
      }

      return updatedData;
    });
  };

  const handleSectionChange = (mark, field, value) => {
    setLocalExamData((prev) => {
      const updatedSections = { ...prev.sections };
      
      if (!updatedSections[mark]) {
        updatedSections[mark] = {
          inputQuestions: 0,
          reqQuestions: 0,
          reqWords: ""
        };
      }
      
      updatedSections[mark][field] = field === 'reqWords' ? value : parseInt(value, 10) || 0;
      
      if (field === 'inputQuestions' && updatedSections[mark].reqQuestions > value) {
        updatedSections[mark].reqQuestions = parseInt(value, 10) || 0;
      }
      
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };

  const handleDifficultyChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);

    setLocalExamData((prev) => {
      const updatedDifficulty = {
        ...prev.difficultyLevel,
        [name]: newValue,
      };

      updatedDifficulty.easy = 100 - updatedDifficulty.hard - updatedDifficulty.normal;

      return {
        ...prev,
        difficultyLevel: updatedDifficulty,
      };
    });
  };

  const handleUnitCheckboxChange = (unit) => {
    setLocalExamData((prev) => {
      const includedUnits = prev.includedUnits.includes(unit)
        ? prev.includedUnits.filter((u) => u !== unit)
        : [...prev.includedUnits, unit];

      const reqMarksByUnits = { ...prev.reqMarksByUnits };
      
      // If unit is being unchecked, set its marks to 0
      if (!includedUnits.includes(unit)) {
        reqMarksByUnits[unit];
      } else {
        // If unit is being checked, initialize its marks if not already set
        reqMarksByUnits[unit] = reqMarksByUnits[unit] || 0;
      }
      
      return {
        ...prev,
        includedUnits,
        reqMarksByUnits
      };
    });
  };

  const handleUnitMarksChange = (unit, value) => {
    setLocalExamData((prev) => ({
      ...prev,
      reqMarksByUnits: {
        ...prev.reqMarksByUnits,
        [unit]: parseInt(value) || 0
      }
    }));
  };

  const addNewSection = () => {
    if (newSectionMark && !localExamData.sections[newSectionMark]) {
      const markValue = parseInt(newSectionMark, 10);
      if (!isNaN(markValue)) {
        setLocalExamData((prev) => ({
          ...prev,
          sections: {
            ...prev.sections,
            [markValue]: {
              inputQuestions: 0,
              reqQuestions: 0,
              reqWords: ""
            }
          }
        }));
        setNewSectionMark("");
      }
    }
  };

  const removeSection = (mark) => {
    setLocalExamData((prev) => {
      const updatedSections = { ...prev.sections };
      delete updatedSections[mark];
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };

  useEffect(() => {
    if (localExamData.examinationType === "MID TERM EXAMINATION") {
      setLocalExamData((prev) => ({
        ...prev,
        duration: "1 Hour",
        units: 3,
        sections: {
          1: { inputQuestions: 0, reqQuestions: 0, reqWords: "50-100" },
          2: { inputQuestions: 5, reqQuestions: 5, reqWords: "100-200" },
          5: { inputQuestions: 2, reqQuestions: 2, reqWords: "250-300" },
          10: { inputQuestions: 2, reqQuestions: 1, reqWords: "500-600" }
        },
        includedUnits: [1, 2, 3],
        reqMarksByUnits: {
          1: 0,
          2: 0,
          3: 0
        }
      }));
    } else if (localExamData.examinationType === "END TERM EXAMINATION") {
      setLocalExamData((prev) => ({
        ...prev,
        duration: "3 Hours",
        units: 6,
        sections: {
          1: { inputQuestions: 10, reqQuestions: 10, reqWords: "50-100" },
          2: { inputQuestions: 5, reqQuestions: 5, reqWords: "100-200" },
          5: { inputQuestions: 5, reqQuestions: 4, reqWords: "250-300" },
          10: { inputQuestions: 3, reqQuestions: 2, reqWords: "500-600" }
        },
        includedUnits: [1, 2, 3, 4, 5, 6],
        reqMarksByUnits: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0
        }
      }));
    }
  }, [localExamData.examinationType]);

  const calculateTotalMarks = () => {
    const totalMarks = Object.entries(localExamData.sections).reduce((total, [mark, section]) => {
      return total + (section.inputQuestions * parseInt(mark, 10));
    }, 0);

    setLocalExamData(prev => ({
      ...prev,
      total_marks: totalMarks
    }));

    return totalMarks;
  };

  const caculateTotalByUnit = () =>{
    
    const total = Object.values(localExamData.reqMarksByUnits).reduce((val,a) => a+val , 0);
    return total;

  }

  const requiredMarksByUnit = () => {
    const totalMarks = calculateTotalMarks();
    const totalUnits = localExamData.includedUnits.length;
    
    if (totalUnits === 0) return;

    const marksPerUnit = Math.floor(totalMarks / totalUnits);
    let remainingMarks = totalMarks - marksPerUnit * totalUnits;

    const newReqMarksByUnits = { ...localExamData.reqMarksByUnits };
    
    // Initialize all included units with marksPerUnit
    localExamData.includedUnits.forEach(unit => {
      newReqMarksByUnits[unit] = marksPerUnit;
    });

    // Distribute remaining marks
    const includedUnitsCopy = [...localExamData.includedUnits];
    while (remainingMarks > 0 && includedUnitsCopy.length > 0) {
      const randomIndex = Math.floor(Math.random() * includedUnitsCopy.length);
      const randomUnit = includedUnitsCopy[randomIndex];
      newReqMarksByUnits[randomUnit]++;
      remainingMarks--;
    }

    // Set marks to 0 for excluded units
    Object.keys(newReqMarksByUnits).forEach(unit => {
      if (!localExamData.includedUnits.includes(parseInt(unit))) {
        newReqMarksByUnits[unit] = 0;
      }
    });

    setLocalExamData(prev => ({
      ...prev,
      reqMarksByUnits: newReqMarksByUnits,
      totalUnits: totalUnits
    }));
  };

  return (
    <div className="px-10">
      {/* School and Exam Details Section */}
      <div className="border border-gray-300 rounded-md bg-gray-50 p-2">
        <h2 className="text-lg font-bold mb-3">School and Exam Details</h2>
        <div className="flex gap-2">
          {/* School Select Dropdown */}
          <div>
            <label className={INPUTTEXTDESIGN}>School</label>
            <select
              value={localExamData.school}
              onChange={(e) => setLocalExamData({...localExamData , school: e.target.value})}
              className= {INPUTDESIGN}
            >
              <option value="">Select a School</option>
              {schools.map((school, index) => (
                <option key={index} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Examination Type Select */}
          <div>
            <label className={INPUTTEXTDESIGN}>Examination Type</label>
            <select
              name="examinationType"
              value={localExamData.examinationType}
              onChange={handleChange}
              className={INPUTDESIGN}
            >
              <option value="" disabled>
                Select Examination Type
              </option>
              <option value="END TERM EXAMINATION">END TERM EXAMINATION</option>
              <option value="MID TERM EXAMINATION">MID TERM EXAMINATION</option>
            </select>
          </div>

          {/* Month Select */}
          <div>
            <label className={INPUTTEXTDESIGN}>Month</label>
            <select
              name="month"
              value={localExamData.month}
              onChange={handleChange}
              className={INPUTDESIGN}
            >
              <option value="" disabled>
                Select Month
              </option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Year Input */}
          <div>
            <label className={INPUTTEXTDESIGN}>Year</label>
            <input
              type="number"
              name="year"
              value={localExamData.year}
              onChange={handleChange}
              placeholder="Enter Year"
              className={INPUTDESIGN}
            />
          </div>

          {/* Duration Select */}
          <div>
            <label className={INPUTTEXTDESIGN}>Duration</label>
            <select
              name="duration"
              value={localExamData.duration}
              onChange={handleChange}
              className={INPUTDESIGN}
            >
              <option value="" disabled>
                Select Duration
              </option>
              {["30 Minutes", "2 Hours", "3 Hours", "2.5 Hours"].map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mt-4">
        <h2 className="text-sm font-bold mb-4">Questions</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1">Section</th>
              <th className="border border-gray-300 p-1">Marks</th>
              <th className="border border-gray-300 p-1">Input</th>
              <th className="border border-gray-300 p-1">Required</th>
              <th className="border border-gray-300 p-1">Required Words</th>
              <th className="border border-gray-300 p-1">Total Marks</th>
              <th className="border border-gray-300 p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Questions Rows */}
            {Object.entries(localExamData.sections).map(([mark, section]) => (
              <tr key={mark}>
                <td className="border border-gray-300 p-2">Section {mark}</td>
                <td className="border border-gray-300 p-2">{mark}</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={section.inputQuestions}
                    onChange={(e) => handleSectionChange(mark, 'inputQuestions', e.target.value)}
                    placeholder="Enter questions"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={section.reqQuestions}
                    onChange={(e) => handleSectionChange(mark, 'reqQuestions', e.target.value)}
                    placeholder="Enter required questions"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="text"
                    value={section.reqWords}
                    onChange={(e) => handleSectionChange(mark, 'reqWords', e.target.value)}
                    placeholder="Enter required words"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  {section.inputQuestions * parseInt(mark, 10)}
                </td>
                <td className="border border-gray-300 p-2">
                  <button 
                    onClick={() => removeSection(mark)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}

            {/* Add New Section Row */}
            <tr>
              <td className="border border-gray-300 p-2" colSpan={7}>
                <div className="flex gap-2 items-center">
                  <span>Add New Section:</span>
                  <input
                    type="number"
                    value={newSectionMark}
                    onChange={(e) => setNewSectionMark(e.target.value)}
                    placeholder="Enter marks for new section"
                    className="border border-gray-300 rounded-md p-2 w-32"
                  />
                  <button 
                    onClick={addNewSection}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              </td>
            </tr>

            {/* Total Marks Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 p-2 text-center" colSpan={5}>
                Total Marks
              </td>
              <td className="border border-gray-300 p-2 text-center">{localExamData.total_marks || calculateTotalMarks()}</td>
              <td className="border border-gray-300 p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Units Section */}
      <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mt-4">
        <h2 className="text-sm font-bold mb-4">Units</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1">Number of Units</th>
              <th className="border border-gray-300 p-1">Input</th>
              <th className="border border-gray-300 p-1">Included Units</th>
              <th className="border border-gray-300 p-1">Sets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 ">Total Units</td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  name="units"
                  value={localExamData.units}
                  onChange={handleNumChange}
                  placeholder="Enter units"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <div className="flex flex-wrap flex-col gap-2">
                  {Array.from({ length: localExamData.units }, (_, i) => i + 1).map((unit) => (
                    <label key={unit} className="flex items-center gap-5">
                      <input
                        type="checkbox"
                        checked={localExamData.includedUnits.includes(unit)}
                        onChange={() => handleUnitCheckboxChange(unit)}
                        className="border border-gray-300 rounded"
                      />
                      <span>Unit {unit}</span>

                      <input
                        type="number"
                        value={localExamData.reqMarksByUnits[unit] || 0}
                        onChange={(e) => handleUnitMarksChange(unit, e.target.value)}
                        disabled={!localExamData.includedUnits.includes(unit)}
                        className="border border-gray-300 rounded-md p-2 w-20"
                      />

                    </label>
                  ))}
                </div>
              </td>

              <td>
                  <input
                    name="sets"
                    type="number"
                    value={localExamData.sets || 0}
                    onChange={handleNumChange}
                    className="border border-gray-300 rounded-md p-2 w-20"
                  />
              </td>
             
            </tr>

            {/* Total Marks Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 p-2 text-center" colSpan={2}>
                Total Marks
              </td>
              <td className={`border p-2 text-center ${parseInt(localExamData.total_marks) === parseInt(caculateTotalByUnit()) ? 'border-gray-300' : 'border-red-500 border-[5px]' }`}>{0 ||caculateTotalByUnit()}</td>
              <td className="border border-gray-300 p-2"></td>
            </tr>


          </tbody>
        </table>
      </div>

      {/* Difficulty Level Section */}
      <div className="border border-gray-300 rounded-md bg-gray-50 p-4 mt-4">
        <h2 className="text-sm font-bold mb-4">Difficulty Level</h2>
        <div className="flex gap-4">
          {/* Difficulty Level Text */}
          <div className="flex-1">
            <label className={INPUTTEXTDESIGN}>Difficulty Level</label>
          </div>

          {/* Hard Input */}
          <div className="flex-1">
            <label className={INPUTTEXTDESIGN}>Hard</label>
            <input
              type="number"
              name="hard"
              value={localExamData.difficultyLevel.hard}
              onChange={handleDifficultyChange}
              placeholder="Enter Hard %"
              className={INPUTDESIGN}
            />
          </div>

          {/* Normal Input */}
          <div className="flex-1">
            <label className={INPUTTEXTDESIGN}>Normal</label>
            <input
              type="number"
              name="normal"
              value={localExamData.difficultyLevel.normal}
              onChange={handleDifficultyChange}
              placeholder="Enter Normal %"
              className={INPUTDESIGN}
            />
          </div>

          {/* Easy Input */}
          <div className="flex-1">
            <label className={INPUTTEXTDESIGN}>Easy</label>
            <input
              type="number"
              name="easy"
              value={localExamData.difficultyLevel.easy}
              disabled
              className={INPUTDESIGN}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamData;