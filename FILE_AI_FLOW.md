# File Flow & AI/RAG Integration Architecture

This document reflects the **current, verified implementation** of the file upload and AI/RAG analysis pipeline.

---

## 1. Complete File Flow

```
Frontend
  → multipart/form-data (field: "file")
  → POST /api/projects/:projectId/files
  → authenticate middleware (JWT)
  → requireProjectAccess() middleware
  → upload.single("file") (multer, disk storage)
  → body-mapping middleware (sets originalName, mimeType, size, filename, storageKey)
  → validate(fileMetadataSchema) (Joi)
  → fileController.registerFile
  → fileService.registerFile
  → MongoDB: File document created (storageKey stored, NO file bytes)
  → Physical file saved at: uploads/<projectId>/<uniqueFilename>
  → Response: { success: true, data: { _id, storageKey, ... } }

Frontend
  → POST /api/projects/:projectId/analyses  { inputFiles: [fileId] }
  → MongoDB: Analysis document (status: QUEUED)

AnalysisWorker (polls every 5s)
  → Finds QUEUED analysis
  → Sets status: PROCESSING
  → For each fileId in inputFiles:
      File.findById(fileId) → storageKey
      physicalPath = path.resolve(process.cwd(), storageKey)
      fs.existsSync(physicalPath) → true/false
  → If file missing → FAILED ("physical file unavailable")
  → If file exists → AIAgentAdapter.processAnalysis(payload)
  → COMPLETED with result, or FAILED with error
```

---

## 2. File Upload Endpoint

| Property        | Value                                              |
| :-------------- | :------------------------------------------------- |
| **Endpoint**    | `POST /api/projects/:projectId/files`              |
| **Method**      | `POST`                                             |
| **Content-Type**| `multipart/form-data`                              |
| **Field name**  | `file` (the binary file field sent by FormData)    |
| **Auth**        | `Authorization: Bearer <JWT>`                      |

### Optional form field
| Field            | Type   | Description                                                           |
| :--------------- | :----- | :-------------------------------------------------------------------- |
| `classification` | string | `PUBLIC` \| `INTERNAL` \| `CONFIDENTIAL` \| `HIGHLY_CONFIDENTIAL` (default: `INTERNAL`) |

> All other metadata (`originalName`, `mimeType`, `size`, `filename`, `storageKey`) is derived **automatically** from the uploaded file — the client must NOT send them manually.

### Middleware Stack
1. `authenticate` — Verifies JWT, populates `req.user`
2. `requireProjectAccess()` — Confirms user is a project member
3. `upload.single("file")` — Multer parses the multipart request, saves file to disk
4. Body-mapping middleware — Maps `req.file` → `req.body` fields
5. `validate(fileMetadataSchema)` — Joi validates the mapped body
6. `fileController.registerFile` — Creates MongoDB document

---

## 3. Physical File Storage

- **Base directory:** `<backend_root>/uploads/`
- **Per-file path:** `uploads/<projectId>/<sanitizedBaseName>-<timestamp>-<random>.<ext>`
- **Example:** `uploads/6a93e6a88ccc40981059a0c8/report-1788077946034-iu84jo.pdf`
- **storageKey format:** `uploads/<projectId>/<uniqueFilename>` (relative to `process.cwd()`)

**Physical path resolution (used by worker):**
```js
const physicalPath = path.resolve(process.cwd(), file.storageKey);
// → C:\...\backend\uploads\<projectId>\<uniqueFilename>
```

**Path-traversal protection:**
- Filenames are sanitized: only `[a-zA-Z0-9.\-_]` are kept; all other characters become `_`
- `path.basename()` strips any directory components
- Unique timestamp+random suffix prevents collisions and accidental overwrites

**File size limit:** 100 MB (matching the Joi validator `MAX_FILE_SIZE_BYTES`)

---

## 4. What is Stored in MongoDB

MongoDB stores only **FILE METADATA** — no file bytes.

### File Schema (`src/models/File.js`)

| Field            | Type       | Description                                                                              |
| :--------------- | :--------- | :--------------------------------------------------------------------------------------- |
| `_id`            | `ObjectId` | Auto-generated unique file record identifier                                             |
| `projectId`      | `ObjectId` | Reference to `Project` (indexed)                                                         |
| `uploadedBy`     | `ObjectId` | Reference to `User` (indexed)                                                            |
| `filename`       | `String`   | Server-generated unique filename on disk                                                 |
| `originalName`   | `String`   | Original filename from the client                                                        |
| `mimeType`       | `String`   | MIME type detected from the upload (e.g. `application/pdf`)                              |
| `size`           | `Number`   | File size in bytes (from `req.file.size`)                                                |
| `storageKey`     | `String`   | **Relative path from `process.cwd()`** — `uploads/<projectId>/<filename>`               |
| `status`         | `String`   | `UPLOADED` → `PROCESSING` → `READY` / `FAILED` / `DELETED` (default: `UPLOADED`)        |
| `classification` | `String`   | `PUBLIC` / `INTERNAL` / `CONFIDENTIAL` / `HIGHLY_CONFIDENTIAL` (default: `INTERNAL`)    |
| `createdAt`      | `Date`     | Auto-generated                                                                           |
| `updatedAt`      | `Date`     | Auto-generated                                                                           |

---

## 5. File ID → storageKey → Physical Path (Contract)

```
MongoDB File._id
  ↓  (File.findById)
MongoDB File.storageKey   e.g. "uploads/6a93.../report-172....pdf"
  ↓  (path.resolve(process.cwd(), storageKey))
Absolute physical path    e.g. "C:\...\backend\uploads\6a93...\report-172....pdf"
  ↓  (fs.existsSync / fs.readFileSync)
Actual file bytes
```

This contract is implemented in `src/services/ai/analysisWorker.js` and must not be changed without updating both the upload middleware and the worker.

---

## 6. Backend → RAG / AI

- **Worker:** `src/services/ai/analysisWorker.js` — polls every 5 seconds for `QUEUED` analyses
- **Adapter:** `src/services/ai/aiAdapter.js` — integration boundary (stub → replace with real Ollama/RAG calls)
- **Worker picks up** `QUEUED` → sets `PROCESSING` → resolves files → calls `AIAgentAdapter.processAnalysis(payload)`
- **On success:** sets `COMPLETED` with `result` and `agentPlan`
- **On failure:** sets `FAILED` with `error.message` (e.g. `"physical file unavailable"`, `"File not found"`)
- **Payload to adapter:**
  ```json
  {
    "analysisId": "...",
    "type": "DOCUMENT",
    "instruction": "...",
    "inputFiles": [
      {
        "fileId": "...",
        "filename": "report-timestamp-rand.pdf",
        "originalName": "report.pdf",
        "mimeType": "application/pdf",
        "size": 1380,
        "storageKey": "uploads/<projectId>/<filename>",
        "status": "UPLOADED",
        "classification": "INTERNAL",
        "physicalPath": "C:\\...\\backend\\uploads\\<projectId>\\<filename>"
      }
    ]
  }
  ```

---

## 7. Authorization

```
Frontend → JWT (Bearer/Cookie) → authenticate middleware
         → requireProjectAccess() → checks ProjectMember collection
         → file controller → fileService
```

1. **Authentication:** All requests require a valid JWT.
2. **Project membership:** `requireProjectAccess()` checks `ProjectMember` table for `{ projectId, userId }`.
3. **Cross-project isolation:** `fileController.getFileById` verifies `file.projectId === req.params.projectId`.
4. **AI boundary:** Worker operates server-side; it never trusts client-supplied paths.

---

## 8. Frontend Integration

### Upload a file
```javascript
const formData = new FormData();
formData.append("file", fileInputElement.files[0]);
formData.append("classification", "INTERNAL"); // optional

const res = await fetch(`/api/projects/${projectId}/files`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
  // Do NOT set Content-Type — browser sets it with boundary automatically
});
const { data } = await res.json(); // data._id, data.storageKey
```

### Create analysis referencing the uploaded file
```javascript
await fetch(`/api/projects/${projectId}/analyses`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    type: "DOCUMENT",
    instruction: "Summarize this document.",
    inputFiles: [data._id],
  }),
});
```

---

## 9. RAG Developer Handoff

- **Physical file location:** Resolved by worker as `path.resolve(process.cwd(), file.storageKey)`
- **File field:** `storageKey` — relative path string stored in MongoDB
- **MIME type:** `mimeType` field — use to select parser (PDF, text, image, etc.)
- **Analysis status updates:** `PATCH /api/analyses/:analysisId/status`
- **Replace stub:** Edit `src/services/ai/aiAdapter.js` `processAnalysis()` method

---

## 10. Current Implementation Status

### Implemented & Verified ✅
- JWT authentication and project-membership-based endpoint authorization
- `POST /api/projects/:projectId/files` — real `multipart/form-data` upload via multer
- Physical file saved to `uploads/<projectId>/<uniqueFilename>` on the backend server disk
- `storageKey` deterministically maps to the physical file location
- MongoDB stores metadata only (no file bytes)
- Filename sanitization and path-traversal protection
- Unique filename generation (timestamp + random suffix) prevents collisions
- Orphaned-file cleanup on validation/registration failure
- `AnalysisWorker` — polls, resolves `File._id → storageKey → physicalPath`, dispatches to adapter
- `AIAgentAdapter` — stub bridge (returns structured result; replace with real RAG implementation)
- COMPLETED and FAILED status transitions with descriptive error messages
- Worker does not crash on missing files (graceful FAILED transition)
- All 29 integration tests passing
- Full E2E test: 23/23 assertions passing

### Pending (RAG team)
- Real RAG/LLM inference in `src/services/ai/aiAdapter.js`
- Vector store ingestion and embedding pipeline
- File serving endpoint (streaming `GET /api/projects/:projectId/files/:fileId/content`)
- Cloud/S3 storage migration (replace local disk storage if needed for production)
