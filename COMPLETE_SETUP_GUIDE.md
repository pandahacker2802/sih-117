# 🚀 SOVARA AI - Complete Setup & Deployment Guide

**Last Updated**: September 2, 2026  
**Project Version**: 1.0.0

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Service Startup](#service-startup)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)
8. [Docker Setup](#docker-setup)
9. [Environment Configuration](#environment-configuration)
10. [Database Setup](#database-setup)

---

## Prerequisites

### System Requirements

- **OS**: Linux/macOS/Windows (with WSL2)
- **Node.js**: v16+ (check: `node --version`)
- **npm**: v8+ (check: `npm --version`)
- **Python**: v3.10+ (for RAG system)
- **Docker**: v20+ (check: `docker --version`)
- **Git**: v2+ (check: `git --version`)

### Required Tools

```bash
# macOS (using Homebrew)
brew install node python@3.12 docker

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm python3 python3-pip docker.io

# Verify installations
node --version
npm --version
python3 --version
docker --version
```

### Optional but Recommended

- **Ollama**: For local LLM inference (https://ollama.ai)
- **MongoDB Compass**: GUI for MongoDB (https://www.mongodb.com/products/compass)
- **Postman/Insomnia**: API testing tools
- **VS Code**: Code editor with ES6/React extensions

---

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/utkarszz/sih-117.git
cd sih-117

# Run the complete setup script
bash setup.sh

# All services will start automatically!
```

**Expected Output**:
```
✅ MongoDB started on port 27017
✅ Backend API started on port 5000
✅ AI Agent started on port 3001
✅ Frontend started on port 5173
✅ All services ready!

Access the application at: http://localhost:5173
```

### Option 2: Docker Compose (Simplest)

```bash
cd sih-117

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: Manual Terminal Setup (Most Control)

See [Detailed Setup](#detailed-setup) section below.

---

## Detailed Setup

### Step 1: Environment Configuration

Create `.env` files in each service directory:

#### Backend `.env` (`/backend/.env`)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/sih26-117
MONGODB_DB_NAME=sih26-117

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# Security
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=./uploads

# AI Integration
OLLAMA_URL=http://localhost:11434/api
OLLAMA_MODEL=gemma:2b

# RAG System
RAG_PYTHON_PATH=/workspaces/sih-117/RAG
RAG_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend `.env` (`/frontend/sovara-ai/.env`)
```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_AI_AGENT_URL=http://localhost:3001/api
VITE_APP_NAME=SOVARA AI
```

#### AI Agent `.env` (`/AI Agent/.env`)
```bash
# Server
PORT=3001
NODE_ENV=development

# Backend Integration
BACKEND_URL=http://localhost:5000/api
OLLAMA_URL=http://localhost:11434/api

# RAG Integration
RAG_URL=http://localhost:5000/api/rag
```

### Step 2: Install Dependencies

```bash
# Terminal 1: Backend dependencies
cd /workspaces/sih-117/backend
npm install

# Terminal 2: Frontend dependencies
cd /workspaces/sih-117/frontend/sovara-ai
npm install

# Terminal 3: AI Agent dependencies
cd /workspaces/sih-117/AI\ Agent
npm install

# Terminal 4: RAG Python dependencies
cd /workspaces/sih-117/RAG
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Start MongoDB

```bash
# Option A: Docker (Recommended)
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Verify MongoDB is running
docker ps | grep mongodb

# Option B: Local MongoDB (if installed)
mongod --dbpath /data/db
```

### Step 4: Seed Initial Data (Optional)

```bash
cd /workspaces/sih-117/backend
node src/seed.js
```

**Expected Output**:
```
✅ Database connected
✅ Admin user created: admin@example.com
✅ Test data seeded successfully
```

---

## Service Startup

### Terminal 1: Start MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Terminal 2: Start Backend (Port 5000)
```bash
cd /workspaces/sih-117/backend
npm run dev
```

**Expected Output**:
```
[nodemon] starting `node src/server.js`
Server running on port 5000
MongoDB connected: localhost
✅ Backend ready at http://localhost:5000
```

### Terminal 3: Start AI Agent (Port 3001)
```bash
cd /workspaces/sih-117/AI\ Agent
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 16.2.12
  ▲ Local:        http://localhost:3001
  ✅ Ready in XXms
```

### Terminal 4: Start Frontend (Port 5173)
```bash
cd /workspaces/sih-117/frontend/sovara-ai
npm run dev
```

**Expected Output**:
```
  VITE v8.2.2  ready in XXXms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 5 (Optional): Start Ollama
```bash
# First, pull Gemma model
ollama pull gemma:2b

# Then start Ollama
ollama serve
```

**Expected Output**:
```
Listening on 127.0.0.1:11434
```

---

## Verification & Testing

### 1. Check All Services Are Running

```bash
# Check open ports
netstat -tuln | grep -E "5000|5173|3001|27017|11434"

# Or use lsof
lsof -i -P -n | grep LISTEN
```

### 2. Verify Backend Health

```bash
curl http://localhost:5000/health
# Expected: {"success":true,"message":"PS117 backend is running"}
```

### 3. Test API Authentication

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SystemAdmin@2026"
  }'

# Expected: JWT token in response
```

### 4. Test AI Agent

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Industrial Safety",
    "tone": "analytical",
    "useLLM": true
  }'

# Expected: {"success":true,"variations":[...]}
```

### 5. Test Ollama Integration

```bash
curl http://localhost:11434/api/tags

# Expected: Available models list including gemma:2b
```

### 6. Access Frontend

Open browser and navigate to: **http://localhost:5173**

**Login with preset accounts**:
- **Admin**: admin@example.com / SystemAdmin@2026
- **Supervisor**: supervisor@example.com / BobSupervisor@2026
- **Employee**: employee@example.com / JaneEmployee@2026

---

## Troubleshooting

### MongoDB Connection Error

```bash
# Problem: "MongooseError: Cannot connect to MongoDB"

# Solution 1: Check if MongoDB is running
docker ps | grep mongodb

# Solution 2: Restart MongoDB
docker stop mongodb
docker rm mongodb
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Solution 3: Check connection string in .env
# Should be: mongodb://localhost:27017/sih26-117
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Ollama Not Found

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Gemma model
ollama pull gemma:2b

# Start Ollama
ollama serve
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
cd /workspaces/sih-117/backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### RAG System Issues

```bash
# Activate Python venv
cd /workspaces/sih-117/RAG
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Reinstall Python dependencies
pip install -r requirements.txt --upgrade

# Test RAG
python3 rag_bridge.py < test_input.json
```

---

## Production Deployment

### Build Optimization

#### Frontend Production Build
```bash
cd /workspaces/sih-117/frontend/sovara-ai
npm run build
# Output: dist/ folder ready for deployment
```

#### Backend Production Setup
```bash
cd /workspaces/sih-117/backend
npm install --production
NODE_ENV=production npm start
```

#### AI Agent Production Build
```bash
cd /workspaces/sih-117/AI\ Agent
npm run build
NODE_ENV=production npm start
```

### Environment Variables for Production

Create `.env.production`:
```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/sih26-117
JWT_SECRET=<use-strong-random-secret>
BCRYPT_ROUNDS=12

# Frontend (Vite will pick up VITE_ prefix)
VITE_API_URL=https://api.yourdomain.com
VITE_AI_AGENT_URL=https://ai-agent.yourdomain.com

# Security
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Platforms

#### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create sih-117-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 2: AWS
```bash
# Use AWS Elastic Beanstalk
eb init
eb create sih-117-env
eb deploy
```

#### Option 3: DigitalOcean
```bash
# Use App Platform for easy deployment
# Connect GitHub repository at https://cloud.digitalocean.com/apps
```

---

## Docker Setup

### Single Service Docker Builds

#### Backend Dockerfile
```bash
cd /workspaces/sih-117/backend
docker build -t sih-117-backend .
docker run -p 5000:5000 sih-117-backend
```

#### Frontend Docker
```bash
cd /workspaces/sih-117/frontend/sovara-ai
docker build -t sih-117-frontend .
docker run -p 5173:5173 sih-117-frontend
```

#### AI Agent Docker
```bash
cd /workspaces/sih-117/AI\ Agent
docker build -t sih-117-ai-agent .
docker run -p 3001:3001 sih-117-ai-agent
```

### Docker Network Setup

```bash
# Create network
docker network create sih-117-network

# Run services on network
docker run -d --network sih-117-network --name mongodb mongo:latest

docker run -d \
  --network sih-117-network \
  -p 5000:5000 \
  --name backend \
  sih-117-backend

docker run -d \
  --network sih-117-network \
  -p 5173:5173 \
  --name frontend \
  sih-117-frontend
```

---

## Environment Configuration

### Complete Configuration Reference

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `MONGODB_URI` | Backend | `mongodb://localhost:27017/sih26-117` | Database connection string |
| `PORT` | Backend | `5000` | Backend server port |
| `NODE_ENV` | All | `development` | Environment mode |
| `JWT_SECRET` | Backend | *(required)* | JWT signing secret |
| `JWT_EXPIRY` | Backend | `7d` | Token expiration time |
| `OLLAMA_URL` | Backend/AI | `http://localhost:11434/api` | LLM service URL |
| `OLLAMA_MODEL` | Backend | `gemma:2b` | LLM model name |
| `VITE_API_URL` | Frontend | `http://localhost:5000/api` | API endpoint |
| `VITE_AI_AGENT_URL` | Frontend | `http://localhost:3001/api` | AI agent endpoint |
| `CORS_ORIGIN` | Backend | `http://localhost:5173` | Allowed CORS origin |
| `MAX_FILE_SIZE` | Backend | `52428800` | Max upload size (bytes) |
| `UPLOAD_DIR` | Backend | `./uploads` | File upload directory |

---

## Database Setup

### MongoDB Collections

```javascript
// Automatically created by Mongoose models:
Users              // User profiles & auth
Projects           // Project workspaces
ProjectMembers     // Project-user relationships
Files              // Document metadata
Analyses           // AI analysis records
Reports            // Generated reports
Notifications      // User notifications
AuditLogs          // Security audit trail
AgentRuns          // AI agent execution
ToolExecutions     // Tool/function calls
```

### Backup & Restore

```bash
# Backup MongoDB
mongodump --uri "mongodb://localhost:27017/sih26-117" \
  --out /backup/sih26-117

# Restore MongoDB
mongorestore --uri "mongodb://localhost:27017/sih26-117" \
  /backup/sih26-117/sih26-117

# Docker backup
docker exec mongodb \
  mongodump --out /backup
docker cp mongodb:/backup /local/path/backup
```

---

## Quick Reference Commands

```bash
# Development Setup
npm install                    # Install all dependencies
npm run dev                    # Start development servers

# Testing
npm test                       # Run test suite
npm run lint                   # Lint code

# Production Build
npm run build                  # Build for production
NODE_ENV=production npm start  # Run production

# Docker
docker-compose up -d           # Start with Docker
docker-compose logs -f         # View logs
docker-compose down            # Stop services

# Database
node src/seed.js               # Seed initial data
npm run db:backup              # Backup database
npm run db:restore             # Restore database
```

---

## Support & Debugging

### Enable Debug Logging

```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_DEBUG=true npm run dev

# RAG System
DEBUG=true python3 rag_bridge.py
```

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:5000/health

# MongoDB connection
curl http://localhost:5000/api/health/db

# AI Agent status
curl http://localhost:3001/api/health

# Ollama status
curl http://localhost:11434/api/tags
```

### Log Files

```bash
# Backend logs (if writing to file)
tail -f ./logs/backend.log

# Frontend build errors
npm run build 2>&1 | tee build.log

# MongoDB logs
docker logs mongodb
```

---

## Next Steps

1. ✅ Complete the setup using your preferred method
2. ✅ Verify all services are running
3. ✅ Login to the frontend application
4. ✅ Test file upload and AI analysis
5. ✅ Configure production environment variables
6. ✅ Set up monitoring and logging
7. ✅ Deploy to your hosting platform

---

## Resources

- **Documentation**: [README.md](README.md)
- **API Reference**: [Backend README](backend/README.md)
- **Frontend Guide**: [Frontend README](frontend/sovara-ai/README.md)
- **AI Agent Docs**: [AI Agent README](AI\ Agent/README.md)
- **Troubleshooting**: [CHATBOT_INTEGRATION_DEBUG.md](CHATBOT_INTEGRATION_DEBUG.md)

---

**Happy developing! 🚀**

For issues or questions, refer to the troubleshooting section or open a GitHub issue.
