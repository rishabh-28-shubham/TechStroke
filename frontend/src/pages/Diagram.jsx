import React from 'react';
import DiagramGenerator from '../components/DiagramGenerator/DiagramGenerator';

const Diagram = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Code Visualization</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Generate visual diagrams (flowcharts, UML) from your code or documentation using Mermaid.js
          </p>
          <DiagramGenerator />
        </div>
      </div>
    </div>
  );
};

export default Diagram;