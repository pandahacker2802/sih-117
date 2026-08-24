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

---

## Middleware Layer

The middleware layer has now been implemented.

It sits between incoming HTTP requests and the application's controllers/services and is responsible for authentication, authorization, project-level access control, and centralized error handling.

The middleware layer does not contain business logic.

---

### `src/middleware/authMiddleware.js`

Responsible for authenticating users making protected requests.

The middleware:

- Reads the JWT from the Authorization header or token cookie.
- Verifies the JWT using the configured JWT secret.
- Retrieves the corresponding user from the database.
- Verifies that the user exists.
- Verifies that the user account is active.
- Excludes the user's password hash from the retrieved user data.
- Attaches the authenticated user to `req.user`.
- Rejects invalid or unauthorized requests with `401 Unauthorized`.

The middleware does not handle login or JWT generation. Those responsibilities will be implemented in the authentication service/controller layer.

---

### `src/middleware/roleMiddleware.js`

Responsible for global role-based authorization.

The middleware provides a reusable `requireRole()` function that accepts one or more allowed roles.

Supported global roles:

- `EMPLOYEE`
- `SUPERVISOR`
- `ADMIN`

Example usage:

`requireRole("ADMIN")`

or:

`requireRole("ADMIN", "SUPERVISOR")`

The middleware depends on `authenticate` having already populated `req.user`.

If the authenticated user's role is not permitted, the request is rejected with `403 Forbidden`.

---

### `src/middleware/projectAccessMiddleware.js`

Responsible for project-level authorization.

Global user roles and project-level roles are treated separately.

The middleware checks the `ProjectMember` collection to verify that the authenticated user has access to the requested project.

Supported project-level roles:

- `OWNER`
- `MEMBER`
- `REVIEWER`

The middleware:

- Reads the project ID from the request.
- Finds the user's project membership.
- Rejects users without project access.
- Optionally checks allowed project-level roles.
- Attaches the membership record to `req.projectMember`.

This prevents project access logic from being duplicated across controllers.

---

### `src/middleware/errorMiddleware.js`

Provides centralized error handling for the Express application.

The middleware:

- Handles errors using Express error middleware conventions.
- Converts known errors into appropriate HTTP status codes.
- Returns a consistent JSON response format.
- Handles common Mongoose errors.
- Prevents stack traces and sensitive internal information from being exposed to clients.
- Logs appropriate error information on the server.

Supported error categories include:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

The error handler is intended to be registered after all routes.

---

### `src/middleware/index.js`

Acts as the central export point for the middleware layer.

It exports:

- `authenticate`
- `requireRole`
- `requireProjectAccess`
- `errorHandler`

This allows future routes to import middleware from a single location.

---

## Middleware Request Flow

Protected requests will follow this general flow:

`Request → Authentication → Authorization → Project Access Check → Validation → Controller → Service`

For example:

`Request → authenticate → requireRole → controller`

For project-specific resources:

`Request → authenticate → requireProjectAccess → controller`

Errors are handled centrally by:

`Controller/Service → errorHandler → Response`

---

## Middleware Security Principles

### Authentication

Determines:

**Who is making the request?**

User identity is obtained from the verified JWT and corresponding database record.

---

### Global Authorization

Determines:

**What is this user allowed to do globally?**

This uses the user's global role:

- `EMPLOYEE`
- `SUPERVISOR`
- `ADMIN`

---

### Project Authorization

Determines:

**Does this user have access to this specific project?**

This uses the `ProjectMember` relationship rather than relying only on the user's global role.

---

### Secure User Context

The authenticated user attached to `req.user` does not include the stored password hash.

Sensitive authentication information is never exposed unnecessarily to downstream application logic.

---

## Current Backend Development Status

### Completed

- Project folder structure
- Package installation
- Environment configuration
- MongoDB connection
- Express application setup
- Server startup
- Health-check endpoint
- Core database models
- Model relationships and references
- File classification structure
- Agent permission structure
- Data lineage structure
- Sovereignty metric structure
- Authentication middleware foundation
- Global role-based authorization
- Project-level authorization
- Centralized error handling

### Not Implemented Yet

- Login
- Logout
- User creation/activation
- Password hashing
- JWT generation
- Password reset
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

## Next Development Stage

The next stage is the validation layer.

The validation layer will ensure that incoming request data is checked before reaching controllers and services.

It will cover validation for:

- Authentication requests
- Users
- Projects
- Project members
- Files
- Analyses
- Reports
- Other API inputs as required

The goal is to reject invalid or unsafe input early and keep controllers focused on application logic.
---

## Validator Layer

The request validation layer has been implemented using Joi.

The validator layer sits between authentication/authorization middleware and controllers. Its responsibility is to verify that incoming request data has the correct structure, type, format, and allowed values before it reaches application business logic.

Validators do not:

- Access the database
- Authenticate users
- Authorize users
- Perform business logic
- Hash passwords
- Generate or verify JWTs
- Execute AI/RAG operations

The intended request flow is:

`Request → Authentication → Authorization → Validation → Controller → Service → Model/Database`

---

### `src/validators/authValidator.js`

Validates authentication-related request data.

Schemas:

- `loginSchema`
- `changePasswordSchema`
- `forgotPasswordSchema`
- `resetPasswordSchema`

The schemas validate email format, password presence, password confirmation, and reset-token input.

Password hashing and authentication logic are handled outside the validator layer.

The validators also do not check whether an email exists in the database.

---

### `src/validators/userValidator.js`

Validates user creation and update requests.

Schemas:

- `createUserSchema`
- `updateUserSchema`

Supported global roles:

- `EMPLOYEE`
- `SUPERVISOR`
- `ADMIN`

Sensitive/internal fields such as `passwordHash`, `createdBy`, `lastLoginAt`, and timestamps are not accepted from client input.

User existence and authorization checks are handled by the service and middleware layers.

---

### `src/validators/projectValidator.js`

Validates project creation and update requests.

Schemas:

- `createProjectSchema`
- `updateProjectSchema`

Supported project statuses:

- `ACTIVE`
- `ARCHIVED`

The validator checks project field structure and allowed values but does not determine whether the authenticated user is allowed to modify the project.

---

### `src/validators/projectMemberValidator.js`

Validates project membership requests.

Schemas:

- `addProjectMemberSchema`
- `updateProjectMemberSchema`

Supported project-level roles:

- `OWNER`
- `MEMBER`
- `REVIEWER`

MongoDB ObjectIds are validated for correct format.

The validator does not check whether the user/project exists or whether duplicate membership already exists. These checks belong to the service layer.

---

### `src/validators/fileValidator.js`

Validates file-related request metadata.

Schema:

- `fileMetadataSchema`

The schema validates:

- Project ID
- Filename
- Original filename
- MIME type
- File size

The current schema applies a 100 MB request-level size limit.

Actual multipart file processing, MIME detection, malware scanning, and storage operations are handled outside the validator layer.

---

### `src/validators/analysisValidator.js`

Validates analysis creation and retry requests.

Schemas:

- `createAnalysisSchema`
- `retryAnalysisSchema`

Supported analysis types:

- `DOCUMENT`
- `IMAGE`
- `MULTIMODAL`
- `GENERAL`

Analysis instructions are validated for type and length, while input file references are validated as MongoDB ObjectIds.

The validator does not verify file existence, execute AI/RAG, or create agent runs.

---

### `src/validators/reportValidator.js`

Validates report creation and review requests.

Schemas:

- `createReportSchema`
- `reviewReportSchema`
- `reportEntrySchema`

Report findings and recommendations are validated as structured entries.

Review status is restricted to:

- `APPROVED`
- `REJECTED`

Client requests cannot directly provide internal fields such as:

- `reviewedBy`
- `reviewedAt`
- `createdBy`
- `projectId`
- `analysisId`

These values are determined by the authenticated backend workflow.

---

### `src/validators/index.js`

Acts as the central export point for all validator schemas.

This allows controllers and routes to import schemas from one location rather than importing each validator file separately.

---

## MongoDB ObjectId Validation

A shared validation approach is used to verify MongoDB ObjectId format without querying the database.

ObjectId validation is currently applied to:

- Project member user IDs
- File project IDs
- Analysis input file IDs
- Analysis retry IDs

This only verifies that the ID has a valid format.

Whether the referenced resource actually exists is determined later by the service layer.

---

## Validation Security Principles

The validator layer does not trust client-supplied values for security-sensitive fields such as:

- User roles
- `createdBy`
- `reviewedBy`
- Project membership
- Account status
- Password hashes
- Audit information
- Lineage information
- AI execution state

The separation of responsibilities is:

**Validation:** Is the input structurally valid?

**Authentication:** Who is the user?

**Authorization:** Is the user allowed to perform this action?

**Service:** Is the requested operation valid according to business rules?

---

## Validator Layer Status

### Completed

- Authentication request schemas
- User request schemas
- Project request schemas
- Project membership schemas
- File metadata validation
- Analysis request schemas
- Report request schemas
- MongoDB ObjectId format validation
- Enum/value validation
- Sensitive-field protection
- Central validator exports

### Remaining

- Reusable `validate(schema)` Express middleware wrapper

The reusable validation middleware will connect Joi schemas to Express request handling and return `400 Bad Request` responses when validation fails.

This will be completed before the service layer is started.

---

## Current Backend Development Status

### Completed

- Project folder structure
- Package installation
- Environment configuration
- MongoDB connection
- Express application setup
- Server startup
- Health-check endpoint
- Core database models
- Model relationships and references
- File classification
- Agent permission structure
- Data lineage structure
- Sovereignty metric structure
- Authentication middleware
- Global role-based authorization
- Project-level authorization
- Centralized error handler
- Joi validation schemas

### Not Implemented Yet

- Reusable validation middleware
- Authentication services
- User services
- Project services
- File services
- Analysis services
- Report services
- Notification services
- Audit services
- Controllers
- Routes
- AI/RAG integration
- Local LLM integration
- Multimodal AI integration
- Agent implementation
- Tool implementation
- Sandbox execution

---

## Next Development Stage

The next stage is to complete the reusable validation middleware and then begin the **service layer**.

The service layer will contain the actual backend business logic and database operations.

Controllers will later remain thin and delegate business operations to services.

---

## Service Layer

The service layer has now been implemented.

The service layer sits between controllers and the database and contains the application's business logic and database operations.

Services are intentionally independent of HTTP, Express request/response objects, Joi validation, authentication middleware, and AI execution.

The intended architecture is:

`Request → Route → Middleware → Validator → Controller → Service → Model → Database`

---

### `src/services/authService.js`

Handles authentication business logic.

Implemented operations:

- Login
- Change password
- Forgot password
- Reset password

The login flow:

`Find User → Check Account → Compare Password → Update Last Login → Generate JWT → Return Sanitized User`

Security measures include:

- Password hashes are never returned.
- Generic authentication errors are used to reduce user enumeration.
- Passwords are hashed using bcrypt.
- JWT generation is handled by the service layer.
- Password reset tokens are stored separately from the User document.

---

### `src/services/userService.js`

Handles user account management.

Implemented operations:

- Create user
- Get user by ID
- Get users with filtering and pagination
- Update user
- Activate user
- Deactivate user

The service prevents duplicate employee IDs and email addresses.

Sensitive fields such as `passwordHash` are excluded from user-facing responses.

---

### `src/services/projectService.js`

Handles project/workspace business logic.

Implemented operations:

- Create project
- Get project by ID
- Get projects with filtering and pagination
- Update project
- Archive project

The creator identity is obtained from trusted backend context rather than client-provided data.

Projects are archived by changing their status rather than physically deleting them.

---

### `src/services/projectMemberService.js`

Handles project membership.

Implemented operations:

- Add member
- Get project members
- Update member role
- Remove member

Supported project roles:

- `OWNER`
- `MEMBER`
- `REVIEWER`

The service verifies project/user existence and prevents duplicate memberships.

Authorization remains the responsibility of middleware.

---

### `src/services/fileService.js`

Handles file metadata and lifecycle management.

Implemented operations:

- Register uploaded file metadata
- Get file metadata
- Get project files
- Update file status
- Soft-delete file metadata

Supported file states:

- `UPLOADED`
- `PROCESSING`
- `READY`
- `FAILED`
- `DELETED`

Supported classifications:

- `PUBLIC`
- `INTERNAL`
- `CONFIDENTIAL`
- `HIGHLY_CONFIDENTIAL`

The service does not perform multipart parsing, OCR, embeddings, RAG, AI processing, cloud storage, or malware scanning.

Those responsibilities will be handled by their respective layers later.

---

### `src/services/analysisService.js`

Handles the analysis/task lifecycle.

Implemented operations:

- Create analysis
- Get analysis
- Get project analyses
- Update analysis status
- Cancel analysis
- Retry analysis

Analysis lifecycle:

`QUEUED → PROCESSING → COMPLETED`

or:

`QUEUED → PROCESSING → FAILED`

Retrying a failed analysis creates a new analysis record while preserving the original history.

The service does not execute AI, RAG, LLMs, or agent orchestration.

---

### `src/services/reportService.js`

Handles report generation records and human approval workflows.

Implemented operations:

- Create report
- Get report
- Get project reports
- Update report
- Submit for review
- Approve report
- Reject report

Report lifecycle:

`DRAFT → PENDING_REVIEW → APPROVED`

or:

`DRAFT → PENDING_REVIEW → REJECTED`

Reviewer information is always taken from trusted backend context.

Clients cannot directly set fields such as `reviewedBy` or `reviewedAt`.

---

### `src/services/notificationService.js`

Handles application-level notification records.

Implemented operations:

- Create notification
- Get user notifications
- Mark notification as read
- Mark all notifications as read
- Delete notification

Notifications can later be triggered by events such as:

- Analysis completion
- Report approval
- Report rejection
- Project membership changes
- Account events

External email/notification delivery is not implemented yet.

---

### `src/services/auditService.js`

Handles audit logging.

Implemented operations:

- Create audit log
- Get audit logs
- Get project-related audit activity

Audit metadata is sanitized before storage to prevent sensitive information such as passwords, tokens, secrets, and JWT secrets from being persisted.

Audit records are intended to be created by trusted backend workflows rather than directly from client input.

---

## Password Reset Token Model

A dedicated:

`src/models/PasswordResetToken.js`

model was introduced instead of adding reset-token fields to the User model.

The model stores:

- `userId`
- `hashedToken`
- `expiresAt`
- `used`
- timestamps

The raw reset token is never stored in the database.

The reset token is hashed before persistence and checked against the stored hash during password reset.

### Automatic Token Cleanup

The `expiresAt` field uses a MongoDB TTL index.

Expired password-reset token documents are therefore automatically removed by MongoDB.

The TTL mechanism is used for storage cleanup only.

The authentication service still verifies token validity and expiration before allowing a password reset.

---

## Service Layer Architecture

The service layer follows a strict separation of responsibilities:

### Middleware

Handles:

- Authentication
- Authorization
- Project access

### Validators

Handle:

- Request structure
- Input types
- Required fields
- Allowed values
- Input format

### Controllers

Will handle:

- HTTP request extraction
- Calling services
- HTTP responses

### Services

Handle:

- Business logic
- Database operations
- Application workflows
- State transitions

### Models

Handle:

- Database document structure
- Mongoose-level validation
- Database relationships

---

## AI Boundary

The service layer intentionally does NOT implement:

- RAG
- Local LLM execution
- Multimodal inference
- OCR
- Embeddings
- Vector databases
- Agent orchestration
- Model routing
- Model registry
- AI tools
- Sandbox execution
- AI Trust Firewall
- Agent Permission Passport
- Sovereignty score calculation
- Data lineage generation

These will be integrated later through dedicated AI/security service boundaries.

The current backend services provide the application-level foundation required for those integrations.

---

## Service Layer Security Principles

The following principles are enforced across the service layer:

- No `req` or `res` objects inside services.
- No HTTP status codes inside services.
- No duplicate Joi validation.
- No duplicate authorization logic.
- No password hashes in user-facing responses.
- Client input is not trusted for internal ownership fields.
- Sensitive audit metadata is sanitized.
- Password reset tokens are stored as hashes.
- Expired password-reset records are automatically cleaned through TTL.
- Business rules are kept separate from request handling.

---

## Current Backend Development Status

### Completed

- Project folder structure
- Package installation
- Environment configuration
- MongoDB connection
- Express application setup
- Server startup
- Health-check endpoint
- Core database models
- Model relationships and references
- File classification
- Agent permission structure
- Data lineage structure
- Sovereignty metric structure
- Authentication middleware
- Global role-based authorization
- Project-level authorization
- Centralized error handling
- Joi validation schemas
- Reusable validation middleware
- Authentication services
- User services
- Project/workspace services
- Project membership services
- File metadata services
- Analysis lifecycle services
- Report and approval services
- Notification services
- Audit services
- Password reset token model
- Password reset token hashing
- Password reset token expiry
- MongoDB TTL cleanup for expired reset tokens
- Central service exports

### Not Implemented Yet

- Controllers
- Routes
- Route registration in `app.js`
- Actual multipart upload handling
- Physical file storage integration
- Email delivery
- AI service integration
- RAG integration
- Local LLM integration
- Multimodal AI integration
- Agent orchestration
- Tool execution
- Sandbox execution
- AI security enforcement
- Integration testing
- End-to-end testing

---

## Next Development Stage

The next stage is the **Controller Layer**.

Controllers will connect incoming HTTP requests to the service layer.

The intended flow will become:

`Route → Middleware → Validator → Controller → Service → Model`

Controllers will remain thin and will not contain business logic.

---

## Current Architecture Progress

`Models → Config → App/Server → Middleware → Validators → Services → Controllers → Routes → Integration → Testing`

Current status:

- Models: **Complete**
- Config: **Complete**
- App/Server: **Complete**
- Middleware: **Complete**
- Validators: **Complete**
- Services: **Complete**
- Controllers: **Next**
- Routes: **Pending**
- Integration: **Pending**
- Testing: **Pending**

---

## Controller Layer

The controller layer has now been implemented.

Controllers act as the HTTP-facing layer between middleware/routes and the service layer.

The controller responsibility is intentionally limited to:

1. Extracting data from the HTTP request
2. Calling the appropriate service
3. Returning the HTTP response
4. Forwarding errors to the centralized error handler

Controllers do NOT contain business logic.

The request flow is:

`Request → Route → Middleware → Validator → Controller → Service → Model → MongoDB`

---

### `src/controllers/authController.js`

Handles authentication-related HTTP operations.

Implemented controllers:

- `login`
- `changePassword`
- `forgotPassword`
- `resetPassword`

Authenticated user identity is taken from `req.user` where required.

The forgot-password endpoint always returns a generic success response regardless of whether the email exists, preventing user enumeration at the HTTP layer.

---

### `src/controllers/userController.js`

Handles user-management HTTP operations.

Implemented controllers:

- `createUser`
- `getUserById`
- `getUsers`
- `updateUser`
- `activateUser`
- `deactivateUser`

Query parameters are parsed before being passed to the service layer.

Security-sensitive identity fields are never trusted from client input.

---

### `src/controllers/projectController.js`

Handles project/workspace HTTP operations.

Implemented controllers:

- `createProject`
- `getProjectById`
- `getProjects`
- `updateProject`
- `archiveProject`

For project creation, `createdBy` is always taken from the authenticated user:

`req.user._id`

It is never taken from client-provided request data.

---

### `src/controllers/projectMemberController.js`

Handles project membership operations.

Implemented controllers:

- `addMember`
- `getProjectMembers`
- `updateMemberRole`
- `removeMember`

Project and user identifiers are taken from validated route parameters/request data.

Authorization remains the responsibility of middleware.

The remove-member operation expects:

`/:projectId/members/:userId`

---

### `src/controllers/fileController.js`

Handles file metadata lifecycle operations.

Implemented controllers:

- `registerFile`
- `getFileById`
- `getProjectFiles`
- `updateFileStatus`
- `deleteFileMetadata`

The authenticated user's ID is used as `uploadedBy`.

Actual multipart file handling is intentionally not implemented yet.

When Multer is introduced, uploaded file metadata will move from `req.body` to `req.file`. The service/model architecture does not need to change.

---

### `src/controllers/analysisController.js`

Handles analysis/task lifecycle operations.

Implemented controllers:

- `createAnalysis`
- `getAnalysisById`
- `getProjectAnalyses`
- `updateAnalysisStatus`
- `cancelAnalysis`
- `retryAnalysis`

Analysis creation uses the authenticated user's identity.

Retry returns `201 Created` because a new analysis record is created.

`updateAnalysisStatus` is intended to be restricted to appropriate internal/system roles through route-level authorization.

No AI, RAG, LLM, or agent execution is performed by the controller.

---

### `src/controllers/reportController.js`

Handles report and human-review operations.

Implemented controllers:

- `createReport`
- `getReportById`
- `getProjectReports`
- `updateReport`
- `submitForReview`
- `approveReport`
- `rejectReport`

Reviewer identity is always taken from:

`req.user._id`

Only the validated review comment is accepted from the request body during approval/rejection.

Report state transitions remain inside `reportService`.

---

### `src/controllers/notificationController.js`

Handles user notification operations.

Implemented controllers:

- `getUserNotifications`
- `markAsRead`
- `markAllAsRead`
- `deleteNotification`

All operations use:

`req.user._id`

The client cannot specify another user's ID for notification operations.

---

### `src/controllers/auditController.js`

Provides read-only access to audit information.

Implemented controllers:

- `getAuditLogs`
- `getProjectAuditActivity`

There is intentionally no public audit-log creation endpoint.

Audit records are generated internally by backend services and workflows.

---

## Controller Design Principles

Controllers are intentionally thin.

They do NOT:

- Query MongoDB directly
- Use Mongoose models directly
- Perform password hashing
- Compare passwords
- Generate JWTs
- Perform Joi validation
- Perform authorization
- Implement business rules
- Execute AI
- Execute RAG
- Execute LLMs
- Perform file storage operations

Instead:

### Middleware

Determines:

- Who the user is
- Whether authentication is valid
- Whether the user has permission

### Validator

Determines:

- Whether incoming data has the correct structure
- Whether required fields exist
- Whether values have valid types/formats
- Whether enum values are allowed

### Controller

Determines:

- What HTTP request was received
- Which service should handle it
- What HTTP response should be returned

### Service

Determines:

- What the application should actually do
- What business rules apply
- What database operations are required
- What state transitions are allowed

### Model

Determines:

- How data is structured
- Mongoose-level constraints
- Database indexes and relationships

---

## Response Format

Controllers use a consistent response envelope.

Successful responses:

```json
{
  "success": true,
  "data": {}
}