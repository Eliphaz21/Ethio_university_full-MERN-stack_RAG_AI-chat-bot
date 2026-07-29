
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, KnowledgeDoc, University, User, ChatSession } from '../types';
import { api } from '../services/api';
import { Send, Bot, Info, Sparkles, Map, GraduationCap } from 'lucide-react';

interface AIAssistantProps {
  knowledgeDocs: KnowledgeDoc[];
  universities: University[];
  user: User | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ knowledgeDocs, universities, user }) => {
  const welcomeMessage: ChatMessage = {
    role: 'assistant',
    content: "Selam! 👋 I'm your EthioUni Portal AI Assistant. Ask me about universities information, admission requirements, or specific programs.",
    timestamp: new Date().toISOString()
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveCurrentSession = (msgs: ChatMessage[]) => {
    if (!user || msgs.length <= 1) return;

    const historyRaw = localStorage.getItem(`chat_history_${user.id}`);
    const sessions: ChatSession[] = historyRaw ? JSON.parse(historyRaw) : [];

    const sessionId = Math.random().toString(36).substr(2, 9);
    const newSession: ChatSession = {
      id: sessionId,
      userId: user.id,
      title: `Chat - ${new Date().toLocaleDateString()}`,
      messages: msgs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`chat_history_${user.id}`, JSON.stringify([newSession, ...sessions]));
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading || !user) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (text === input) setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.postChat({ prompt: text });
      const assistantMsg: ChatMessage = { role: 'assistant', content: response.text, timestamp: new Date().toISOString() };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'AAU Admissions', text: 'What are the admission requirements for AAU?' },
    { label: 'Regional Hubs', text: 'Which universities are in the Amhara region?' },
    { label: 'STEM Schools', text: 'Which universities focus on Science and Technology?' },
  ];

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-64px)] bg-[#0f172a]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-800 bg-[#111827]/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">AI Academic Assistant</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Ethiopian Educational Repository</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-slate-800 border-slate-700 shadow-xl'
                  }`}>
                  {msg.role === 'user' ? <span className="text-[10px] font-black text-indigo-400">ME</span> : <Bot className="w-7 h-7 text-indigo-500" />}
                </div>
                <div className={`px-8 py-6 rounded-[2.5rem] leading-relaxed text-[16px] shadow-2xl ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none prose prose-invert max-w-none'
                  }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className={`text-[9px] mt-4 font-black uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                    Sent at {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-slate-800/50 px-8 py-5 rounded-[2.5rem] border border-slate-700 animate-pulse">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assistant is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <footer className="p-8 bg-[#0f172a] border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.text)}
                className="shrink-0 bg-slate-800/50 hover:bg-slate-800 px-5 py-3 rounded-2xl text-[11px] font-bold text-slate-300 border border-slate-700/50 transition-all hover:scale-105"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your academic inquiry here..."
              className="w-full bg-[#111827] border border-slate-700 rounded-[2rem] py-6 pl-8 pr-20 text-white outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600/40 transition-all text-lg shadow-inner"
            />
            <button
              disabled={!input.trim() || isLoading}
              onClick={() => handleSend()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 p-5 rounded-full transition-all active:scale-90"
            >
              <Send className="w-7 h-7 text-white" />
            </button>
          </div>
          <div className="mt-5 flex justify-center items-center gap-3 text-[11px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            <Info className="w-3.5 h-3.5" />
            Institutional Context Enabled
          </div>
        </div>
      </footer>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AIAssistant;
