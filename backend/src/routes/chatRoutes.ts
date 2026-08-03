import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { chatRateLimiter } from '../middleware/security.js';
import { sanitizeChatPrompt, detectPromptInjection } from '../services/promptSecurity.js';
import { Conversation } from '../models/Conversation.js';

const router = Router();

router.post('/chat', requireAuth, chatRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawPrompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
    const question = sanitizeChatPrompt(rawPrompt);

    if (!question) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (detectPromptInjection(question)) {
      return res.status(400).json({ error: 'Your message contains disallowed instructions. Please rephrase your question.' });
    }

    const userId = String(req.user?.id || '');
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { getRelevantContext } = await import('../services/rag.js');
    const { generateAnswer } = await import('../services/voyage.js');
    const contextText = await getRelevantContext(question);
    const assistantText = await generateAnswer(contextText, question);

    try {
      await Conversation.findOneAndUpdate(
        { userId },
        {
          $push: {
            messages: [
              { role: 'user', content: question },
              { role: 'assistant', content: assistantText },
            ],
          },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true }
      );
    } catch (dbErr) {
      console.warn('Chat history save failed:', (dbErr as Error)?.message);
    }

    return res.json({ text: assistantText });
  } catch (err: any) {
    console.error('Chat route error:', err?.message || err);
    return res.status(500).json({ error: 'Unable to process your message right now.' });
  }
});

router.get('/chat/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.id || '');
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const conv = await Conversation.findOne({ userId }).lean();
    const messages = conv?.messages ?? [];
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to load chat history.' });
  }
});

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
    res.status(500).json({ error: 'Unable to clear chat history.' });
  }
});

export default router;
