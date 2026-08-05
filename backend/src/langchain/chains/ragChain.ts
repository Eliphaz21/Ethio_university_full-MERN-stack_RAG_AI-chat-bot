import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GEMINI_API_KEY } from '../../config/env.js';
import { ragPromptTemplate } from '../prompts/ragPrompt.js';
import { defaultRetriever } from '../retrievers/mongodbVectorStore.js';
import { generateAnswer as fallbackGenerateAnswer } from '../../services/voyage.js';

let llm: ChatGoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  try {
    llm = new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: 'gemini-2.5-flash',
      temperature: 0.1,
      maxOutputTokens: 2048,
    });
  } catch (err) {
    console.warn('[WARN] Could not initialize ChatGoogleGenerativeAI:', (err as Error)?.message);
  }
}

export async function executeRagChain(question: string): Promise<string> {
  try {
    const docs = await defaultRetriever.invoke(question);
    const context = docs.map((d: { pageContent: string }) => d.pageContent).join('\n\n');

    if (!context || !context.trim()) {
      return `I don't have information about that in the uploaded documents. Add PDFs, text, or website URLs about it in Admin -> Knowledge, or check the institution's official website.`;
    }

    if (llm) {
      try {
        const chain = RunnableSequence.from([
          {
            context: (input: { question: string; context: string }) => input.context,
            question: (input: { question: string; context: string }) => input.question,
          },
          ragPromptTemplate,
          llm,
          new StringOutputParser(),
        ]);

        const result = await chain.invoke({ question, context });
        if (result && result.trim()) {
          return result.trim();
        }
      } catch (chainErr) {
        console.warn('[WARN] LangChain RunnableSequence execution failed, invoking fallback:', (chainErr as Error)?.message);
      }
    }

    // Fallback answer generator if Gemini API fails or rate-limits
    return await fallbackGenerateAnswer(context, question);
  } catch (err) {
    console.error('[ERROR] executeRagChain error:', err);
    return `I couldn't process that question right now. Please try again or rephrase.`;
  }
}
