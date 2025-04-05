const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to validate and clean Mermaid syntax
const validateAndCleanMermaidCode = (code, diagramType) => {
  // Remove any markdown code block syntax
  let cleanCode = code.replace(/```mermaid\n?/, '').replace(/```\n?$/, '').trim();

  // Add proper diagram type declaration if missing
  if (diagramType === 'flowchart' && !cleanCode.startsWith('flowchart')) {
    cleanCode = 'flowchart TD\n' + cleanCode;
  } else if (diagramType === 'sequence' && !cleanCode.startsWith('sequenceDiagram')) {
    cleanCode = 'sequenceDiagram\n' + cleanCode;
  } else if (diagramType === 'class' && !cleanCode.startsWith('classDiagram')) {
    cleanCode = 'classDiagram\n' + cleanCode;
  }

  // Basic syntax validation based on diagram type
  if (diagramType === 'flowchart') {
    // Ensure proper arrow syntax
    cleanCode = cleanCode.replace(/-->/g, '-->');
    cleanCode = cleanCode.replace(/=>/g, '-->')
    cleanCode = cleanCode.replace(/\s+-\s+/g, ' --> ');
  } else if (diagramType === 'sequence') {
    // Ensure proper arrow syntax for sequence diagrams
    cleanCode = cleanCode.replace(/->/g, '->');
    cleanCode = cleanCode.replace(/=>/g, '->');
    // Ensure proper participant declarations
    const lines = cleanCode.split('\n');
    const participants = new Set();
    const cleanLines = lines.map(line => {
      if (line.includes('->')) {
        const [from, rest] = line.split('->');
        participants.add(from.trim());
        if (rest) {
          participants.add(rest.split(':')[0].trim());
        }
      }
      return line;
    });
    const participantDeclarations = Array.from(participants)
      .map(p => `participant ${p}`)
      .join('\n');
    cleanCode = `sequenceDiagram\n${participantDeclarations}\n${cleanLines.join('\n')}`;
  } else if (diagramType === 'class') {
    // Ensure proper class relationship syntax
    cleanCode = cleanCode.replace(/extends/g, '<|--');
    cleanCode = cleanCode.replace(/implements/g, '<|..');
    cleanCode = cleanCode.replace(/has/g, '--*');
    cleanCode = cleanCode.replace(/uses/g, '..>');
  }

  return cleanCode;
};

const diagramController = {
  generateDiagram: async (req, res) => {
    try {
      const { files, diagramType } = req.body;

      if (!files || !diagramType) {
        return res.status(400).json({
          success: false,
          message: 'Repository files and diagram type are required'
        });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // First, generate documentation specifically for diagram generation
      const analysisPrompt = `Analyze the following repository structure and generate documentation specifically for creating a ${diagramType} diagram:

      Repository Structure:
      ${JSON.stringify(files, null, 2)}

      Please analyze and document:
      1. Main components and their relationships
      2. Data flow between components
      3. Key functions and their interactions
      4. Important classes and their methods
      5. Entry points and exit points
      6. Control flow and decision points
      7. External dependencies and integrations

      Focus on aspects that are relevant for creating a ${diagramType} diagram.`;

      const analysisResult = await model.generateContent(analysisPrompt);
      const analysisResponse = await analysisResult.response;
      const analysis = analysisResponse.text();

      // Then, generate the Mermaid diagram code with specific syntax rules
      const diagramPrompt = `Based on the following analysis, generate a ${diagramType} diagram using Mermaid.js syntax.
      Follow these strict syntax rules:

      ${diagramType === 'flowchart' ? `
      Flowchart Rules:
      1. Start with 'flowchart TD'
      2. Each node must have a unique ID
      3. Use proper arrow syntax: -->
      4. For decisions, use diamond shape: {condition}
      5. For processes, use rectangle: [process]
      6. For input/output, use parallelogram: [/input/]
      Example:
      flowchart TD
          A[Start] --> B{Is it?}
          B -->|Yes| C[OK]
          B -->|No| D[End]` :
      diagramType === 'sequence' ? `
      Sequence Diagram Rules:
      1. Start with 'sequenceDiagram'
      2. Declare all participants first
      3. Use '->>' for asynchronous messages
      4. Use '->' for synchronous messages
      5. Use '-->' for responses
      Example:
      sequenceDiagram
          participant A
          participant B
          A->>B: Request
          B-->>A: Response` :
      diagramType === 'class' ? `
      Class Diagram Rules:
      1. Start with 'classDiagram'
      2. Use proper relationship syntax:
         <|-- for inheritance
         <|.. for implementation
         --> for association
         --* for composition
      3. Methods must be properly formatted
      Example:
      classDiagram
          Animal <|-- Duck
          Animal : +String name
          Animal: +makeSound()` : ''}

      Generate ONLY the diagram code, no explanations.`;

      const diagramResult = await model.generateContent(diagramPrompt);
      const diagramResponse = await diagramResult.response;
      const mermaidCode = diagramResponse.text();

      // Clean and validate the Mermaid code
      const cleanMermaidCode = validateAndCleanMermaidCode(mermaidCode, diagramType);

      res.json({ 
        success: true,
        mermaidCode: cleanMermaidCode,
        analysis: analysis // Optional: include the analysis for reference
      });
    } catch (error) {
      console.error('Error generating diagram:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to generate diagram'
      });
    }
  }
};

module.exports = diagramController;
