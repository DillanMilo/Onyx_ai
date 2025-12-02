import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import { MenuIcon } from './components/Icons';
import { ChatSession, ChatMessage, Role } from './types';
import { streamChatResponse, generateChatTitle } from './services/llmService';
import { BUSINESS_CONFIG } from './constants';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to LocalStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId]);

  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Session',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('ai_chat_sessions', JSON.stringify(newSessions));
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    // Optimistically update UI
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return session;
    }));

    setIsLoading(true);

    try {
      // 2. Prepare Placeholder for AI Response
      const aiMsgId = (Date.now() + 1).toString();
      const placeholderAiMsg: ChatMessage = {
        id: aiMsgId,
        role: Role.MODEL,
        text: '', // Starts empty
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, placeholderAiMsg] };
        }
        return session;
      }));

      // 3. Get Current History for Context
      const currentHistory = sessions.find(s => s.id === currentSessionId)?.messages || [];
      const historyForApi = currentHistory;

      // 4. Stream Response
      let accumulatedText = "";
      
      await streamChatResponse(historyForApi, text, (chunkText) => {
        accumulatedText = chunkText;
        setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: session.messages.map(msg => 
                msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
              )
            };
          }
          return session;
        }));
      });

      // 5. Generate Title if it's the first message interaction
      if (currentHistory.length === 0) {
         generateChatTitle(text).then(title => {
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title } : s));
         });
      }

    } catch (error) {
      console.error(error);
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const msgs = [...session.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.role === Role.MODEL) {
            lastMsg.text = "Connection interrupted. Please verify credentials.";
            lastMsg.isError = true;
          }
          return { ...session, messages: msgs };
        }
        return session;
      }));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-void-950 text-void-50 overflow-hidden relative font-sans selection:bg-accent-primary selection:text-white">
      {/* Global Background Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-void-800 via-void-950 to-black opacity-80 pointer-events-none"></div>
      
      {/* Subtle Glow Effect Bottom Left */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-accent-primary/5 to-transparent pointer-events-none"></div>

      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full relative w-full z-10 transition-all duration-300">
        {/* Transparent Header */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 z-20 border-b border-white/5 backdrop-blur-sm bg-void-950/20">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 -ml-2 text-void-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Open sidebar"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                  <h1 className="font-semibold text-sm text-void-50 tracking-wider uppercase">
                      {getCurrentSession()?.title || BUSINESS_CONFIG.name}
                  </h1>
                  <span className="text-[10px] text-accent-primary font-bold tracking-[0.2em] uppercase">
                    {getCurrentSession() ? 'Active Session' : 'Standby'}
                  </span>
                </div>
            </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-void-700 p-4 md:p-6">
            <div className="max-w-3xl mx-auto flex flex-col min-h-full">
                {(!getCurrentSession() || getCurrentSession()?.messages.length === 0) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary p-[2px] mb-8 shadow-2xl shadow-accent-primary/20">
                          <div className="w-full h-full rounded-full bg-void-950 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent-primary/20"></div>
                            <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full opacity-20 animate-pulse"></div>
                          </div>
                        </div>
                        
                        <h2 className="text-3xl font-extralight text-white mb-4 tracking-tight">
                          {BUSINESS_CONFIG.welcomeMessage}
                        </h2>
                        <p className="max-w-md text-void-400 text-sm font-light leading-relaxed">
                            System initialized. Ready for query.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-4">
                        {getCurrentSession()?.messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 pb-6 z-20">
            <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
            />
        </div>
      </main>
    </div>
  );
};

export default App;