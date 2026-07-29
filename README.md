# EthioUni Portal

EthioUni Portal is a full-stack university directory and AI assistant built with React, Express, MongoDB Atlas Vector Search, Voyage AI, Gemini, and Cloudinary.

## Project structure

```text
ethiouni-portal/
|-- frontend/
|   |-- public/assets/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   `-- types.ts
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- tsconfig.json
|   `-- vite.config.ts
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- types/
|   |   `-- server.ts
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- package.json
`-- README.md
```

## Local setup

1. Install both applications with `npm run install:all`.
2. Create `frontend/.env` and `backend/.env` from their example files.
3. Start the backend with `npm run dev:backend`.
4. In another terminal, start the frontend with `npm run dev:frontend`.

The frontend runs at `http://localhost:3000`. The backend defaults to `http://localhost:5001`, and its health check is available at `GET /api/health`.

## Build and start

Build both applications from the repository root:

```bash
npm run build
```

The frontend output is written to `frontend/dist/`. The backend output is written to `backend/dist/` and can be started with `npm start`.

## API groups

- Authentication and profiles: `/api/auth`
- Universities: `/api/universities`
- Chat and history: `/api/chat`
- Administration: `/api/admin`
- Service health: `/api/health`

## Environment and external services

Backend secrets belong only in `backend/.env`. Never add MongoDB, JWT, Voyage, Gemini, or Cloudinary credentials to frontend code.

University images are uploaded to Cloudinary. The application logo remains at `frontend/public/assets/logo.png` because it is a static interface asset, not uploaded university content.

MongoDB Atlas requires a vector search index named `vector_index` on the `knowledges.embedding` field with 1024 dimensions and cosine similarity. See `backend/README.md` for the detailed RAG flow.
