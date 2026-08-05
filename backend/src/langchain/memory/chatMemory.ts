import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { Conversation } from '../../models/Conversation.js';

export class MongoDBChatMessageHistory extends BaseChatMessageHistory {
  lc_namespace = ['langchain', 'stores', 'message', 'mongodb'];
  private userId: string;

  constructor(userId: string) {
    super();
    this.userId = userId;
  }

  async getMessages(): Promise<BaseMessage[]> {
    if (!this.userId) return [];
    try {
      const conv = await Conversation.findOne({ userId: this.userId }).lean();
      if (!conv || !conv.messages) return [];
      return conv.messages.map((msg: { role: string; content: string }) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        }
        return new AIMessage(msg.content);
      });
    } catch (err) {
      console.warn('MongoDBChatMessageHistory getMessages error:', (err as Error)?.message);
      return [];
    }
  }

  async addMessage(message: BaseMessage): Promise<void> {
    if (!this.userId) return;
    const role = message._getType() === 'human' ? 'user' : 'assistant';
    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

    try {
      await Conversation.findOneAndUpdate(
        { userId: this.userId },
        {
          $push: { messages: { role, content } },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn('MongoDBChatMessageHistory addMessage error:', (err as Error)?.message);
    }
  }

  async addUserMessage(message: string): Promise<void> {
    await this.addMessage(new HumanMessage(message));
  }

  async addAIMessage(message: string): Promise<void> {
    await this.addMessage(new AIMessage(message));
  }

  async clear(): Promise<void> {
    if (!this.userId) return;
    try {
      await Conversation.findOneAndUpdate(
        { userId: this.userId },
        { $set: { messages: [], lastUpdated: new Date() } },
        { upsert: true }
      );
    } catch (err) {
      console.warn('MongoDBChatMessageHistory clear error:', (err as Error)?.message);
    }
  }
}
