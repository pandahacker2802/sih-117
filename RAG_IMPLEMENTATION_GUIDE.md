# RAG & AI Agent Integration Guide

Welcome! This guide is written to help you plug in your RAG (Retrieval-Augmented Generation) pipeline, Ollama, Gemma, or custom AI Agent model into this backend as easily as possible.

---

## 1. Where do I write my code?

Your primary integration boundary is in **one single file**:
`backend/src/services/ai/aiAdapter.js`

Open this file and you will see the `processAnalysis(payload)` method. Currently, it runs a test stub. You can replace the entire body of this method with your custom RAG / LLM orchestrator.

---

## 2. What parameters do I receive?

When the background worker picks up a queued analysis task, it invokes `aiAgentAdapter.processAnalysis(payload)` with a clean, fully-resolved payload.

### The `payload` Structure:
```javascript
{
  analysisId: "6a9055aa8a29155052f3cce2",   // Database ID of the analysis job
  type: "DOCUMENT",                         // Analysis type (DOCUMENT, IMAGE, MULTIMODAL, etc.)
  instruction: "Perform compliance scan",   // The operator's prompt/instruction
  inputFiles: [                             // Array of resolved file objects
    {
      fileId: "6a9050435ca4afbf481df485",   // MongoDB File ID
      filename: "sovereignty_guidelines.pdf",
      originalName: "sovereignty_guidelines.pdf",
      mimeType: "application/pdf",
      size: 2048500,
      storageKey: "uploads/project_alpha/sovereignty_guidelines.pdf",
      classification: "CONFIDENTIAL",       // Use this to filter out sensitive facts
      physicalPath: "C:\\...\\uploads\\project_alpha\\sovereignty_guidelines.pdf" // Absolute local path to file bytes
    }
  ]
}
```

---

## 3. Step-by-Step RAG Implementation Recipe

Here is a simple template to replace the stub in `backend/src/services/ai/aiAdapter.js`:

```javascript
const fs = require("fs");
// const { PDFParser } = require("some-pdf-parser"); // e.g., pdf-parse
// const { Ollama } = require("ollama"); // e.g., if using Ollama JS client

async function processAnalysis(payload) {
  const { instruction, inputFiles } = payload;
  
  // Step 1: Read the document text/bytes
  let documentTexts = [];
  for (const file of inputFiles) {
    // Read the physical file bytes from disk using physicalPath!
    const fileBuffer = fs.readFileSync(file.physicalPath);
    
    // Parse text (e.g. PDF text extraction, OCR, or direct text reading)
    let text = "";
    if (file.mimeType === "application/pdf") {
       // text = await parsePdfText(fileBuffer);
       text = "Parsed PDF text content goes here...";
    } else {
       text = fileBuffer.toString("utf-8");
    }
    documentTexts.push({ filename: file.filename, text });
  }

  // Step 2: Query your RAG Vector Database or compile the LLM context
  const contextText = documentTexts.map(d => `[Source: ${d.filename}]\n${d.text}`).join("\n\n");
  
  // Step 3: Send the instruction + context prompt to the LLM (e.g. Gemma/Ollama)
  const prompt = `
  You are a sovereignty compliance checker.
  Analyze the following document context:
  ---
  ${contextText}
  ---
  Operator Instruction: ${instruction}
  `;

  // const response = await ollama.generate({ model: 'gemma', prompt });
  // const aiTextResponse = response.response;
  const aiTextResponse = "Model summary output based on documents...";

  // Step 4: Return a structured result matching the database schema
  return {
    success: true,
    result: {
      piiDetected: false,        // Boolean indicator
      complianceScore: 95,       // Numerical rating (0-100)
      details: aiTextResponse,   // The core textual report shown in UI
    },
    agentPlan: {
      stepsRun: [
        "document_text_extraction", 
        "vector_search_enrichment", 
        "gemma_prompt_execution"
      ],
    }
  };
}
```

---

## 4. What output must my code return?

Your adapter method must resolve to an object with:
1. `success`: `true` (boolean). (If processing fails, throw an error inside the function; the worker will catch it and mark the task as `FAILED` automatically).
2. `result`:
   - `piiDetected`: `Boolean`
   - `complianceScore`: `Number` (0 to 100)
   - `details`: `String` (This markdown content is displayed on the main report and deliverables pages!)
3. `agentPlan`:
   - `stepsRun`: `Array<String>` (A list of tasks executed, e.g. `["ocr_scan", "pii_filter"]`, which is shown as chip badges on the Tasks page).

---

## 5. How do I test my implementation locally?

You can test your RAG pipeline locally in 3 steps:

### Step 1: Create a test document on disk
Create the missing local directory and write a dummy file:
* Directory: `backend/uploads/project_alpha/`
* Filename: `sovereignty_guidelines.pdf`

### Step 2: Start the servers
* Backend: Run `npm run dev` in `/backend` directory. (Starts server and the polling worker).
* Frontend: Run `npm run dev` in `/frontend/sovara-ai` directory.

### Step 3: Trigger analysis from Frontend or Test Script
* **Via Test Script:** Just run `node src/testWorker.js` in the `/backend` directory. It automatically queues jobs and reports whether your adapter returns the correct format.
* **Via Frontend UI:** Open `http://localhost:5174/`, navigate to **Tasks**, click **New Task**, fill in a prompt, and click submit. You can watch your worker pick it up in the console and view the final result on the UI.
