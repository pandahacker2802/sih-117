# PS117 Industrial AI Workbench — Backend API

This repository contains the backend codebase for the PS117 Industrial AI Workbench. The system handles authentication, role-based access control, project isolation, document analysis lifecycles, human reviews, reporting, notifications, and security audit logs.

---

## 🛠️ Technology Stack

* **Runtime Environment**: Node.js
* **Backend Framework**: Express.js (v5.x)
* **Database & ORM**: MongoDB with Mongoose
* **Authentication**: JWT (JSON Web Tokens) + cookie-parser
* **Security & Middleware**:
  * `bcryptjs`: Password hashing
  * `helmet`: HTTP headers protection
  * `express-rate-limit`: Request rate limiting
  * `cors`: Cross-Origin Resource Sharing rules
* **Request Validation**: Joi
* **File Uploads**: Multer
* **Testing Infrastructure**: Lightweight, zero-dependency Node integration test runner (`tests/test_runner.js`)

---

## 🔑 Access Control Architecture

The system enforces a dual-layered security model:
1. **Global Roles** (`ADMIN`, `SUPERVISOR`, `EMPLOYEE`): Enforced via `requireRole` middleware.
2. **Project Roles** (`OWNER`, `MEMBER`, `REVIEWER`): Checked via `requireProjectAccess` middleware.

---

## 🌐 API Routes & Functions Mapping

All API endpoints are mounted under the `/api` prefix in Express.

### 1. Authentication (`/api/auth`)
Handles password state, logins, and identity tokens.
* `POST /login` $\rightarrow$ Logs in user, issues JWT token/cookie.
* `POST /change-password` $\rightarrow$ Updates current user password (must change on first login).
* `POST /forgot-password` $\rightarrow$ Requests password reset token.
* `POST /reset-password` $\rightarrow$ Resets password using token.

### 2. User Administration (`/api/users`)
*Requires ADMIN global role.*
* `POST /` $\rightarrow$ Creates new employee or supervisor user.
* `GET /` $\rightarrow$ Lists all system users with filters (role, department, activity status).
* `GET /:id` $\rightarrow$ Retrieves a single user profile.
* `PATCH /:id` $\rightarrow$ Updates user details.
* `PATCH /:id/activate` $\rightarrow$ Activates user login status.
* `PATCH /:id/deactivate` $\rightarrow$ Deactivates user login status.

### 3. Project Management (`/api/projects`)
* `POST /` $\rightarrow$ Creates a new project (Creator is assigned Owner).
* `GET /` $\rightarrow$ Lists all active projects where the logged-in user is a member.
* `GET /:projectId` $\rightarrow$ Returns detailed project profile (Requires project access).
* `PATCH /:projectId` $\rightarrow$ Updates project title/details (Requires Project `OWNER`).
* `PATCH /:projectId/archive` $\rightarrow$ Archives the project (Requires Project `OWNER`).

### 4. Project Membership (`/api/projects/:projectId/members`)
* `POST /` $\rightarrow$ Adds a new user to the project (Requires Project `OWNER`).
* `GET /` $\rightarrow$ Lists all members of a project (Requires project access).
* `PATCH /:userId` $\rightarrow$ Updates member's project role (Requires Project `OWNER`).
* `DELETE /:userId` $\rightarrow$ Removes member from project (Requires Project `OWNER`).

### 5. File Metadata Management (`/api/projects/:projectId/files` & `/api/files`)
* `POST /projects/:projectId/files` $\rightarrow$ Registers new file metadata under project (Requires project access).
* `GET /projects/:projectId/files` $\rightarrow$ Lists all file metadata inside project (Requires project access).
* `GET /projects/:projectId/files/:fileId` $\rightarrow$ Retrieves specific file profile (Requires project access).
* `PATCH /files/:fileId/status` $\rightarrow$ Sets file processing status to `READY`/`FAILED` (*Requires ADMIN*).
* `DELETE /files/:fileId` $\rightarrow$ Removes file metadata (*Requires ADMIN*).

### 6. Document Analysis (`/api/projects/:projectId/analyses` & `/api/analyses`)
* `POST /projects/:projectId/analyses` $\rightarrow$ Initiates AI analysis on registered files (Requires project access).
* `GET /projects/:projectId/analyses` $\rightarrow$ Lists analysis records for project (Requires project access).
* `GET /projects/:projectId/analyses/:analysisId` $\rightarrow$ Gets full analysis run details (Requires project access).
* `PATCH /analyses/:analysisId/status` $\rightarrow$ Updates status to `COMPLETED`/`FAILED` (*Requires ADMIN*).
* `POST /projects/:projectId/analyses/:analysisId/cancel` $\rightarrow$ Cancels active run (Requires project access).
* `POST /projects/:projectId/analyses/:analysisId/retry` $\rightarrow$ Retries a failed analysis (Requires project access).

### 7. Review & Reporting (`/api/projects/:projectId/reports`)
* `POST /projects/:projectId/reports` $\rightarrow$ Compiles analysis results into report draft (Requires project access).
* `GET /projects/:projectId/reports` $\rightarrow$ Lists reports (Requires project access).
* `GET /projects/:projectId/reports/:reportId` $\rightarrow$ Gets specific report details (Requires project access).
* `PATCH /projects/:projectId/reports/:reportId` $\rightarrow$ Updates report draft content (Requires Project `OWNER`).
* `POST /projects/:projectId/reports/:reportId/submit` $\rightarrow$ Submits draft for review (Requires Project `OWNER` or `MEMBER`).
* `POST /projects/:projectId/reports/:reportId/approve` $\rightarrow$ Approves report and locks it (Requires Project `REVIEWER` or `OWNER`).
* `POST /projects/:projectId/reports/:reportId/reject` $\rightarrow$ Rejects report, returns to draft state (Requires Project `REVIEWER` or `OWNER`).

### 8. System Notifications (`/api/notifications`)
* `GET /` $\rightarrow$ Fetches logged-in user's notifications.
* `PATCH /read-all` $\rightarrow$ Marks all of the user's notifications as read.
* `PATCH /:notificationId/read` $\rightarrow$ Marks a single notification as read.
* `DELETE /:notificationId` $\rightarrow$ Deletes a notification entry.

### 9. Security Audit Logging (`/api/audit`)
*Requires ADMIN global role.*
* `GET /` $\rightarrow$ Gets global system audit logs with filters (user, action, date ranges).
* `GET /projects/:projectId` $\rightarrow$ Gets audit trails scoped to a specific project.
