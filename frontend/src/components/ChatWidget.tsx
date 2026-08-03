
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatMessage, KnowledgeDoc, University, User, ChatSession } from '../types';
import { api } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import {
  Send, X, Bot, Plus, Trash2, MessageSquare,
  ChevronRight, Info, ShieldCheck, History,
  PanelLeftClose, PanelLeftOpen, Clock,
  Utensils, PartyPopper, GraduationCap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Custom SVG Avatar based on the provided EthioUni Bot design
const EthioUniBotAvatar = ({ size = 40, showStatus = false }: { size?: number, showStatus?: boolean }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full shadow-2xl rounded-full">
      {/* Outer Blue Circle */}
      <circle cx="50" cy="50" r="50" fill="#0A2463" />
      <circle cx="50" cy="50" r="46" fill="#1E3A8A" stroke="#2563EB" strokeWidth="2" />

      {/* Robot Body */}
      <path d="M35 70C35 62 40 58 50 58C60 58 65 62 65 70V85H35V70Z" fill="#334155" />

      {/* Traditional Wrap (Shamma) */}
      <path d="M35 60C30 65 30 75 35 85C40 75 60 75 65 85C70 75 70 65 65 60C50 55 50 55 35 60Z" fill="#F8FAFC" />
      <path d="M35 65L32 68M36 67L33 70M65 65L68 68M64 67L67 70" stroke="#009B3A" strokeWidth="1" />
      <path d="M35 70L32 73M36 72L33 75M65 70L68 73M64 72L67 75" stroke="#FEDD00" strokeWidth="1" />
      <path d="M35 75L32 78M36 77L33 80M65 75L68 78M64 77L67 80" stroke="#EF3340" strokeWidth="1" />

      {/* Robot Head */}
      <rect x="35" y="32" width="30" height="26" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

      {/* Hat with Ethiopian Colors */}
      <path d="M35 37C35 34 38 32 41 32H59C62 32 65 34 65 37V42H35V37Z" fill="#334155" />
      <rect x="35" y="32" width="30" height="3" fill="#009B3A" />
      <rect x="35" y="35" width="30" height="3" fill="#FEDD00" />
      <rect x="35" y="38" width="30" height="3" fill="#EF3340" />

      {/* Star on Hat */}
      <path d="M50 33L51 35H53L51.5 36L52 38L50 37L48 38L48.5 36L47 35H49L50 33Z" fill="#1E3A8A" stroke="#FEDD00" strokeWidth="0.5" />

      {/* Eyes (Glowing Cyan) */}
      <circle cx="43" cy="45" r="3.5" fill="#70F3FF" className="animate-pulse" />
      <circle cx="57" cy="45" r="3.5" fill="#70F3FF" className="animate-pulse" />

      {/* Ear Phones */}
      <circle cx="33" cy="45" r="5" fill="#334155" />
      <circle cx="67" cy="45" r="5" fill="#334155" />

      {/* Antenna */}
      <line x1="50" y1="32" x2="50" y2="25" stroke="#334155" strokeWidth="2" />
      <circle cx="50" cy="24" r="2.5" fill="#70F3FF" />

      {/* Chest Screen with Chat Bubble */}
      <rect x="42" y="65" width="16" height="12" rx="2" fill="#70F3FF" opacity="0.4" />
      <path d="M46 68H54M46 71H52M46 74H50" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" />
    </svg>
    {showStatus && (
      <div className="absolute top-1 right-1">
        <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-[#0A2463] relative">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    )}
  </div>
);

interface ChatWidgetProps {
  knowledgeDocs: KnowledgeDoc[];
  universities: University[];
  user: User | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ knowledgeDocs, universities, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { t, language, currentLanguageOption } = useLanguage();

  const welcomeMessage: ChatMessage = {
    role: 'assistant',
    content: `${t('aiTitle')} 👋 ${t('aiSubtitle')}`,
    timestamp: new Date().toISOString()
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      loadSessions();
    }
  }, [messages, isOpen]);

  const loadSessions = () => {
    if (!user) return;
    const historyRaw = localStorage.getItem(`chat_history_${user.id}`);
    if (historyRaw) {
      setSessions(JSON.parse(historyRaw));
    }
  };

  const startNewChat = () => {
    setMessages([welcomeMessage]);
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!user) return;
    const updated = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updated));
    setSessions(updated);
    if (currentSessionId === sessionId) {
      startNewChat();
    }
  };

  const clearAllHistory = () => {
    if (!user) return;
    setConfirmClearHistory(true);
  };

  const confirmClearAllHistory = () => {
    if (!user) return;
    localStorage.removeItem(`chat_history_${user.id}`);
    setSessions([]);
    startNewChat();
    setConfirmClearHistory(false);
  };

  const saveCurrentSession = (msgs: ChatMessage[]) => {
    if (!user || msgs.length <= 1) return;

    const historyRaw = localStorage.getItem(`chat_history_${user.id}`);
    let existing: ChatSession[] = historyRaw ? JSON.parse(historyRaw) : [];

    if (currentSessionId) {
      existing = existing.map(s => s.id === currentSessionId ? { ...s, messages: msgs } : s);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const now = new Date().toISOString();
      const newSession: ChatSession = {
        id: newId,
        userId: user.id,
        title: msgs.find(m => m.role === 'user')?.content?.slice(0, 50) || 'New chat',
        messages: msgs,
        createdAt: now,
        updatedAt: now,
      };
      existing = [newSession, ...existing];
      setCurrentSessionId(newId);
    }

    localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(existing));
    setSessions(existing);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading || !user) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (text === input) setInput('');
    setIsLoading(true);

    try {
      const languagePrompt = language === 'en'
        ? text
        : `[Please respond in ${currentLanguageOption.name} (${currentLanguageOption.nativeName}) language]: ${text}`;

      const { text: assistantText } = await api.postChat({
        prompt: languagePrompt,
      });
      const assistantMsg: ChatMessage = { role: 'assistant', content: assistantText, timestamp: new Date().toISOString() };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);
    } catch (error: any) {
      const fallback = "Sorry, I couldn't reach the EthioUni Portal AI. Please check your connection and try again.";
      const assistantMsg: ChatMessage = { role: 'assistant', content: error?.message || fallback, timestamp: new Date().toISOString() };
      setMessages([...newMessages, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: t('prompt1').substring(0, 30) + '...', text: t('prompt1') },
    { label: t('prompt2').substring(0, 30) + '...', text: t('prompt2') },
    { label: t('prompt3').substring(0, 30) + '...', text: t('prompt3') },
    { label: t('prompt4').substring(0, 30) + '...', text: t('prompt4') },
  ];

  return (
    <div className="fixed bottom-10 right-10 z-[60] font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center transition-all duration-300 outline-none"
        >
          {/* Label positioned parallel to the AI Bot with high contrast visibility */}
          <div className="absolute right-[100%] top-1/2 -translate-y-1/2 mr-8 opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-500 pointer-events-none">
            <div className="bg-[#0f172a] text-white px-8 py-4 rounded-3xl text-base font-black uppercase tracking-[0.2em] shadow-[0_25px_80px_rgba(0,0,0,0.6)] border-2 border-slate-700/50 whitespace-nowrap flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
              Chat AI Assistant
            </div>
            {/* Pointer arrow for label */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-[#0f172a] border-r-2 border-t-2 border-slate-700/50 rotate-45"></div>
          </div>

          <div className="hover:scale-110 active:scale-95 transition-transform duration-300">
            <EthioUniBotAvatar size={112} showStatus={true} />
          </div>
        </button>
      )}

      {isOpen && (
        /* Adjusting window size for better internal proportion */
        <div className="bg-[#0f172a] w-[700px] max-w-[95vw] h-[850px] max-h-[94vh] rounded-[3rem] shadow-[0_60px_150px_rgba(0,0,0,0.95)] border-2 border-slate-800 flex overflow-hidden animate-in zoom-in-95 duration-300">

          {/* Narrower Sidebar to save horizontal space */}
          <div className={`bg-[#020617] border-r border-slate-800/50 transition-all duration-300 flex flex-col overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
            <div className="p-4 flex justify-between items-center border-b border-slate-800/50">
              <span className="text-white font-black text-[10px] uppercase tracking-widest">History</span>
              <button onClick={clearAllHistory} className="text-slate-500 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all mb-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">New Session</span>
              </button>

              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${currentSessionId === session.id
                    ? 'bg-slate-800/50 border-slate-700 text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/30'
                    }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold truncate">
                      {session.messages[1]?.content || 'Empty Session'}
                    </p>
                  </div>
                  {/* Added individual delete button for the conversation */}
                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all text-slate-500"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#0f172a] relative">

            {/* More compact Header */}
            <header className="px-6 py-4 bg-[#1e293b]/40 backdrop-blur-3xl border-b border-slate-800/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                  </button>

                  <EthioUniBotAvatar size={52} />
                  <div className="flex flex-col">
                    <h3 className="text-white font-black text-lg leading-tight">{t('aiTitle')}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{currentLanguageOption.nativeName} ({currentLanguageOption.name})</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Content Area - Maximized Space */}
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <ShieldCheck className="w-16 h-16 text-blue-500 mb-6 opacity-20" />
                <h4 className="text-xl font-black text-white mb-4">Access Restricted</h4>
                <p className="text-slate-500 mb-8 max-w-sm text-sm">Please sign in to interact with the AI assistant.</p>
                <Link to="/login" onClick={() => setIsOpen(false)} className="bg-blue-600 text-white font-black px-10 py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">Verify Identity</Link>
              </div>
            ) : (
              <>
                {/* Scrollable conversation area - increased text visibility */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin bg-[radial-gradient(circle_at_bottom_left,#1e293b,transparent_30%)]">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-4 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {msg.role === 'assistant' && (
                          <div className="shrink-0 mt-1">
                            <EthioUniBotAvatar size={36} />
                          </div>
                        )}
                        <div className={`px-5 py-4 rounded-[1.25rem] text-[16px] leading-relaxed relative shadow-lg ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-[#1e293b] border border-slate-700/50 text-slate-100 rounded-tl-none'
                          }`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          <div className={`text-[8px] mt-2 font-black uppercase tracking-widest opacity-30 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="ml-12 bg-slate-800/40 px-5 py-3 rounded-2xl border border-slate-700/50 flex gap-2 items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* More compact footer area */}
                <footer className="p-6 bg-[#0f172a] border-t border-slate-800/50">
                  <div className="space-y-4">
                    {/* Quick Action Chips - compact */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(action.text)}
                          className="shrink-0 bg-[#1e293b]/50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 border border-slate-700/50 transition-all cursor-pointer"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input - sleek and centered */}
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={input}
                          maxLength={2000}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder={t('chatPlaceholder')}
                          className="w-full bg-[#111827] border-2 border-slate-800/50 rounded-2xl py-4 pl-6 pr-6 text-white outline-none focus:border-blue-500/30 transition-all text-sm shadow-inner placeholder:text-slate-600"
                        />
                      </div>
                      <button
                        disabled={!input.trim() || isLoading}
                        onClick={() => handleSend()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-20 p-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center shadow-xl shadow-blue-600/20 cursor-pointer"
                      >
                        <Send className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] pt-1">
                      <GraduationCap className="w-3 h-3 opacity-30" /> RAG-Intelligence Service Active
                    </div>
                  </div>
                </footer>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmClearHistory}
        title="Clear chat history?"
        description="All saved EthioUni assistant conversations on this device will be permanently removed."
        confirmLabel="Clear history"
        onCancel={() => setConfirmClearHistory(false)}
        onConfirm={confirmClearAllHistory}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ChatWidget;
