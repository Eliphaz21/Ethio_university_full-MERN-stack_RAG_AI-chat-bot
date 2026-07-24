# Ethio University Portal — Docker Deployment & Operations Guide

This repository contains production-grade Docker containerization for the full-stack Ethio University application.

---

## 🏗️ Architecture Overview

The multi-container Docker setup includes:

1. **Frontend Container (`ethiouni_frontend`)**:
   - Multi-stage build with `node:20-alpine` (Vite SPA compilation) and `nginx:1.25-alpine` (production web server).
   - Nginx handles client-side React router fallback (`/index.html`) and proxies `/api/*` requests to the backend.
   - Built-in Gzip compression and HTTP security headers (`nosniff`, `SAMEORIGIN`, `X-XSS-Protection`).

2. **Backend Container (`ethiouni_backend`)**:
   - Multi-stage build with `node:20-alpine` compiling TypeScript to ESM JavaScript (`dist/`).
   - Runs as non-root user `USER node` for security.
   - Built-in Docker healthcheck monitoring `http://localhost:5000/api/health`.

3. **Database Container (`ethiouni_mongodb`)**:
   - MongoDB 6 (`mongo:6-jammy`) with healthcheck (`mongosh`) and named volume persistence (`mongo-data`).

4. **Network & Bridge**:
   - Shared isolated bridge network `ethiouni-network`.

---

## 🚀 Quick Start (Production Setup)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine (v20.10+) with Docker Compose plugin (`docker compose`).

### Step 1: Clone & Configure Environment
Create your `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` to populate your secret keys:
```env
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key
VOYAGE_API_KEY=your_voyage_api_key
```

### Step 2: Build and Start Containers

Run Docker Compose to build images and launch services:

```bash
docker compose up -d --build
```

### Step 3: Verify Container Status

Check running services:

```bash
docker compose ps
```

Expected Output:
```
NAME               STATUS                    PORTS
ethiouni_backend   Up (healthy)             0.0.0.0:5000->5000/tcp
ethiouni_frontend  Up (healthy)             0.0.0.0:80->80/tcp
ethiouni_mongodb   Up (healthy)             0.0.0.0:27017->27017/tcp
```

Access the application in your browser:
- **Frontend Portal**: `http://localhost`
- **Backend Health Check**: `http://localhost/api/health`

---

## 💻 Development Setup (Live Hot-Reloading)

To run in development mode with live code reloading:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## 🧹 Maintenance & Operations

### View Container Logs
```bash
# All logs
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# Frontend Nginx logs only
docker compose logs -f frontend
```

### Stop Services
```bash
docker compose down
```

### Stop Services & Remove Persistent Volumes (Clean Reset)
```bash
docker compose down -v
```
