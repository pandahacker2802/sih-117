SOVARA AI — Complete Technical Overview

At a glance: SOVARA AI is organized as a local, multi-service AI workbench with a React/Vite frontend, Express/Node.js backend, Next.js AI-agent service, Python-based RAG pipeline, Ollama for local LLM inference, Chroma for vector search, and MongoDB for application data. The architecture keeps the major AI and data-processing components on the local environment.

1. Architecture

┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER · Port 5173                │
│            React 19 + Vite + Tailwind CSS + Framer Motion   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY & BACKEND LAYER (Port 5000)          │
│  Express.js + Node.js + MongoDB + JWT Authentication        │
└─────────────────────────────────────────────────────────────┘
         ↓                               ↓
┌────────────────────┐      ┌─────────────────────────────┐
│   AI Agent Layer   │      │   RAG/LLM System (Python)   │
│  (Port 3001)       │      │   • Ollama (Port 11434)     │
│  • Next.js 16      │      │   • Chroma DB               │
│  • TypeScript      │      │   • PyMuPDF/Tesseract       │
└────────────────────┘      └─────────────────────────────┘
         ↓                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                             │
│              MongoDB (Port 27017) + Docker                    │
└─────────────────────────────────────────────────────────────┘

2. Complete Tech Stack

2.1 Frontend Application

Location: sovara-ai

Component

Technology

Version

Framework

React

19.2.8

Build Tool

Vite

8.2.2

Language

JavaScript (ESM)

Latest

Routing

React Router DOM

7.18.2

Animations

Framer Motion

13.1.1

Icons

Lucide React

1.33.0

Styling

CSS (custom)

Modular

Linting

ESLint

10.9.0

Type Checking

None (plain JS)

—

Key Dependencies:

{
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-router-dom": "^7.18.2",
  "framer-motion": "^13.1.1",
  "lucide-react": "^1.33.0"
}

Dev Tools:

{
  "vite": "^8.2.2",
  "eslint": "^10.9.0",
  "@vitejs/plugin-react": "^6.1.0"
}

Port: 5173
Commands:

npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint

2.2 Backend API Server

Location: backend

Component

Technology

Version

Runtime

Node.js

14+

Framework

Express.js

5.2.1

Language

JavaScript (CommonJS)

Latest

Database

MongoDB + Mongoose

9.9.3

Authentication

JWT + Cookie-Parser

9.0.3 / 1.4.7

Security

Helmet, bcryptjs

8.3.0 / 3.0.3

Validation

Joi

18.2.5

Rate Limiting

express-rate-limit

8.6.2

File Uploads

Multer

2.2.0

CORS

cors

2.8.6

Config

dotenv

17.4.2

Testing

Jest, Supertest

30.4.2 / 7.2.2

Dependencies:

{
  "express": "^5.2.1",
  "mongoose": "^9.9.3",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "helmet": "^8.3.0",
  "express-rate-limit": "^8.6.2",
  "joi": "^18.2.5",
  "multer": "^2.2.0",
  "cors": "^2.8.6",
  "cookie-parser": "^1.4.7",
  "dotenv": "^17.4.2"
}

Dev Tools:

{
  "jest": "^30.4.2",
  "nodemon": "^3.1.14",
  "supertest": "^7.2.2"
}

Port: 5000
Commands:

npm install      # Install dependencies
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm test         # Run tests

Directory Structure:

src/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── config/
│   └── db.js              # MongoDB connection
├── models/                # Mongoose schemas (15 models)
│   ├── User.js
│   ├── Project.js
│   ├── File.js
│   ├── Analysis.js
│   ├── Report.js
│   ├── Notification.js
│   ├── AuditLog.js
│   ├── AgentPermission.js
│   ├── DataLineage.js
│   └── ... (10 more models)
├── routes/                # API endpoints
├── controllers/           # Business logic
├── services/              # Service layer
├── middleware/            # Auth, validation, error handling
├── validators/            # Input validation schemas
└── tests/                 # Test suite

2.3 AI Agent Service

Location: /AI Agent/

Component

Technology

Version

Framework

Next.js (App Router)

16.2.12

Language

TypeScript

5.x

HTTP Client

Axios

1.6.0

Config

dotenv

16.4.2

Styling

N/A (API focus)

—

Linting

ESLint

9.x

Dependencies:

{
  "next": "16.2.12",
  "axios": "^1.6.0",
  "dotenv": "^16.4.2"
}

Dev Tools:

{
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "19.2.18",
  "eslint": "^9",
  "eslint-config-next": "16.2.12"
}

Port: 3001
Commands:

npm run dev   # Start development server (port 3001)
npm run build # Build for production
npm start     # Start production server
npm run lint  # Run ESLint

Purpose:

AI content generation APIs

Integration with Ollama LLM

Request bridging between frontend and RAG system

2.4 RAG (Retrieval-Augmented Generation) System

Location: RAG

Component

Technology

Purpose

Language

Python 3.12

Main implementation

Embedding DB

Chroma

Vector storage & search

Document Processing

PyMuPDF, Pytesseract

PDF/OCR handling

LLM Interface

Ollama

Local inference engine

HTTP Requests

Requests library

API communication

Virtual Env

Python venv

Dependency isolation

Core Components:

RAG/
├── ingest.py              # File ingestion & chunking
├── extract_text.py        # Text extraction from PDFs
├── chunk_text.py          # Text chunking strategy
├── create_embeddings.py   # Generate embeddings
├── store_in_chroma.py     # Store vectors in Chroma
├── search.py              # Vector search functionality
├── rag_answer.py          # Generate answers using RAG
├── rag_tool.py            # Main RAG tool interface
├── rag_bridge.py          # Backend bridge/API wrapper
├── check_relevance.py     # Relevance scoring
├── chroma_db/             # Chroma vector database
│   └── chroma.sqlite3
├── requirements.txt       # Python dependencies
└── .venv/                 # Virtual environment

Python Dependencies (from requirements.txt):

chromadb             # Vector database
pymupdf              # PDF processing
pytesseract          # OCR for images
pillow               # Image processing
requests             # HTTP requests
pydantic             # Data validation
numpy                # Numerical computing
huggingface-hub      # Model downloads

Key Technologies:

Ollama: Local LLM inference (port 11434)

Model: gemma:2b (recommended)

Alternative: Any ONNX-compatible model

Chroma: Vector database for embeddings

PyMuPDF: Extract text from PDFs

Pytesseract: OCR for scanned documents

2.5 Database

Location: Docker container

Component

Technology

Database

MongoDB

Port

27017

Deployment

Docker

Version

Latest (mongo)

Database Models (15 total):

User              // Authentication & profiles
Project           // Project workspace
ProjectMember     // Project-user relationships
File              // Document metadata
Analysis          // AI analysis records
AgentRun          // AI agent execution logs
ToolExecution     // Tool/function calls
Report            // Generated reports
Notification      // User notifications
AuditLog          // Security audit trail
AgentPermission   // Agent capability controls
DataLineage       // Data flow tracking
SovereigntyMetric // Compliance metrics
PasswordResetToken// Password recovery

Docker Command:

docker run -d -p 27017:27017 --name mongodb mongo:latest

2.6 LLM Inference Engine

Location: Local Ollama installation

Component

Value

Engine

Ollama

Port

11434

Models

Gemma 2B (recommended)

Capabilities

Text generation, embeddings

Installation

ollama pull gemma:2b

API Usage:

# Generate text
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"gemma:2b","prompt":"Hello"}'

# Generate embeddings
curl -X POST http://localhost:11434/api/embed \
  -H "Content-Type: application/json" \
  -d '{"model":"nomic-embed-text","input":"text"}'

# List available models
curl http://localhost:11434/api/tags

3. Security & Authentication

Feature

Implementation

Password Hashing

bcryptjs (12 salt rounds)

Auth Token

JWT (JSON Web Tokens)

Token Storage

Secure HTTP-only cookies

Rate Limiting

express-rate-limit middleware

HTTP Security

Helmet (security headers)

CORS

Configured with credentials

Input Validation

Joi schema validation

Role-Based Access

Global roles (ADMIN, SUPERVISOR, EMPLOYEE) + Project roles

Audit Logging

AuditLog model tracks all actions

4. API Structure

Base URL: http://localhost:5000/api

Main Endpoint Categories:

/auth                    # Authentication (login, password reset)
/users                   # User management
/projects                # Project CRUD
/projects/:id/members    # Project membership
/projects/:id/files      # File management
/projects/:id/analyses   # AI analysis
/projects/:id/reports    # Report generation
/notifications           # User notifications
/audit                   # Audit logs

5. Service Ports

Service

Port

Technology

Status

Frontend

5173

React + Vite

http://localhost:5173

Backend API

5000

Express.js

http://localhost:5000/api

AI Agent

3001

Next.js

http://localhost:3001

Ollama LLM

11434

Ollama

http://localhost:11434

MongoDB

27017

MongoDB

localhost:27017

6. Deployment & Build

Frontend Build:

cd frontend/sovara-ai
npm run build    # Outputs: dist/

Backend Deployment:

cd backend
npm install --production
NODE_ENV=production npm start

AI Agent Build:

cd AI\ Agent
npm run build    # Outputs: .next/
npm start

Docker Containerization (MongoDB):

docker-compose up -d  # (if docker-compose.yml exists)
# OR manual:
docker run -d -p 27017:27017 --name mongodb mongo:latest

7. Data Flow

User Input (Frontend)
    ↓
React Component
    ↓
HTTP Request (Axios/Fetch)
    ↓
Backend API (Express)
    ↓
Authentication Middleware (JWT)
    ↓
Business Logic (Controllers/Services)
    ↓
Database Query (Mongoose/MongoDB)
    ↓
AI Processing (if needed)
    ├→ RAG System (Python)
    │   ├→ Document Ingestion
    │   ├→ Vector Embeddings (Chroma)
    │   └→ LLM Query (Ollama)
    └→ Response
    ↓
JSON Response
    ↓
Frontend State Update
    ↓
UI Render

8. Project Features

Feature

Backend

Frontend

AI Integration

User Authentication

✅ JWT + bcrypt

✅ Login form

—

Role-Based Access

✅ RBAC middleware

✅ Permission checks

—

Project Management

✅ CRUD operations

✅ Dashboard UI

—

File Upload

✅ Multer integration

✅ Upload component

—

Document Analysis

✅ Analysis model

✅ Analysis viewer

✅ Ollama

RAG Search

✅ API endpoint

✅ Search UI

✅ Chroma + RAG

Report Generation

✅ Report model

✅ Report approval

✅ AI-generated content

Notifications

✅ Notification model

✅ Notification center

—

Audit Logging

✅ AuditLog model

✅ Admin audit view

—

Human-in-the-Loop

✅ Review workflow

✅ Approvals page

✅ AI confidence scores

9. Testing Infrastructure

Backend Testing:

Test Runner: test_runner.js

Framework: Jest (installed but not configured)

Test Helper: Supertest (for HTTP testing)

Database: Uses test MongoDB instance

cd backend
node tests/test_runner.js  # Runs manual integration tests

Frontend Testing:

No test framework currently configured

Recommendation: Add Vitest + React Testing Library

10. Project Statistics

Metric

Count

Database Models

15

API Routes

30+

Frontend Components

~20

Backend Controllers

10

Backend Services

12+

Python RAG Modules

11

Total Dependencies

50+

11. Tech Stack Summary

FRONTEND               BACKEND              AI/LLM
─────────             ────────             ──────
React 19 ─────→ Express.js ─────→ Ollama (Gemma 2B)
Vite       │     Node.js      │    Chroma DB
  │        │       │          │      │
  └────────┴───────┴──────────┴──────┘
           (REST API - JSON)
           
DATABASE
────────
MongoDB 5.0+