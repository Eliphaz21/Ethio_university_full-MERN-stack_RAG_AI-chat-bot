import { Knowledge } from '../models/knowledge.js';
import { embedText } from './voyage.js';

const VECTOR_INDEX_NAME = 'vector_index';

// --- Real-world RAG: higher limits for large knowledge bases (many universities, many docs) ---
const VECTOR_NUM_CANDIDATES = 300;       // how many candidates to consider (MongoDB $vectorSearch)
const VECTOR_LIMIT_SINGLE = 20;          // max docs for single-question retrieval
const VECTOR_LIMIT_COMPARISON_PER_UNI = 12;  // max docs per university in comparison
const VECTOR_NUM_CANDIDATES_COMPARISON = 150;
const MAX_DOCS_AFTER_MERGE = 24;         // max total docs for comparison (then buildContextText caps chars)
const MAX_CONTEXT_CHARS = 60000;         // total context sent to LLM (Gemini supports 1M+ tokens)

// Function to extract university identifier from question (for optional text-search fallback only).
function extractUniversityName(question: string): string | null {
  const q = question.toLowerCase();
  if (q.includes('addis ababa science') || q.includes('addis ababa and technology') || q.includes('aastu')) return 'aastu';
  // Typo: "addis ababab" or "addis abab" -> treat as AAU
  if (q.includes('addis abab') || q.includes('addis ababa university') || q.includes('aau') || q.includes('addis ababa')) return 'aau';
  if (q.includes('adama science') || q.includes('adama') || q.includes('astu')) return 'adama';
  if (q.includes('hawassa') || q.includes('hawasa')) return 'hawassa';
  if (q.includes('jimma') || q.includes('jima')) return 'jimma';
  return null;
}

// Returns which university (aau, adama, aastu, hawassa, jimma) a doc is about. Title is weighted more.
function docUniversity(doc: any): string | null {
  const title = (doc?.title || '').toLowerCase();
  const content = (doc?.content || '').toLowerCase();
  const t = title + ' ' + content;
  if (title.includes('adama') || title.includes('astu')) return 'adama';
  if (title.includes('aau') || title.includes('addis ababa university')) return 'aau';
  if (title.includes('aastu')) return 'aastu';
  if (title.includes('hawassa') || title.includes('hawasa')) return 'hawassa';
  if (title.includes('jimma') || title.includes('jima')) return 'jimma';
  if (t.includes('aastu')) return 'aastu';
  if (t.includes('adama') || (t.includes('astu') && !t.includes('aastu'))) return 'adama';
  if (t.includes('addis ababa') || t.includes('aau')) return 'aau';
  if (t.includes('hawassa') || t.includes('hawasa')) return 'hawassa';
  if (t.includes('jimma') || t.includes('jima')) return 'jimma';
  return null;
}

// Detect if question asks about multiple universities (comparison) or ONE only ("only ASTU", "just AAU", "ASTU not AAU").
function getMentionedUniversities(question: string): string[] {
  const q = question.toLowerCase().trim();
  // User asked for ONE university only -> return just that one.
  if (/\b(only|just)\s+(astu|adama|adama science)\b|\b(astu|adama)\s+(only|just)\b|only\s+(about\s+)?(astu|adama)\b/i.test(q))
    return ['adama'];
  if (/\b(only|just)\s+(aau|addis ababa)\b|\b(aau|addis ababa)\s+(only|just)\b|only\s+(about\s+)?(aau|addis ababa)\b/i.test(q))
    return ['aau'];
  if (/\b(only|just)\s+aastu\b|\baastu\s+(only|just)\b/i.test(q))
    return ['aastu'];
  // "information about X only" or "X university only" (e.g. "adama science and technology university only")
  if (q.includes('only') && (q.includes('astu') || q.includes('adama')) && !q.includes('aau') && !q.includes('addis ababa'))
    return ['adama'];
  if (q.includes('only') && (q.includes('aau') || q.includes('addis ababa')) && !q.includes('astu') && !q.includes('adama'))
    return ['aau'];
  // "not aau" / "not AAU" -> user wants the other (e.g. ASTU only).
  if (/\bnot\s+aau\b|\bnot\s+addis\s+ababa\b/i.test(q) && (q.includes('astu') || q.includes('adama')))
    return ['adama'];
  if (/\bnot\s+astu\b|\bnot\s+adama\b/i.test(q) && (q.includes('aau') || q.includes('addis ababa')))
    return ['aau'];
  // Default: collect all mentioned universities (include common typos)
  const out: string[] = [];
  if (q.includes('aastu') || (q.includes('addis ababa') && q.includes('science'))) out.push('aastu');
  if (q.includes('aau') || q.includes('addis ababa') || q.includes('addis abab')) out.push('aau');
  if (q.includes('astu') || q.includes('adama')) out.push('adama');
  if (q.includes('hawassa') || q.includes('hawasa')) out.push('hawassa');
  if (q.includes('jimma') || q.includes('jima')) out.push('jimma');
  return [...new Set(out)];
}

// Add more universities here when you upload more: same key in all three maps (getMentionedUniversities, UNIVERSITY_QUERIES, UNIVERSITY_SEARCH_TERMS, UNIVERSITY_SECTION_LABELS).
const UNIVERSITY_QUERIES: Record<string, string> = {
  aau: 'Addis Ababa University AAU Ethiopia programs admission history capital',
  adama: 'Adama Science and Technology University ASTU Ethiopia programs admission Nazret',
  aastu: 'Addis Ababa Science and Technology University AASTU Ethiopia programs',
  hawassa: 'Hawassa University Ethiopia programs admission Sidama',
  jimma: 'Jimma University Ethiopia programs admission Oromia',
};

const UNIVERSITY_SEARCH_TERMS: Record<string, string[]> = {
  aau: ['addis ababa university', 'aau'],
  adama: ['adama science', 'adama university', 'astu'],
  aastu: ['aastu', 'addis ababa science and technology'],
  hawassa: ['hawassa university', 'hawasa university', 'hawassa'],
  jimma: ['jimma university', 'jima university', 'jimma'],
};

/** Fetch docs that mention a given university by plain text (title or content). Guarantees we have something for comparison. */
async function fetchDocsForUniversity(uniKey: string, excludeIds: Set<string>, limit = 5): Promise<any[]> {
  const terms = UNIVERSITY_SEARCH_TERMS[uniKey];
  if (!terms?.length) return [];
  const orConditions = terms.flatMap(term => [
    { title: new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    { content: new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
  ]);
  const docs = await Knowledge.find({ $or: orConditions }).limit(limit * 2).lean();
  const out: any[] = [];
  for (const d of docs) {
    if (excludeIds.has(String(d._id))) continue;
    out.push(d);
    if (out.length >= limit) break;
  }
  return out;
}

// For comparison queries: reorder docs so each university is fairly represented (used when building context).
function ensureDiverseContext(docs: any[], question: string): any[] {
  const mentioned = getMentionedUniversities(question);
  if (mentioned.length < 2) return docs;
  const byUni: Record<string, any[]> = {};
  for (const u of mentioned) byUni[u] = [];
  for (const d of docs) {
    const u = docUniversity(d);
    if (u && byUni[u]) byUni[u].push(d);
  }
  const result: any[] = [];
  const perUni = Math.max(8, Math.floor(MAX_DOCS_AFTER_MERGE / mentioned.length));
  for (const u of mentioned) {
    const group = (byUni[u] || []).sort((a: any, b: any) => (b.content?.length ?? 0) - (a.content?.length ?? 0));
    result.push(...group.slice(0, perUni));
  }
  const tagged = new Set(result);
  const rest = docs.filter((d: any) => !tagged.has(d)).sort((a: any, b: any) => (b.content?.length ?? 0) - (a.content?.length ?? 0));
  return result.length > 0 ? [...result, ...rest].slice(0, MAX_DOCS_AFTER_MERGE) : docs;
}

const UNIVERSITY_SECTION_LABELS: Record<string, string> = {
  aau: 'Addis Ababa University (AAU)',
  adama: 'Adama Science and Technology University (ASTU)',
  aastu: 'Addis Ababa Science and Technology University (AASTU)',
  hawassa: 'Hawassa University',
  jimma: 'Jimma University',
};

/** Build context string. For comparison queries, use explicit section headers and cap each block so both fit. */
function buildContextText(docs: any[], question: string): string {
  const mentioned = getMentionedUniversities(question);
  const isComparison = mentioned.length >= 2;

  if (!isComparison || mentioned.length === 0) {
    // Single question: include as many docs as fit in MAX_CONTEXT_CHARS (for large RAG)
    let len = 0;
    const parts: string[] = [];
    for (const d of docs) {
      if (len >= MAX_CONTEXT_CHARS) break;
      const block = (d.title ? `[${d.title}]\n` : '') + (d.content || '');
      parts.push(block);
      len += block.length;
    }
    return parts.join('\n\n');
  }

  const capPerUni = Math.floor(MAX_CONTEXT_CHARS / mentioned.length) - 1000;
  const byUni: Record<string, any[]> = {};
  for (const u of mentioned) byUni[u] = [];
  for (const d of docs) {
    const u = docUniversity(d);
    if (u && byUni[u]) byUni[u].push(d);
  }

  const sections: string[] = [];
  sections.push('Context for comparison (use BOTH sections below):\n');
  for (const u of mentioned) {
    const label = UNIVERSITY_SECTION_LABELS[u] || u;
    const group = (byUni[u] || []).sort((a: any, b: any) => (b.content?.length ?? 0) - (a.content?.length ?? 0));
    let len = 0;
    const blocks: string[] = [];
    for (const d of group) {
      if (len >= capPerUni) break;
      const block = (d.title ? `[${d.title}]\n` : '') + (d.content || '');
      blocks.push(block);
      len += block.length;
    }
    if (blocks.length > 0) {
      sections.push(`=== ${label} ===\n` + blocks.join('\n\n'));
    }
  }
  return sections.join('\n\n');
}

/** Normalize common typos in institution names (jima→jimma, hawasa→hawassa, universtiy→university). */
function normalizeInstitutionName(name: string): string {
  let n = name.toLowerCase().trim();
  n = n.replace(/\buniverstiy\b/g, 'university');
  if (n === 'jima' || n === 'jimma') return 'jimma';
  if (n === 'hawasa' || n === 'hawassa') return 'hawassa';
  return n;
}

/** Extract institution name the user is asking about so we can check if we have docs for it. */
function extractAskedInstitution(question: string): string | null {
  // Normalize typos in question for matching (e.g. "jima universtiy" -> "jimma university")
  let q = question.toLowerCase().trim();
  q = q.replace(/\buniverstiy\b/g, 'university');

  // Known "other" universities we typically don't have docs for — extract so we can reject wrong context if needed
  const knownOtherUniversities = ['unity university', 'bahir dar university', 'hope university'];
  for (const uni of knownOtherUniversities) {
    if (q.includes(uni)) return normalizeInstitutionName(uni.replace(' university', ''));
  }

  // "... about X university" or "X university" - more specific patterns
  const aboutMatch = q.match(/(?:about|regarding|information\s+about)\s+([^.?]+?)(?:\s*$|\s*\?|\.)/);
  if (aboutMatch) {
    const phrase = aboutMatch[1].trim();
    if (phrase.includes('university')) return normalizeInstitutionName(phrase.replace(/\s+university\s*$/i, '').trim() || phrase);
    return normalizeInstitutionName(phrase);
  }

  // More specific university patterns (capture "jima"/"jimma", "hawasa"/"hawassa", etc.)
  const uniPatterns = [
    /\b([a-z]+(?:\s+[a-z]+)?)\s+university\b/,
    /\b(astu|aau|aastu)\b/,
  ];

  for (const pattern of uniPatterns) {
    const match = q.match(pattern);
    if (match) return normalizeInstitutionName(match[1].trim());
  }

  return null;
}

/** If the user asked about a specific institution and the retrieved context does not mention it, return empty (avoid answering with wrong university). */
function contextMatchesQuestion(question: string, contextText: string, docs: any[]): boolean {
  const asked = extractAskedInstitution(question);
  if (!asked || asked.length < 2) return true;
  const key = asked.replace(/\s+/g, ' ').trim();
  const keyLower = key.toLowerCase();

  // Allow known university keys (including common spellings)
  const knownUniversities = /^(addis\s+ababa|aau|adama|astu|aastu|hawassa|hawasa|jimma|jima)$/;
  if (knownUniversities.test(keyLower) || keyLower.startsWith('addis abab')) return true;

  // For unknown universities, be very strict - only match if the exact name appears in context
  const contextLower = contextText.toLowerCase();

  // Look for exact university name matches, not partial matches
  const exactPatterns = [
    `${keyLower} university`,
    `university of ${keyLower}`,
    `${keyLower} university`,
    keyLower
  ];

  for (const pattern of exactPatterns) {
    if (contextLower.includes(pattern)) {
      return true;
    }
  }

  // Check document titles for exact matches
  for (const d of docs) {
    const title = (d?.title || '').toLowerCase();
    const content = (d?.content || '').toLowerCase();

    if (title.includes(`${keyLower} university`) ||
      title.includes(`university of ${keyLower}`) ||
      title === keyLower) {
      return true;
    }
  }

  console.log(`[WARN] No exact match found for unknown university: ${key}`);
  return false;
}

export async function getRelevantContext(question: string): Promise<string> {
  let totalDocs = 0;
  let targetUniversity: string | null = null;
  try {
    console.log('[INFO] Searching for context for question:', question);

    totalDocs = await Knowledge.countDocuments();
    console.log('[INFO] Total knowledge documents in DB:', totalDocs);
    if (totalDocs === 0) return '';

    let questionEmbedding: number[] | null = null;
    try {
      questionEmbedding = await embedText(question, 'query');
      console.log('[INFO] Question embedding length:', questionEmbedding?.length ?? 0);
    } catch (e) {
      console.warn('[WARN] Could not get query embedding, will use text search only:', (e as Error)?.message);
    }

    targetUniversity = extractUniversityName(question);
    console.log('[INFO] Target university detected:', targetUniversity || 'any');

    let docs: any[] = [];

    if (questionEmbedding && questionEmbedding.length > 0) {
      const mentioned = getMentionedUniversities(question);
      const isComparison = mentioned.length >= 2;

      if (isComparison && mentioned.length > 0) {
        console.log('[INFO] Comparison query: fetching context for each university:', mentioned);
        const seenIds = new Set<string>();
        for (const uni of mentioned) {
          const expandedQuery = UNIVERSITY_QUERIES[uni] || uni;
          try {
            const uniEmbedding = await embedText(expandedQuery, 'query');
            if (!uniEmbedding?.length) continue;
            const vectorQuery: any = {
              index: VECTOR_INDEX_NAME,
              path: 'embedding',
              queryVector: uniEmbedding,
              numCandidates: VECTOR_NUM_CANDIDATES_COMPARISON,
              limit: VECTOR_LIMIT_COMPARISON_PER_UNI,
            };
            const uniDocs = await Knowledge.aggregate([{ $vectorSearch: vectorQuery }]);
            for (const d of uniDocs) {
              const id = String(d._id);
              if (!seenIds.has(id)) {
                seenIds.add(id);
                docs.push(d);
              }
            }
          } catch (e) {
            console.warn('[WARN] Comparison sub-query failed for', uni, (e as Error)?.message);
          }
        }
        docs.sort((a: any, b: any) => (b.content?.length ?? 0) - (a.content?.length ?? 0));
        docs = docs.slice(0, MAX_DOCS_AFTER_MERGE);
        console.log('[SUCCESS] Comparison vector search merged, found:', docs.length);
      }

      // Single-university question ("tell me about ASTU"): retrieve ONLY that university's docs using its expanded query (no mixing with others).
      if (docs.length === 0 && mentioned.length === 1) {
        const uni = mentioned[0];
        const expandedQuery = UNIVERSITY_QUERIES[uni] || question;
        try {
          const uniEmbedding = await embedText(expandedQuery, 'query');
          if (uniEmbedding?.length) {
            const vectorQuery: any = {
              index: VECTOR_INDEX_NAME,
              path: 'embedding',
              queryVector: uniEmbedding,
              numCandidates: VECTOR_NUM_CANDIDATES,
              limit: VECTOR_LIMIT_SINGLE,
            };
            docs = await Knowledge.aggregate([{ $vectorSearch: vectorQuery }]);
            docs.sort((a: any, b: any) => (b.content?.length ?? 0) - (a.content?.length ?? 0));
            docs = docs.slice(0, VECTOR_LIMIT_SINGLE);
            console.log('[INFO] Single-topic retrieval for', uni, ', found', docs.length);
          }
        } catch (e) {
          console.warn('[WARN] Single-topic vector search failed for', uni, (e as Error)?.message);
        }
      }

      if (docs.length === 0) {
        console.log('[INFO] Vector search using user question (query-based retrieval from all docs)');
        try {
          const vectorQuery: any = {
            index: VECTOR_INDEX_NAME,
            path: 'embedding',
            queryVector: questionEmbedding,
            numCandidates: VECTOR_NUM_CANDIDATES,
            limit: VECTOR_LIMIT_SINGLE,
          };

          docs = await Knowledge.aggregate([
            { $vectorSearch: vectorQuery },
          ]);
          // Keep MongoDB order (by similarity score) — do NOT sort by length so the most relevant docs stay first
          console.log('[SUCCESS] $vectorSearch worked, found:', docs.length);
        } catch (e1) {
          const errMsg = (e1 as Error).message;
          console.log('[WARN] $vectorSearch failed, trying $search knnBeta:', errMsg);
          if (/1536 dimensions but queried with 1024|dimension.*mismatch/i.test(errMsg)) {
            console.log('[INFO] Fix: In MongoDB Atlas, create a vector search index on the "embedding" field with numDimensions: 1024, then re-upload all documents from Admin → Knowledge.');
          }

          // Fallback to $search with knnBeta (correct pipeline: first stage must be { $search: { ... } })
          try {
            const searchQuery: any = {
              index: VECTOR_INDEX_NAME,
              knnBeta: {
                vector: questionEmbedding,
                path: 'embedding',
                k: VECTOR_LIMIT_SINGLE
              }
            };

            docs = await Knowledge.aggregate([
              { $search: searchQuery },
              { $project: { title: 1, content: 1, type: 1, score: { $meta: 'searchScore' } } }
            ]);
            docs = docs.slice(0, VECTOR_LIMIT_SINGLE);
            console.log('[SUCCESS] $search knnBeta worked, found:', docs.length);
          } catch (e2) {
            console.log('[WARN] $search knnBeta failed, trying $search vector:', (e2 as Error).message);

            try {
              const searchQuery: any = {
                index: VECTOR_INDEX_NAME,
                vector: {
                  query: questionEmbedding,
                  path: 'embedding'
                }
              };

              docs = await Knowledge.aggregate([
                { $search: searchQuery },
                { $limit: VECTOR_LIMIT_SINGLE }
              ]);
              console.log('[SUCCESS] $search vector worked, found:', docs.length);
            } catch (e3) {
              console.log('[ERROR] All vector search methods failed, using text fallback:', (e3 as Error).message);
            }
          }
        }
      }
    }

    console.log('[INFO] Vector search results count:', docs.length);

    // For comparison: ensure we have at least one doc per university (text fallback if vector missed one)
    const mentioned = getMentionedUniversities(question);
    if (docs.length > 0 && mentioned.length >= 2) {
      const byUni: Record<string, any[]> = {};
      for (const u of mentioned) byUni[u] = [];
      for (const d of docs) {
        const u = docUniversity(d);
        if (u && byUni[u]) byUni[u].push(d);
      }
      const seenIds = new Set(docs.map((d: any) => String(d._id)));
      for (const u of mentioned) {
        if ((byUni[u]?.length ?? 0) === 0) {
          console.log('[INFO] Comparison: no vector docs for', u, '— fetching by text search');
          const extra = await fetchDocsForUniversity(u, seenIds, 8);
          for (const d of extra) {
            seenIds.add(String(d._id));
            docs.push(d);
          }
        }
      }
    }

    // Single-university question: keep only docs about that university so the answer is not mixed with others.
    if (docs.length > 0 && mentioned.length === 1) {
      const want = mentioned[0];
      const filtered = docs.filter((d: any) => docUniversity(d) === want);
      if (filtered.length > 0) {
        docs = filtered;
        console.log('[INFO] Single-topic filter: kept', docs.length, 'docs for', want);
      } else {
        const fallback = await fetchDocsForUniversity(want, new Set(), 10);
        if (fallback.length > 0) {
          docs = fallback;
          console.log('[INFO] Single-topic: used text search for', want, ', found', docs.length);
        }
      }
    }

    if (docs.length > 0) docs = ensureDiverseContext(docs, question);

    if (docs.length > 0) {
      const contextText = buildContextText(docs, question);
      if (!contextMatchesQuestion(question, contextText, docs)) {
        console.log('[WARN] User asked about a different institution than retrieved — returning no context to avoid wrong answer');
        return '';
      }
      console.log('[SUCCESS] Found context via vector search, length:', contextText.length);
      return contextText;
    } else {
      console.log('[WARN] Vector search returned no results, trying text search fallback');
    }

    // Fallback: text search (match question or any word from question)
    console.log('[INFO] Using text search fallback');
    const askedInst = extractAskedInstitution(question);
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Build regex that matches institution name and common typos (e.g. jimma|jima, hawassa|hawasa)
    function institutionRegex(name: string): RegExp {
      const variants: string[] = [name];
      if (name === 'jimma') variants.push('jima');
      if (name === 'hawassa') variants.push('hawasa');
      const pattern = variants.map(v => escapeRegex(v)).join('|');
      return new RegExp(pattern, 'i');
    }

    let textDocs: any[] = [];
    if (askedInst && askedInst.length >= 2) {
      const instRe = institutionRegex(askedInst);
      const directMatch = await Knowledge.find({
        $or: [
          { title: instRe },
          { content: instRe }
        ]
      }).limit(15).lean();
      if (directMatch.length === 0) {
        console.log('[WARN] No documents mention asked institution:', askedInst, '— returning no context');
        return '';
      }
      // Use only docs that mention the asked institution so we don't return wrong university (e.g. AAU when user asked about Hawassa)
      textDocs = directMatch;
      console.log('[INFO] Text fallback: using', textDocs.length, 'docs that mention', askedInst);
    }

    if (textDocs.length === 0) {
      const words = question.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
      const orConditions: any[] = [
        { title: { $regex: escapeRegex(question), $options: 'i' } },
        { content: { $regex: escapeRegex(question), $options: 'i' } }
      ];
      for (const w of words.slice(0, 8)) {
        const r = escapeRegex(w);
        orConditions.push({ title: { $regex: r, $options: 'i' } });
        orConditions.push({ content: { $regex: r, $options: 'i' } });
      }
      let textSearchQuery: any = { $or: orConditions };
      if (targetUniversity) {
        textSearchQuery = {
          $and: [
            { $or: orConditions },
            {
              $or: [
                { title: { $regex: escapeRegex(targetUniversity), $options: 'i' } },
                { content: { $regex: escapeRegex(targetUniversity), $options: 'i' } }
              ]
            }
          ]
        };
      }
      textDocs = await Knowledge.find(textSearchQuery).limit(15).lean();
    }

    // Never use "most recent docs" — only return context that matches the user's query (query-based retrieval)
    if (textDocs.length === 0) {
      console.log('[INFO] No docs matched the question; returning no context');
      return '';
    }

    console.log('[INFO] Text search results count:', textDocs.length);
    const contextText = textDocs.map((d: any) => (d.title ? `[${d.title}]\n` : '') + (d.content || '')).join('\n\n');
    if (textDocs.length > 0 && askedInst && !contextMatchesQuestion(question, contextText, textDocs)) {
      console.log('[WARN] Text fallback docs do not match asked institution:', askedInst);
      return '';
    }
    console.log('[INFO] Final context length:', contextText.length);
    return contextText;
  } catch (err) {
    console.error('[ERROR] getRelevantContext error:', err);
    return '';
  }
}
