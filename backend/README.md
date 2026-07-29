# RAG-Based AI Chatbot — How It Works

## Is the RAG chatbot fully working?

Yes. The flow is: **user question → retrieve relevant chunks (Voyage + MongoDB) → build context → send to Gemini → return answer**. All steps are wired in code.

---

## Step-by-step: What happens when the user sends a message

### Step 1: User sends a question (e.g. "Compare ASTU and AAU")

- Frontend calls `POST /api/chat` with `{ prompt: "Compare ASTU and AAU" }`.
- Backend receives the question in `chatRoutes.ts`.

### Step 2: Retrieve context (RAG — `rag.ts`)

1. **Embed the question**  
   The question is sent to **Voyage AI** (`embedText(question, 'query')`) to get a **1024‑dimensional vector**.

2. **Detect comparison vs single-topic**  
   `getMentionedUniversities(question)` returns which universities the user is asking about (e.g. `['adama']` for "tell me about ASTU", or `['aau','adama']` for "compare AAU and ASTU").

3. **Comparison (two or more universities)**  
   If the question mentions **two or more universities**:
   - Run **one vector search per university** with that university’s expanded query (e.g. "Adama Science and Technology University ASTU Ethiopia...").
   - **Merge** results and deduplicate (up to 24 docs).
   - If **any** university has **no** vector results, **text search** is used for that university so both sides are present.

4. **Single-topic (one university)**  
   If the question mentions **only one university** (e.g. "can you tell me about ASTU", "what about ASTU"):
   - Run **one vector search** using that university’s **expanded query** (not the raw question). So we retrieve **only that university’s docs** and never mix in others.
   - If that returns no docs, a **text search** for that university is used.
   - Optionally, results are filtered so only docs about that university are kept (using `docUniversity(doc)` and title).

5. **Generic question (no specific university)**  
   - One **MongoDB `$vectorSearch`** with the **question** vector: **numCandidates 300**, **limit 20**.
   - Results are sorted by content length; up to 20 docs are kept.

6. **Build context string**  
   - **Comparison:** Context is built with clear sections, e.g.  
     `=== Addis Ababa University (AAU) ===` … then `=== Adama Science and Technology University (ASTU) ===`  
     Each section is capped so **both** fit within the total context limit (60k chars).
   - **Single:** Docs are concatenated (with `[title]` labels) until the total length reaches **60,000 characters**.

7. **Return** this context string to the caller.

### Step 3: Send to Gemini and get answer (`voyage.ts`)

1. **Prompt structure**
   - **System message** = fixed instructions + delimiter + **retrieved context**:
     ```
     You are the EthioUni assistant. Answer using ONLY the context below...
     Rules: ...
     --- Retrieved context (use this only) ---
     [full context from Step 2, up to 60,000 chars]
     ```
   - **User message** = the **exact user question** (e.g. "Compare ASTU and AAU").

2. **API call**  
   `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`  
   - Body: `systemInstruction` (with context) + `contents: [{ role: 'user', parts: [{ text: question }] }]`  
   - `maxOutputTokens: 2048`, `temperature: 0.2`.

3. **Response**  
   The model’s reply text is extracted and returned as the assistant message.

### Step 4: Response to user

- The answer is sent back as `{ text: assistantText }`.
- The same exchange is stored in the **Conversation** collection (user + assistant messages).

---

## What happens when you upload more files

### When you add a **PDF**, **text**, or **URL** in Admin → Knowledge:

1. **Text extraction**
   - **PDF:** `pdf-parse` (or your PDF library) extracts raw text from the file.
   - **URL:** Page is fetched, HTML is stripped to plain text.
   - **Text:** Used as-is (up to 2MB body limit).

2. **Chunking (if content is long)**  
   If content length **> 8,000 characters**:
   - It is split into **chunks of 8,000 chars** with **400 char overlap**.
   - Chunk boundaries prefer paragraph/sentence breaks.
   - Each chunk becomes a **separate document** in the Knowledge collection (e.g. "My University (part 1/3)", "My University (part 2/3)").

3. **Embedding (Voyage)**  
   For **each** chunk (or the single piece if not chunked):
   - The text is sent to **Voyage AI** (`embedText(chunk, 'document')`).
   - Voyage returns a **1024‑dimensional vector** (truncation at 16k chars per chunk if needed).

4. **Save to MongoDB**  
   For each chunk:
   - Stored in the **Knowledge** collection with: `title`, `content`, `type` (text/pdf/website), `embedding`, `uploadedAt`.

5. **Vector search**  
   MongoDB Atlas uses the **vector index** on the `embedding` field. New documents are **automatically** searchable; no extra step.

### So when you upload more files:

- **More documents** (and possibly more chunks) are added to the same Knowledge collection.
- **Vector search** will consider them (up to 300 candidates, 20 single-topic / 24 comparison docs).
- For **“tell me about X”** to return only X’s info, X must be one of the universities known in `rag.ts`. Right now: **AAU**, **Adama/ASTU**, **AASTU**.

### Adding more universities (for future Ethiopian docs)

When you add many new universities and want "tell me about [University Y]" and "compare X and Y" to work:

1. In **`backend/src/services/rag.ts`**, use the **same key** (e.g. `bdu` for Bahir Dar University) in:
   - **`UNIVERSITY_QUERIES`** — one short phrase for vector search (e.g. `bdu: 'Bahir Dar University BDU Ethiopia programs admission'`).
   - **`UNIVERSITY_SEARCH_TERMS`** — terms for text-search fallback (e.g. `bdu: ['bahir dar university', 'bdu']`).
   - **`UNIVERSITY_SECTION_LABELS`** — human-readable label (e.g. `bdu: 'Bahir Dar University (BDU)'`).
2. In **`getMentionedUniversities(question)`**, add detection for the new university (e.g. if `q.includes('bdu')` or `q.includes('bahir dar')` then push `'bdu'`).
3. In **`docUniversity(doc)`**, add a rule so docs about that university are classified (e.g. if title/content includes "bahir dar" or "bdu" then return `'bdu'`). Use **title** first so a doc titled "Bahir Dar University" is not misclassified by other words in the body.
4. Optionally update **`extractUniversityName()`** for the text-search fallback.

Then single-topic retrieval ("tell me about BDU") and comparison ("compare AAU and BDU") will use the new university correctly.

---

## Prompt structure sent to Gemini (summary)

| Part            | Where        | Content |
|-----------------|-------------|---------|
| **System**      | `systemInstruction.parts[0].text` | EthioUni instructions + `--- Retrieved context (use this only) ---` + **full retrieved context** (≤ 60k chars). |
| **User**        | `contents[0].parts[0].text`       | **Exact user question** only. |

The model is instructed to use **only** the retrieved context and to use **all** `=== ... ===` sections for comparison questions.
