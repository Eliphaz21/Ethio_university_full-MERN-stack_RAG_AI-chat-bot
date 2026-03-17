# 🇪🇹 Ethio University Portal  
### MERN Stack + MongoDB Vector Search + RAG + Gemini AI

EthioUni Portal is a full-stack MERN application that provides a modern university listing platform integrated with an AI-powered chatbot.

The chatbot uses **Retrieval-Augmented Generation (RAG)** with **MongoDB Atlas Vector Search** to provide context-aware answers based strictly on uploaded knowledge documents.

This project demonstrates secure authentication, AI integration, vector databases, document processing, and real-world backend architecture.
CSEC ASTU Dev Division - Project 
---

#  Tech Stack

##  Frontend
- React (Vite + TypeScript)
- Tailwind CSS
- Axios
- Protected Routes
- Floating AI Chat Widget

##  Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Multer (file upload)
- pdf-parse (PDF extraction)

##  AI & Vector Search
- Gemini 2.5 Flash (LLM)
- Voyage AI (`voyage-large-2-instruct`) for embeddings (1024 dimensions)
- MongoDB Atlas Vector Search (Cosine similarity)

---
#How the website look like
 ##This how login page look like
 <img width="2214" height="1249" alt="Screenshot 2026-02-14 233702" src="https://github.com/user-attachments/assets/0729036e-04ee-49f8-92a9-d6199608da42" />

 #this how dashbored look like
  ![Uploading Screenshot 2026-02-14 232956.png…]()


#AI chat  bot look like
<img width="2194" height="1174" alt="Screenshot 2026-02-14 233121" src="https://github.com/user-attachments/assets/60d6a2b9-e147-4056-9439-31af5135d716" />
 #This how admin panel look like
 <img width="2215" height="1273" alt="Screenshot 2026-02-14 233141" src="https://github.com/user-attachments/assets/2d62c3c0-24f3-4cf5-b05f-07fa330ebf36" />

 #this how each university  deails look like
 <img width="1740" height="1206" alt="image" src="https://github.com/user-attachments/assets/e10d0a44-20f1-4b85-99b4-29bfcf9b9a01" />

 
#  Features

## 1️⃣ Authentication & Authorization
- User Registration (username, email, password)
- Secure password hashing (bcrypt)
- JWT-based authentication
- Protected routes (Landing, University pages, Admin)
- Admin-only knowledge management

---

## 2️⃣ University Landing Page
- List of Ethiopian universities
- Individual university detail pages
- Google Maps integration
- Clean modern UI (Tailwind CSS)
- Accessible only to logged-in users

---

## 3️⃣ AI Chatbot (RAG-Based)
- Floating chat widget
- Context-aware answers
- Vector similarity search
- Conversation memory
- Typing indicator
- Smooth scroll behavior

---

#  How It Works (RAG Flow)

1. User asks a question.
2. Backend embeds question using Voyage AI.
3. MongoDB `$vectorSearch` retrieves relevant knowledge chunks.
4. Context is injected into a structured Gemini prompt.
5. Gemini generates response based only on retrieved context.
6. Conversation is stored in MongoDB.

---

## 4️⃣ Admin Knowledge Base

Admin can:
- Upload PDFs
- Add plain text
- Add website URLs
- View stored documents
- Delete knowledge entries

Each document is:
- Extracted
- Chunked
- Embedded (1024 dimensions)
- Stored in MongoDB
- Indexed for vector search

---

## 5️⃣ Chat History Storage
- Conversations stored per user
- Persisted in MongoDB
- Resume previous conversations
- Clear chat history option

---

#  MongoDB Atlas Vector Index Setup

You must create a vector search index on the `knowledges` collection.

**Index Name:** `vector_index`

### Configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    }
  ]
}
```

⚠ Important: All embeddings must be **1024 dimensions** (Voyage AI `voyage-large-2-instruct`).

---

#  Environment Variables

Create `backend/.env`

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
VOYAGE_API_KEY=your_voyage_key
GEMINI_API_KEY=your_gemini_key
PORT=5000
```

⚠ Never expose API keys in the frontend.

---

#  Project Structure

```
backend/
  src/
    config/
    middleware/
    models/
      user.ts
      knowledge.ts
      Conversation.ts
    routes/
      authRoutes.ts
      chatRoutes.ts
      knowledgeRoutes.ts
      adminRoutes.ts
    services/
      rag.ts
      voyage.ts
    server.ts

frontend/
  components/
    ChatWidget.tsx
  pages/
    Login.tsx
    Register.tsx
    Admin.tsx
  App.tsx
```

---

#  API Endpoints

## Authentication
```
POST /api/auth/register
POST /api/auth/login
```

## Chat
```
POST /api/chat
GET /api/chat/history
DELETE /api/chat/history
```

## Knowledge (Admin)
```
POST /api/admin/knowledge
POST /api/admin/knowledge/pdf
POST /api/admin/knowledge/url
GET /api/admin/knowledge
DELETE /api/admin/knowledge/:id
```

---

#  Security

- JWT authentication middleware
- Role-based access control (admin)
- Password hashing (bcrypt)
- CORS configuration
- Environment variables protected
- AI requests handled server-side only

---

#  How To Run Locally

## 1️⃣ Clone Project
```bash
git clone <your-repo-url>
```

## 2️⃣ Install Frontend
```bash
npm install
npm run dev
```

## 3️⃣ Install Backend
```bash
cd backend
npm install
npm run dev
```

---

#  Testing the RAG System

1. Login
2. Upload university-related knowledge via Admin
3. Ask:
   - “Compare ASTU and AAU”
   - “What are top engineering programs?”
4. Verify responses are context-based

---

# Architecture Highlights

- Proper separation of concerns
- Scalable folder structure
- Service layer for AI logic
- MongoDB aggregation pipelines
- Vector search + LLM integration
- Conversation persistence

---

#  Repository

ethio_university_full-satck-MERN-_with-AI-chat_bot,
author:yeabsra andnet, 3rd year software engineer student
