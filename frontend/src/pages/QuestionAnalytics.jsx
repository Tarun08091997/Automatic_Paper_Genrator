import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
);

const QuestionAnalytics = ({ mcqQuestions, subjectiveQuestions , COS ,unitCOS}) => {
  console.log(subjectiveQuestions);
  // Questions per Unit for MCQs (Objective)
  const mcqQuestionsPerUnit = mcqQuestions.reduce((acc, question) => {
    acc[question.Unit] = (acc[question.Unit] || 0) + 1;
    return acc;
  }, {});

  // Questions per Unit for Subjective
  const subjectiveQuestionsPerUnit = subjectiveQuestions.reduce((acc, question) => {
    acc[question.Unit] = (acc[question.Unit] || 0) + 1;
    return acc;
  }, {});

  // Marks per Unit for Subjective Questions
  const marksPerUnit = subjectiveQuestions.reduce((acc, question) => {
    acc[question.Unit] = (acc[question.Unit] || 0) + question.Marks;
    return acc;
  }, {});

  // Mark type distribution per unit
  const marksTypePerUnit = subjectiveQuestions.reduce((acc, question) => {
    const marks = question.Marks;
    acc[question.Unit] = acc[question.Unit] || {};
    acc[question.Unit][marks] = (acc[question.Unit][marks] || 0) + 1;
    return acc;
  }, {});

  const UnitPerMarkType = subjectiveQuestions.reduce((acc, question) => {
    const unit = question.Unit;
    acc[question.Marks] = acc[question.Marks] || {};
    acc[question.Marks][unit] = (acc[question.Marks][unit] || 0) + 1;
    return acc;
  }, {});

  // Levels per Unit for Subjective Questions
  const levelsPerUnit = subjectiveQuestions.reduce((acc, question) => {
    const level = question.Level || question["RBT Level"];
    acc[question.Unit] = acc[question.Unit] || {};
    acc[question.Unit][level] = (acc[question.Unit][level] || 0) + 1;
    return acc;
  }, {});

  const unitPerLevel = subjectiveQuestions.reduce((acc, question) => {
    const unit = question.Unit;
    acc[question.Level] = acc[question.Level] || {};
    acc[question.Level][unit] = (acc[question.Level][unit] || 0) + 1;
    return acc;
  }, {});

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      datalabels: {
        color: "#000",
        font: {
          weight: "bold",
        },
        formatter: (value) => value,
      },
    },
  };

  // Pie Chart Options for Questions per Unit
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Disable legend display
      },
      datalabels: {
        color: "#fff", // Color for the value labels
        font: {
          size: 12, // Adjust size for better visibility
          weight: "bold",
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label} \n ${value}`; // Display the label and value together
        },
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Question Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[100px] gap-x-[50px]">
        {/* First Row: Pie Chart - MCQ Questions per Unit */}
        <div className="h-[300px]">
          <h2 className="text-xl font-semibold mb-4">MCQ Questions per Unit</h2>
          <Pie
            data={{
              labels: Object.keys(mcqQuestionsPerUnit).map((unit) => `Unit ${unit}`),
              datasets: [
                {
                  label: "MCQ Questions per Unit",
                  data: Object.values(mcqQuestionsPerUnit),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                },
              ],
            }}
            options={pieChartOptions}
          />
        </div>

        {/* Second Row: Pie Chart - Subjective Questions per Unit */}
        <div className="h-[300px]">
          <h2 className="text-xl font-semibold mb-4">Subjective Questions per Unit</h2>
          <Pie
            data={{
              labels: Object.keys(subjectiveQuestionsPerUnit).map((unit) => `Unit ${unit}`),
              datasets: [
                {
                  label: "Subjective Questions per Unit",
                  data: Object.values(subjectiveQuestionsPerUnit),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                },
              ],
            }}
            options={pieChartOptions}
          />
        </div>

        {/* Pie Chart for Total Marks per Unit (Subjective) */}
        <div className="h-[300px]">
          <h2 className="text-xl font-semibold mb-4">Total Marks per Unit ( Subjective )</h2>
          <Pie
            data={{
              labels: Object.keys(marksPerUnit).map((unit) => `Unit ${unit}`),
              datasets: [
                {
                  label: "Total Marks per Unit",
                  data: Object.values(marksPerUnit),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                },
              ],
            }}
            options={pieChartOptions}
          />
        </div>

        {/* Bar Chart for Marks Distribution per Unit */}
        <div className="h-[300px]">
          <h2 className="text-xl font-semibold mb-4">Marks Distribution per Unit</h2>
          <Bar
            data={{
              labels: Object.keys(subjectiveQuestionsPerUnit),
              datasets: Object.keys(UnitPerMarkType).map((mark, index) => {
                const marksData = Object.values(UnitPerMarkType[mark]);
                return {
                  label: `Marks ${mark}`,
                  data: marksData,
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"][index % 5],
                };
              }),
            }}
            options={commonOptions}
          />
        </div>

        {/* Pie Chart for Marks Distribution by COs */}
        <div className="h-[300px] mt-8">
          <h2 className="text-xl font-semibold mb-4">Marks Distribution by COs</h2>
          <Pie
            data={{
              labels: Object.keys(COS),
              datasets: [
                {
                  label: "Marks per CO",
                  data: Object.values(COS),
                  backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
                  ],
                },
              ],
            }}
            options={pieChartOptions}
          />
        </div>

        {/* Bar Chart for CO Marks per Unit */}
        <div className="h-[300px] mt-8" onClick={() => console.log(unitCOS)}>
          <h2 className="text-xl font-semibold mb-4">CO-wise Marks per Unit</h2>
          <Bar
            data={{
              labels: Object.keys(unitCOS).map(unit => `Unit ${unit}`),
              datasets: (() => {
                const allCOs = new Set();
                Object.values(unitCOS).forEach(coData =>
                  Object.keys(coData).forEach(co => allCOs.add(co))
                );

                return Array.from(allCOs).map((co, index) => ({
                  label: co,
                  data: Object.keys(unitCOS).map(unit => unitCOS[unit][co] ?? 0),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"][index % 6],
                }));
              })()
            }}
            options={{
              ...commonOptions,
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Unit",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Marks",
                  },
                },
              },
            }}
          />
        </div>



        {/* Bar Chart for Levels per Unit (Subjective Questions Only) */}
        <div className="h-[300px]" onClick={()=> console.log(unitPerLevel)}>
          <h2 className="text-xl font-semibold mb-4">Levels per Unit (Subjective)</h2>
          <Bar
            data={{
              labels: Object.keys(subjectiveQuestionsPerUnit),
              datasets: Object.keys(unitPerLevel).map((level, index) => ({
                label: `Level ${level}`,
                data: Object.values(unitPerLevel[level]),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"][index % 5],
              })),
            }}
            options={{
              ...commonOptions,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Unit",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Total Questions",
                  },
                  beginAtZero: true,
                },
              },
            }}

          />
        </div>
      </div>
    </div>
  );
};

export default QuestionAnalytics;
