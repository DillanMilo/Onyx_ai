import React from 'react';
import { ChatSession } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import { BUSINESS_CONFIG } from '../constants';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  isOpen,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-[280px] flex flex-col
          bg-void-900/50 backdrop-blur-xl border-r border-white/5
          transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header / New Chat */}
        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/30">
              <span className="font-bold text-white text-xs tracking-wider">AI</span>
            </div>
            <span className="font-semibold text-white tracking-wide">{BUSINESS_CONFIG.name}</span>
          </div>
          
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl transition-all duration-200 group"
          >
            <PlusIcon className="w-5 h-5 text-void-300 group-hover:text-accent-glow transition-colors" />
            <span className="text-sm font-medium">New Session</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-void-700">
          <div className="text-[10px] font-bold text-void-700 uppercase tracking-[0.2em] mb-3 px-3">
            Archives
          </div>
          
          {sessions.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-void-700 uppercase tracking-widest">
              No History
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile();
                  }}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-sm transition-all duration-200
                    ${currentSessionId === session.id 
                      ? 'bg-gradient-to-r from-accent-primary/20 to-transparent border-l-2 border-accent-primary text-white' 
                      : 'text-void-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }
                  `}
                >
                  <span className="truncate flex-1 pr-2 font-medium">{session.title}</span>
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md text-void-500 transition-all"
                    title="Delete Chat"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5">
           <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-medium text-void-300">System Online</span>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;