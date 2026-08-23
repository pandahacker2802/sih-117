## Backend Development Progress

### Current Status

The initial database model layer has been completed.

The `src/models/` directory contains the application's core data models required for users, projects, files, analysis workflows, reports, notifications, auditing, AI permissions, data lineage, and sovereignty tracking.

At this stage, only the data/model layer has been implemented. Authentication, controllers, routes, services, middleware, AI integration, and RAG are not implemented yet.

---

## Models

### `User.js`

Represents users registered in the system.

It stores user identity and account-related information such as employee ID, name, email, department, role, account status, first-login status, and login information.

Supported global roles:

- `EMPLOYEE`
- `SUPERVISOR`
- `ADMIN`

The model also keeps track of who created the account and whether the account is active.

Password hashing is intentionally not handled inside the model. It will be implemented in the authentication layer.

---

### `Project.js`

Represents a workspace/project in which industrial tasks and analyses are performed.

A project contains information such as its name, description, department, creator, and current status.

Projects can be:

- `ACTIVE`
- `ARCHIVED`

A project acts as the main container for files, analyses, reports, and project members.

---

### `ProjectMember.js`

Represents the relationship between a user and a project.

It determines which users have access to a particular project and what role they have inside that project.

Supported project-level roles:

- `OWNER`
- `MEMBER`
- `REVIEWER`

Global user roles and project-level roles are intentionally separated.

A compound uniqueness rule prevents the same user from being added to the same project multiple times.

---

### `File.js`

Represents metadata for files uploaded to a project.

The model stores information such as:

- Project association
- Uploading user
- Original filename
- Stored filename
- MIME type
- File size
- Storage reference
- Processing status
- Data classification

The actual file binary is not stored inside the database. The model only maintains the metadata and reference required to locate the file in storage.

File classifications:

- `PUBLIC`
- `INTERNAL`
- `CONFIDENTIAL`
- `HIGHLY_CONFIDENTIAL`

File processing states:

- `UPLOADED`
- `PROCESSING`
- `READY`
- `FAILED`
- `DELETED`

The classification system will later be used by the security/AI access-control layer.

---

### `Analysis.js`

Represents an analysis task created by a user inside a project.

An analysis connects:

- A project
- The user who created it
- Input files
- User instructions
- Analysis type
- Execution status
- Agent plan
- Final result
- Error information
- Execution timestamps

Supported analysis types include:

- `DOCUMENT`
- `IMAGE`
- `MULTIMODAL`
- `GENERAL`

Analysis lifecycle:

`QUEUED → PROCESSING → COMPLETED`

or

`QUEUED → PROCESSING → FAILED`

This model only stores the analysis workflow data. It does not implement AI, RAG, or model inference.

---

### `AgentRun.js`

Represents an execution instance associated with an analysis.

An analysis represents the overall task, while an agent run represents the execution of that task.

It stores:

- Analysis reference
- Execution status
- Agent plan
- Final output
- Start/end timestamps

Supported states:

- `QUEUED`
- `PLANNING`
- `EXECUTING`
- `COMPLETED`
- `FAILED`

The actual agent implementation will be handled separately.

---

### `ToolExecution.js`

Represents an individual tool execution performed during an agent run.

It provides a way to track:

- Which agent run triggered the tool
- Which tool was used
- Tool input
- Tool output
- Execution status
- Start/end timestamps

Supported states:

- `PENDING`
- `RUNNING`
- `COMPLETED`
- `FAILED`

This model only records tool execution information. It does not implement the tools themselves.

---

### `Report.js`

Represents a report generated from an analysis.

A report contains:

- Project association
- Related analysis
- Creator
- Title
- Summary
- Findings
- Recommendations
- Review status
- Reviewer information
- Review comments
- Review timestamp

Report lifecycle:

`DRAFT → PENDING_REVIEW → APPROVED`

or

`DRAFT → PENDING_REVIEW → REJECTED`

This supports the human-in-the-loop workflow where AI-generated results can be reviewed and approved by an authorized human.

---

### `Notification.js`

Represents notifications sent to users when important system events occur.

Examples include:

- Analysis completion
- Report approval
- Report rejection
- Project assignment
- Account creation
- System notifications

Notifications contain the target user, notification type, message, optional related resource, and read/unread state.

---

### `AuditLog.js`

Represents security and activity records for important system operations.

It can track events such as:

- Successful/failed login
- User creation
- User updates
- Account disabling
- Role changes
- File uploads/deletions
- Analysis creation
- AI execution events
- Report creation
- Report approval/rejection

Audit logs provide traceability by recording who performed an action, what resource was affected, when it happened, and whether the operation succeeded or failed.

---

### `AgentPermission.js`

Represents temporary permissions granted to an agent for a specific analysis.

It supports the Agent Permission Passport concept.

Permissions can control whether an agent may:

- Read internal reports
- Use local RAG
- Run code in a sandbox
- Use OCR
- Analyze images
- Create files
- Access the internet
- Access external APIs
- Perform external exports

Permissions are associated with an analysis and user and include an expiration time and revocation state.

The model only stores permission state. Permission enforcement will be implemented later through backend security middleware/services.

---

### `DataLineage.js`

Represents the provenance of information used to produce an analysis result.

It can record the sequence of processing stages involved in an analysis, such as:

`Source Document → OCR → RAG Retrieval → Model Inference → Tool Execution → Verification → Output Generation`

This allows the system to maintain traceability between source information and the final output.

The model stores lineage information only. The actual processing pipeline will be implemented separately.

---

### `SovereigntyMetric.js`

Represents sovereignty/security-related metrics for an analysis.

It tracks whether important requirements were satisfied, including:

- Local inference
- Local storage
- Zero external calls
- Sandbox execution
- RAG grounding
- Audit logging
- Human approval

It also stores an overall sovereignty score.

The model provides the data structure for sovereignty measurement. The logic used to calculate the final score will be implemented later.

---

## Model Relationships

The main data relationships currently follow this structure:

User  
→ creates/manages Projects

Project  
→ contains Project Members  
→ contains Files  
→ contains Analyses  
→ contains Reports

Analysis  
→ references input Files  
→ can have an Agent Run  
→ can produce a Report  
→ can have Agent Permissions  
→ can have Data Lineage  
→ can have Sovereignty Metrics

Agent Run  
→ contains Tool Executions

User  
→ receives Notifications  
→ generates Audit Logs

---

## Current Architecture Boundary

### Implemented

- Mongoose database schemas
- Data validation rules
- Enumerated states/roles
- Model relationships
- Database references
- Relevant indexes
- File classification structure
- Agent permission structure
- Data lineage structure
- Sovereignty metric structure

### Not Implemented Yet

- Authentication
- Password hashing logic
- Login/logout
- Authorization middleware
- Role-based access control
- Project APIs
- File upload APIs
- Analysis APIs
- Report APIs
- Notification services
- Audit logging services
- AI integration
- RAG
- Local LLM integration
- Multimodal inference
- Agent implementation
- Tool implementation
- Sandbox execution

These will be implemented in subsequent backend layers.

---

## Next Development Stage

The next stage is the `config/` layer.

The first task will be establishing the application's database connection and configuration foundation before moving to middleware, validators, services, controllers, and routes.

---

## Configuration & Application Setup

The initial backend configuration and application startup layer has been completed.

### `src/config/db.js`

Responsible for establishing the connection between the backend application and MongoDB.

The database connection is handled separately from the application logic so that database configuration remains centralized and reusable.

The connection uses the `MONGODB_URI` environment variable.

If the database connection fails, the server does not continue running.

---

### `src/app.js`

Responsible for creating and configuring the Express application.

The application currently includes:

- Helmet for basic HTTP security headers
- CORS configuration
- JSON request body parsing
- URL-encoded request body parsing
- Cookie parsing
- Basic health-check endpoint

The health-check endpoint is:

`GET /health`

It confirms that the Express application is running correctly.

The Express application is exported from this file rather than starting the server directly.

This separation allows the application configuration and server startup logic to remain independent.

---

### `src/server.js`

Responsible for starting the backend server.

The startup flow is:

`Load Environment Variables → Load Express App → Connect to MongoDB → Start HTTP Server`

The server reads the port from the `PORT` environment variable.

The database connection is established before the HTTP server starts accepting requests.

This prevents the application from starting normally when the required database connection cannot be established.

---

## Environment Variables

The backend currently uses the following environment variables:

- `PORT` — Port on which the Express server runs.
- `NODE_ENV` — Current application environment.
- `MONGODB_URI` — MongoDB connection string.
- `JWT_SECRET` — Secret used for authentication token signing/verification.
- `JWT_EXPIRES_IN` — Authentication token expiration duration.

The actual `.env` file contains local secrets and must never be committed to the repository.

`.env.example` contains the required variable names without exposing any secrets.

---

## Current Backend Startup Flow

The backend currently follows this structure:

Frontend / Client
        ↓
    Express App
        ↓
 Middleware & Request Parsing
        ↓
     API Routes
        ↓
    Controllers
        ↓
     Services
        ↓
      Models
        ↓
     MongoDB

Server startup is handled separately:

`server.js`
        ↓
`config/db.js`
        ↓
MongoDB Connection
        ↓
`app.js`
        ↓
Express Server

---

## Current Development Status

### Completed

- Project folder structure
- Package installation
- Environment configuration
- MongoDB connection configuration
- Express application setup
- Server startup
- Health-check endpoint
- Security middleware setup
- Request body parsing
- Cookie parsing
- Core database models
- Model relationships and references
- File classification structure
- Agent permission structure
- Data lineage structure
- Sovereignty metric structure

### Not Implemented Yet

- Authentication
- Login/logout
- Password hashing
- JWT authentication middleware
- Authorization
- Role-based access control
- Project APIs
- Project member APIs
- File upload APIs
- Analysis APIs
- Report APIs
- Notification services
- Audit logging services
- AI service integration
- RAG integration
- Local LLM integration
- Multimodal AI integration
- Agent implementation
- Tool implementation
- Sandbox execution

---

## Current Backend Architecture

backend/
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── ProjectMember.js
│   │   ├── File.js
│   │   ├── Analysis.js
│   │   ├── AgentRun.js
│   │   ├── ToolExecution.js
│   │   ├── Report.js
│   │   ├── Notification.js
│   │   ├── AuditLog.js
│   │   ├── AgentPermission.js
│   │   ├── DataLineage.js
│   │   ├── SovereigntyMetric.js
│   │   └── index.js
│   │
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md