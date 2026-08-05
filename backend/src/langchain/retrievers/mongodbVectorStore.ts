import { BaseRetriever, type BaseRetrieverInput } from '@langchain/core/retrievers';
import { Document } from '@langchain/core/documents';
import { getRelevantContext } from '../../services/rag.js';

export interface EthioUniRetrieverInput extends BaseRetrieverInput {}

export class EthioUniRetriever extends BaseRetriever {
  static lc_name() {
    return 'EthioUniRetriever';
  }

  lc_namespace = ['langchain', 'retrievers', 'ethiouni'];

  constructor(fields?: EthioUniRetrieverInput) {
    super(fields);
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    const contextText = await getRelevantContext(query);
    if (!contextText || !contextText.trim()) {
      return [];
    }

    return [
      new Document({
        pageContent: contextText,
        metadata: { query }
      })
    ];
  }
}

export const defaultRetriever = new EthioUniRetriever();
