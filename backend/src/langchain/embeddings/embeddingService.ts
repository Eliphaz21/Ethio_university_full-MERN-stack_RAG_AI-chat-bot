import { Embeddings, type EmbeddingsParams } from '@langchain/core/embeddings';
import { embedText, VECTOR_DIMENSIONS } from '../../services/voyage.js';

export class EthioUniEmbeddings extends Embeddings {
  constructor(params?: EmbeddingsParams) {
    super(params ?? {});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const doc of documents) {
      const vec = await embedText(doc, 'document');
      results.push(vec);
    }
    return results;
  }

  async embedQuery(document: string): Promise<number[]> {
    return await embedText(document, 'query');
  }
}

export const defaultEmbeddings = new EthioUniEmbeddings();
