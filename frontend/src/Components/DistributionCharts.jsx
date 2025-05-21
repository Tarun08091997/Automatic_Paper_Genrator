import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components and the datalabels plugin
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

const DistributionCharts = ({ unitDistribution, difficultyDistribution , CObySection , MarksbyCO }) => {
  const [showDifficulty, setShowDifficulty] = useState(false);
  console.log(CObySection , MarksbyCO);

  const unitData = {
    labels: Object.keys(unitDistribution).map(unit => `Unit ${unit}`),
    datasets: [
      {
        data: Object.values(unitDistribution),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Marks by Difficulty',
        data: [difficultyDistribution[1] || 0, difficultyDistribution[2] || 0, difficultyDistribution[3] || 0],
        backgroundColor: ['#4BC0C0', '#36A2EB', '#FF6384'],
        borderColor: ['#4BC0C0', '#36A2EB', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} marks`,
        },
      },
      datalabels: {
        formatter: (value, ctx) => {
          const dataset = ctx.dataset;
          const total = dataset.data.reduce((acc, val) => acc + val, 0);
          return total ? `${((value / total) * 100).toFixed(1)}%` : '0%';
        },
        color: '#000',
        font: { weight: 'bold' },
        anchor: 'end',
        align: 'center',
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Question Paper Composition Analysis</h2>
      
      {/* Row 1 - Unit-wise Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        <div style={{ height: '200px', border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
          <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Unit-wise Distribution</h3>
          <Pie data={unitData} options={options} />
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
          <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Unit-wise Marks</h3>
          <table style={{ width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '4px', border: '1px solid #ddd' }}>Unit</th>
                <th style={{ padding: '4px', border: '1px solid #ddd' }}>Marks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(unitDistribution).map(([unit, marks]) => (
                <tr key={unit}>
                  <td style={{ padding: '4px', border: '1px solid #ddd' }}>Unit {unit}</td>
                  <td style={{ padding: '4px', border: '1px solid #ddd' }}>{marks} marks</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CO wise Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        <div style={{ height: '200px', border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
          <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>CO-wise Distribution</h3>
          <Bar
            data={{
              labels: Object.keys(MarksbyCO),
              datasets: [
                {
                  label: 'Marks',
                  data: Object.values(MarksbyCO),
                  backgroundColor: Object.keys(MarksbyCO).map((_, index) => {
                    const colors = [
                      '#4CAF50', // green
                      '#2196F3', // blue
                      '#FFC107', // amber
                      '#FF5722', // deep orange
                      '#9C27B0', // purple
                      '#00BCD4', // cyan
                      '#E91E63', // pink
                      '#607D8B', // blue grey
                    ];
                    return colors[index % colors.length];
                  }),
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
          <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>CO-wise Marks</h3>
          <table style={{ width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '4px', border: '1px solid #ddd' }}>CO</th>
                <th style={{ padding: '4px', border: '1px solid #ddd' }}>Marks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MarksbyCO).map(([co, marks]) => (
                <tr key={co}>
                  <td style={{ padding: '4px', border: '1px solid #ddd' }}>{co}</td>
                  <td style={{ padding: '4px', border: '1px solid #ddd' }}>{marks} marks</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section wise CO  Distribution */}
      <div style={{ height: '300px', border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
        <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Section-wise CO Distribution</h3>
        <Bar
          data={{
            labels: Object.keys(CObySection), // Sections on x-axis: 1, 2, 5, 10
            datasets: (() => {
              const coKeys = Object.keys(Object.values(CObySection)[0]); // CO1, CO2, etc.
              const colors = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4', '#E91E63', '#607D8B'];

              return coKeys.map((co, idx) => ({
                label: co,
                backgroundColor: colors[idx % colors.length],
                data: Object.values(CObySection).map(sectionData => sectionData[co] || 0)
              }));
            })()
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: false }
            },
            scales: {
              y: { beginAtZero: true },
              x: { title: { display: true, text: 'Section' } }
            }
          }}
        />
      </div>



      {/* Checkbox for Difficulty-wise Distribution */}
      <label style={{ textAlign: 'center' }}>
        <input type="checkbox" checked={showDifficulty} onChange={() => setShowDifficulty(!showDifficulty)} /> Show Difficulty-wise Distribution
      </label>

      {/* Row 2 - Difficulty-wise Distribution (Hidden by Default) */}
      {showDifficulty && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
          <div style={{ height: '200px', border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
            <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Difficulty-wise Distribution</h3>
            <Bar data={difficultyData} options={options} />
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
            <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Difficulty-wise Marks</h3>
            <table style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '4px', border: '1px solid #ddd' }}>Difficulty</th>
                  <th style={{ padding: '4px', border: '1px solid #ddd' }}>Marks</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '4px', border: '1px solid #ddd' }}>Easy</td><td style={{ padding: '4px', border: '1px solid #ddd' }}>{difficultyDistribution[1] || 0} marks</td></tr>
                <tr><td style={{ padding: '4px', border: '1px solid #ddd' }}>Medium</td><td style={{ padding: '4px', border: '1px solid #ddd' }}>{difficultyDistribution[2] || 0} marks</td></tr>
                <tr><td style={{ padding: '4px', border: '1px solid #ddd' }}>Hard</td><td style={{ padding: '4px', border: '1px solid #ddd' }}>{difficultyDistribution[3] || 0} marks</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionCharts;