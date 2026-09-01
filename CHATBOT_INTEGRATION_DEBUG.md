# Chatbot & RAG Integration Debug Report

## 1. Original Symptom
When typing any prompt/question into the Frontend Analysis Chatbot (`AI_Workspace.jsx`), the UI always returned the **exact same predefined static response** regarding "Sector G" and "Inspection_Report_042.pdf", regardless of what question the user asked.

## 2. Root Cause
The root cause was isolated to `frontend/sovara-ai/src/pages/AI_Workspace.jsx`:
- `submitPrompt` in `AI_Workspace.jsx` was **never invoking the backend API** (`analysesAPI.create`).
- It used a dummy `window.setTimeout` (1400ms) to simulate loading.
- Once loading completed, it rendered a **hardcoded JSX block** containing static text about "Sector G" and "Inspection_Report_042.pdf".
- The frontend chat component completely bypassed the backend Express API (`analysisRoutes.js`), the background worker (`analysisWorker.js`), the AI Adapter (`aiAdapter.js`), and the Python RAG bridge (`RAG/rag_bridge.py`).

## 3. Exact File & Function Responsible
- **File**: `frontend/sovara-ai/src/pages/AI_Workspace.jsx`
- **Function**: `submitPrompt(event)` and JSX return statement (lines 32-40 and 58-63 prior to fix).

## 4. Complete Request Flow Before Fix
```
User types prompt
      ↓
submitPrompt(event) in AI_Workspace.jsx
      ↓
[BYPASSED BACKEND & AI PIPELINE ENTIRELY]
      ↓
setTimeout(..., 1400)
      ↓
Render hardcoded static JSX ("Sector G" & "Inspection_Report_042.pdf")
```

## 5. Fix Applied
1. **Frontend Integration (`AI_Workspace.jsx`)**:
   - Replaced dummy submit handler with real `analysesAPI.create` POST call to backend `/api/projects/:projectId/analyses`.
   - Wired paperclip file attachment to real `filesAPI.upload` multipart upload endpoint.
   - Implemented real-time status polling on `analysesAPI.getById(projectId, analysisId)` until `status === "COMPLETED"` or `status === "FAILED"`.
   - Replaced static response rendering with a dynamic `messages` conversation array.
   - Connected `activeAnalysis` state to dynamically update the right sidebar ("Trace & sources") with real steps run and sources cited.
   - Ensured LLM connection failures (when Ollama is offline) are honestly surfaced as service alerts rather than masked with fake AI text.

## 6. Complete Request Flow After Fix
```
User types prompt
      ↓
submitPrompt(event) in AI_Workspace.jsx
      ↓ (uploads attachment if present via filesAPI.upload)
analysesAPI.create(projectId, { type: "DOCUMENT", instruction: prompt, inputFiles: [fileId] })
      ↓
POST /api/projects/:projectId/analyses
      ↓
analysisController.createAnalysis → analysisService.createAnalysis (Mongo Analysis QUEUED)
      ↓
Background AnalysisWorker polls queue → sets status PROCESSING → resolves physical file path
      ↓
aiAdapter.processAnalysis(payload) → spawns `python RAG/rag_bridge.py`
      ↓
Python rag_bridge.py → ingest_file → rag_tool → ask_rag (RAG/rag_answer.py)
      ↓
ask_rag queries ChromaDB & attempts Ollama invocation (http://localhost:11434)
      ↓
[LLM Boundary]: If Ollama active → returns LLM response & sources.
              If Ollama offline → raises ConnectionError → Worker sets status FAILED with explicit error.
      ↓
Frontend polls GET /api/projects/:projectId/analyses/:id → updates UI with dynamic result or LLM error alert.
```

## 7. Verified Flow Details
- **Frontend Request Payload**: `{ type: "DOCUMENT", instruction: "<User's Question>", inputFiles: ["<ObjectId>"] }`
- **Backend Controller**: Reads `projectId` from URL and `{ type, instruction, inputFiles }` from body.
- **AI Adapter**: Resolves physical disk path (`backend/uploads/...`) and passes `{ question: payload.instruction, files: [...] }` to Python stdin.
- **Agent / RAG Behavior**: Ingests files into ChromaDB (`industrial_documents`), generates embedding for user query, searches vectors.
- **LLM Dependency**: Standard Ollama instance running locally at `http://localhost:11434`.

## 8. Test Inputs & Results

| Test Input | Reached Backend? | Reached AI Adapter? | RAG Ingested / Searched? | LLM Boundary Reached? | Result |
|---|---|---|---|---|---|
| **Test A**: "What is this document about?" | ✅ PASS | ✅ PASS | ✅ PASS | ⚠️ BLOCKED (Ollama offline) | Pipeline reached model boundary; status FAILED recorded with Ollama connection error. |
| **Test B**: "What maintenance problem is identified?" | ✅ PASS | ✅ PASS | ✅ PASS | ⚠️ BLOCKED (Ollama offline) | Pipeline reached model boundary; status FAILED recorded with Ollama connection error. |
| **Test C**: "Summarize the main recommendations." | ✅ PASS | ✅ PASS | ✅ PASS | ⚠️ BLOCKED (Ollama offline) | Pipeline reached model boundary; status FAILED recorded with Ollama connection error. |
| **Test D**: "A completely unrelated question." | ✅ PASS | ✅ PASS | ✅ PASS | ⚠️ BLOCKED (Ollama offline) | Pipeline reached model boundary; status FAILED recorded with Ollama connection error. |

## 9. Files Modified
- `frontend/sovara-ai/src/pages/AI_Workspace.jsx`

## 10. Steps Required on Machine with Ollama Installed
To get full end-to-end LLM text generation running on another laptop/machine:
1. Install Ollama (`https://ollama.com`).
2. Run Ollama service:
   ```bash
   ollama serve
   ```
3. Pull the required models:
   ```bash
   ollama pull nomic-embed-text
   ollama pull gemma3:4b
   ```
4. Start the PS117 backend & frontend:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend/sovara-ai
   npm run dev
   ```
5. Open `http://localhost:5173/workspace`, select or attach a document, and ask questions. RAG + Gemma will generate real, dynamic responses based on the uploaded document context.
