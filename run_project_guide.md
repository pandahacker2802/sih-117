# SIH-117 Quick Start Guide

Complete setup and run guide for the entire microservices architecture.

## 📋 Prerequisites

Ensure these are installed:
- **Node.js** v14+ (check: `node --version`)
- **Docker** (for MongoDB)
- **Ollama** (for Gemma 2B LLM)
- **Git** (for version control)

## 🚀 Quick Start (Run All Services)

### Option 1: Run in Separate Terminals (Recommended)

**Terminal 1 - Start MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
# Verify: docker ps | grep mongodb
```

**Terminal 2 - Start Backend (Port 5000):**
```bash
cd /workspaces/sih-117/backend
npm install
node src/server.js
# Expected: "Server running on port 5000" + "MongoDB connected: localhost"
```

**Terminal 3 - Start AI Agent (Port 3001):**
```bash
cd /workspaces/sih-117/AI\ Agent
npm install
npm run dev
# Expected: "Ready in XXXms" at http://localhost:3001
```

**Terminal 4 - Start Frontend (Port 5173):**
```bash
cd /workspaces/sih-117/frontend/sovara-ai
npm install
npm run dev
# Expected: "VITE vX.X.X ready in XXXms" at http://localhost:5173
```

**Terminal 5 - Start Ollama (Optional, for LLM):**
```bash
ollama serve
# Expected: "Listening on 127.0.0.1:11434"
# Note: Make sure Gemma 2B is pulled first:
# ollama pull gemma:2b
```

### Option 2: One-Command Setup (Using Shell Script)

Create `run_all.sh`:
```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting SIH-117 Services...${NC}\n"

# Check if MongoDB is running
if ! docker ps | grep -q mongodb; then
    echo -e "${BLUE}📦 Starting MongoDB...${NC}"
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    sleep 2
fi

# Start Backend
echo -e "${BLUE}🔧 Starting Backend (Port 5000)...${NC}"
cd /workspaces/sih-117/backend
npm install --silent
node src/server.js &
BACKEND_PID=$!
sleep 3

# Start AI Agent
echo -e "${BLUE}🤖 Starting AI Agent (Port 3001)...${NC}"
cd /workspaces/sih-117/AI\ Agent
npm install --silent
npm run dev &
AI_AGENT_PID=$!
sleep 3

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (Port 5173)...${NC}"
cd /workspaces/sih-117/frontend/sovara-ai
npm install --silent
npm run dev &
FRONTEND_PID=$!
sleep 3

# Start Ollama (Optional)
echo -e "${BLUE}🦙 Checking Ollama...${NC}"
if ! pgrep -f "ollama serve" > /dev/null; then
    if command -v ollama &> /dev/null; then
        ollama serve &
        OLLAMA_PID=$!
        sleep 3
    fi
fi

echo -e "${GREEN}✅ All services started!${NC}\n"
echo "📍 Access URLs:"
echo "   Backend:   http://localhost:5000"
echo "   Frontend:  http://localhost:5173"
echo "   AI Agent:  http://localhost:3001"
echo "   Ollama:    http://localhost:11434"
echo ""
echo "⏸️  Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
```

Run it:
```bash
bash run_all.sh
```

## 📍 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main dashboard & workspace |
| **Backend API** | http://localhost:5000/api | REST API endpoints |
| **AI Agent** | http://localhost:3001 | LLM integration service |
| **Ollama** | http://localhost:11434 | Local LLM inference engine |
| **MongoDB** | localhost:27017 | Database (Docker) |

## 🔑 Test Credentials

After first run, login with these credentials:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | SystemAdmin@2026 | Admin |
| supervisor@example.com | BobSupervisor@2026 | Supervisor |
| employee@example.com | JaneEmployee@2026 | Employee |

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:5000/health | jq
# Expected: {"success":true,"message":"PS117 backend is running"}
```

### 2. Test API Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SystemAdmin@2026"}' | jq
# Expected: JWT token and user data
```

### 3. Test AI Agent
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Hello Gemma","tone":"analytical","useLLM":true}' | jq
# Expected: {"success":true,"variations":[...],"llmUsed":true}
```

### 4. Check Ollama
```bash
curl http://localhost:11434/api/tags | jq
# Expected: List of available models including gemma:2b
```

### 5. Frontend Test
- Open http://localhost:5173 in browser
- Should auto-login as Admin
- Dashboard should display with metrics
- Navigate to "AI Workspace" tab
- Submit a prompt to test Gemma integration

## 🐛 Troubleshooting

### MongoDB Not Starting
```bash
# Check if port is in use
lsof -i :27017
# Kill existing process if needed
kill -9 <PID>
# Start fresh
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Port Already in Use
```bash
# Find and kill processes on specific ports
lsof -i :5000 -i :3001 -i :5173 -i :11434 | grep -v COMMAND | awk '{print $2}' | sort -u | xargs kill -9
```

### Backend Not Connecting to MongoDB
- Verify MongoDB is running: `docker ps | grep mongodb`
- Check .env file: `cat backend/.env | grep MONGODB_URI`
- Should be: `MONGODB_URI=mongodb://localhost:27017/sih-117`

### Frontend Not Connecting to Backend
- Check .env: `cat frontend/sovara-ai/.env | grep VITE_API_URL`
- Should be: `VITE_API_URL=http://localhost:5000/api` (with /api suffix)

### Gemma/Ollama Not Responding
```bash
# Check if Ollama is running
pgrep -f "ollama serve"
# If not running, start it
ollama serve

# Check if Gemma model is pulled
ollama list
# If not present, pull it
ollama pull gemma:2b
```

### Node/npm Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Project Structure

```
/workspaces/sih-117/
├── backend/              # Node.js Express REST API (Port 5000)
│   ├── src/
│   │   ├── server.js    # Entry point
│   │   ├── app.js       # Express setup
│   │   ├── config/      # Database config
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API endpoints
│   │   ├── controllers/ # Business logic
│   │   └── services/    # Service layer
│   └── .env             # Backend config
│
├── frontend/            # React + Vite UI (Port 5173)
│   └── sovara-ai/
│       ├── src/
│       │   ├── pages/   # React components
│       │   ├── api.js   # API client
│       │   └── App.jsx  # Main component
│       └── .env         # Frontend config
│
├── AI Agent/            # Next.js Backend Service (Port 3001)
│   ├── app/
│   │   └── api/generate/ # LLM endpoint
│   └── .env             # AI Agent config
│
└── QUICK_START.md       # This file!
```

## 🔧 Environment Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sih-117
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d
LLM_TYPE=gemma
LLM_ENDPOINT=http://localhost:11434
AI_AGENT_URL=http://localhost:3001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_AI_AGENT_URL=http://localhost:3001
VITE_LLM_ENDPOINT=http://localhost:11434
VITE_LLM_ENABLED=true
```

### AI Agent (.env)
```
PORT=3001
NODE_ENV=development
LLM_TYPE=gemma
LLM_ENDPOINT=http://localhost:11434
BACKEND_URL=http://localhost:5000
```

## 🎯 Next Steps

1. **Access Dashboard**: Open http://localhost:5173
2. **Login**: Use credentials above
3. **Create Project**: Create your first project
4. **Upload File**: Try uploading a file for analysis
5. **Test AI Workspace**: Submit prompts to Gemma LLM
6. **View Reports**: Generate and view analysis reports

## 📞 Support

For issues or questions:
1. Check logs: `tail -f backend/logs/*.log`
2. Verify services: `curl http://localhost:5000/health`
3. Check MongoDB: `docker logs mongodb`
4. Review .env files: Ensure all URLs are correct

## 🎉 You're All Set!

Your SIH-117 application is now running with full microservices architecture:
- ✅ Backend API (Node.js + Express)
- ✅ Frontend UI (React + Vite)
- ✅ AI Agent Service (Next.js)
- ✅ Local LLM (Gemma 2B via Ollama)
- ✅ Database (MongoDB)

Happy coding! 🚀
