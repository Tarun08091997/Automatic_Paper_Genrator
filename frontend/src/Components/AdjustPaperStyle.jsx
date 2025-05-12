import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const AdjustPaperStyle = ({ style, setStyle, setShowStyleEditor }) => {
  const [collapsed, setCollapsed] = useState({
    instructions: true,
    examName: true,
    schoolInfoKey: true,
    schoolInfoValue: true,
    sectionHeading: true,
    sectionInstruction: true,
    questionHeading: true,
    questionRow: true,
  });

  // Function to toggle collapse state of each section
  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Function to handle style changes for each section
  const handleStyleChange = (section, property, value) => {
    setStyle({
      ...style,
      [section]: {
        ...style[section],
        [property]: value,
      },
    });
  };

  // Helper function for handling italic/bold toggle
  const handleToggle = (section, property) => {
    setStyle({
      ...style,
      [section]: {
        ...style[section],
        [property]: !style[section][property],
      },
    });
  };

  // Function to close the entire panel
  const closePanel = () => {
    setShowStyleEditor(false);
  };

  return (
    <div
      className="adjust-paper-style-container"
      style={{
        position: "fixed",
        top: "20%",
        right: "0",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "8px",
        padding: "10px",
        width: "300px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: "999",
        maxHeight: "80vh", // To make the container scrollable
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={closePanel}
          style={{
            backgroundColor: "#FF4D4D",
            color: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X />
        </button>
      </div>

      {/* Each Section */}
      {["instructions", "examName", "schoolInfoKey", "schoolInfoValue", "sectionHeading", "sectionInstruction", "questionHeading", "questionRow"].map(
        (section) => (
          <div key={section} style={{ marginTop: "10px" }}>
            <button
              onClick={() => toggleCollapse(section)}
              style={{
                width: "100%",
                backgroundColor: "#007BFF",
                color: "white",
                padding: "8px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{section.replace(/([A-Z])/g, " $1")}</span>
              {collapsed[section] ? <ChevronDown /> : <ChevronUp />}
            </button>

            {!collapsed[section] && (
              <div style={{ paddingLeft: "10px", marginTop: "10px" }}>
                {/* Font Size */}
                <div style={{ marginTop: "10px" }}>
                  <label>Font Size:</label>
                  <input
                    type="number"
                    value={parseInt(style[section].fontSize)}
                    onChange={(e) =>
                      handleStyleChange(section, "fontSize", `${e.target.value}px`)
                    }
                    style={{ marginLeft: "10px", width: "80px" }}
                  />
                </div>

                {/* Font Family */}
                <div style={{ marginTop: "10px" }}>
                  <label>Font Family:</label>
                  <select
                    value={style[section].fontFamily}
                    onChange={(e) =>
                      handleStyleChange(section, "fontFamily", e.target.value)
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    <option value="'Arial', sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="'Georgia', serif">Georgia</option>
                    <option value="'Verdana', sans-serif">Verdana</option>
                  </select>
                </div>

                {/* Text Alignment */}
                <div style={{ marginTop: "10px" }}>
                  <label>Text Align:</label>
                  <div>
                    <label style={{ marginRight: "5px" }}>
                      <input
                        type="radio"
                        name={`${section}-align`}
                        value="left"
                        checked={style[section].textAlign === "left"}
                        onChange={() =>
                          handleStyleChange(section, "textAlign", "left")
                        }
                      />
                      Left
                    </label>
                    <label style={{ marginRight: "5px" }}>
                      <input
                        type="radio"
                        name={`${section}-align`}
                        value="center"
                        checked={style[section].textAlign === "center"}
                        onChange={() =>
                          handleStyleChange(section, "textAlign", "center")
                        }
                      />
                      Center
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${section}-align`}
                        value="right"
                        checked={style[section].textAlign === "right"}
                        onChange={() =>
                          handleStyleChange(section, "textAlign", "right")
                        }
                      />
                      Right
                    </label>
                  </div>
                </div>

                {/* Font Style (Italic) */}
                <div style={{ marginTop: "10px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={style[section].fontStyle === "italic"}
                      onChange={() => handleToggle(section, "fontStyle")}
                    />
                    Italic
                  </label>
                </div>

                {/* Font Weight (Bold) */}
                <div style={{ marginTop: "10px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={style[section].fontWeight === "bold"}
                      onChange={() => handleToggle(section, "fontWeight")}
                    />
                    Bold
                  </label>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AdjustPaperStyle;
