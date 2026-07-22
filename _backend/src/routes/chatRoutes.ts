import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { Conversation } from '../models/Conversation.ts';

const router = Router();

// POST /api/chat - RAG: retrieve context from MongoDB, then generate answer (Voyage embeddings + template)
router.post('/chat', requireAuth, async (req: Request, res: Response) => {
  let assistantText = "I'm having trouble responding right now. Please try again in a moment.";
  try {
    const { prompt, userId } = req.body;
    const question = typeof prompt === 'string' ? prompt : String(prompt || '').trim();
    if (!question) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(' Chat request received:', { question, user: req.user?.id });

    const { getRelevantContext } = await import('../services/rag.ts');
    const { generateAnswer } = await import('../services/voyage.ts');
    const contextText = await getRelevantContext(question);
    console.log(' Context retrieved:', contextText ? 'YES' : 'NO');

    assistantText = await generateAnswer(contextText, question);
    console.log(' Assistant response generated, length:', assistantText.length);

    const effectiveUserId = String(userId || req.user?.id || '');
    if (effectiveUserId) {
      try {
        await Conversation.findOneAndUpdate(
          { userId: effectiveUserId },
          {
            $push: {
              messages: [
                { role: 'user', content: question },
                { role: 'assistant', content: assistantText }
              ]
            },
            $set: { lastUpdated: new Date() }
          },
          { upsert: true }
        );
      } catch (dbErr) {
        console.warn('Chat history save failed:', (dbErr as Error)?.message);
      }
    }

    return res.json({ text: assistantText });
  } catch (err: any) {
    console.error(' Chat route error:', err);
    return res.json({ text: assistantText });
  }
});

// GET /api/chat/history - get current user's chat history (messages)
router.get('/chat/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.id || '');
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const conv = await Conversation.findOne({ userId }).lean();
    const messages = conv?.messages ?? [];
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/history - clear current user's chat history
router.delete('/chat/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.id || '');
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await Conversation.findOneAndUpdate(
      { userId },
      { $set: { messages: [], lastUpdated: new Date() } },
      { upsert: true }
    );
    res.json({ message: 'Chat history cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;