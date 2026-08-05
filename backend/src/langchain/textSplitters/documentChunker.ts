import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export const DEFAULT_CHUNK_SIZE = 4000;
export const DEFAULT_CHUNK_OVERLAP = 400;

export async function chunkTextToDocuments(
  text: string,
  metadata: Record<string, any> = {},
  options: ChunkingOptions = {}
): Promise<Document[]> {
  if (!text || !text.trim()) return [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize ?? DEFAULT_CHUNK_SIZE,
    chunkOverlap: options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  return await splitter.createDocuments([text], [metadata]);
}

export async function chunkTextStrings(
  text: string,
  options: ChunkingOptions = {}
): Promise<string[]> {
  const docs = await chunkTextToDocuments(text, {}, options);
  return docs.map(doc => doc.pageContent);
}
