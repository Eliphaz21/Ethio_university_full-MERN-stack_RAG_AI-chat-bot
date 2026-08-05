import { describe, it, expect } from 'vitest';
import { chunkTextStrings } from '../langchain/textSplitters/documentChunker.js';
import { ragPromptTemplate } from '../langchain/prompts/ragPrompt.js';
import { EthioUniEmbeddings } from '../langchain/embeddings/embeddingService.js';

describe('LangChain Document Chunker', () => {
  it('should split long document text into chunks', async () => {
    const longText = 'Paragraph 1 of university document.\n\nParagraph 2 with details on admission rules.\n\nParagraph 3 with tuition fees.';
    const chunks = await chunkTextStrings(longText, { chunkSize: 50, chunkOverlap: 10 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain('Paragraph 1');
  });

  it('should return empty array for empty input text', async () => {
    const chunks = await chunkTextStrings('');
    expect(chunks).toEqual([]);
  });
});

describe('LangChain RAG Prompt Template', () => {
  it('should format system prompt and human question correctly', async () => {
    const formatted = await ragPromptTemplate.formatMessages({
      context: 'AAU offers Computer Science.',
      question: 'What does AAU offer?'
    });

    expect(formatted.length).toBe(2);
    expect(formatted[0].content).toContain('EthioUni assistant');
    expect(formatted[0].content).toContain('AAU offers Computer Science.');
    expect(formatted[1].content).toBe('What does AAU offer?');
  });
});

describe('LangChain Embeddings', () => {
  it('should generate 1024-dimensional query embedding', async () => {
    const embeddings = new EthioUniEmbeddings();
    const vec = await embeddings.embedQuery('Adama Science and Technology University');
    expect(Array.isArray(vec)).toBe(true);
    expect(vec.length).toBe(1024);
  });
});
