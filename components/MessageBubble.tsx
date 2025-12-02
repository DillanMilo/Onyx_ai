import React from 'react';
import { ChatMessage, Role } from '../types';
import { RobotIcon, UserIcon } from './Icons';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-lg
          ${isUser 
            ? 'bg-void-800 text-void-300 hidden md:flex' 
            : 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white'
          }
        `}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <RobotIcon className="w-5 h-5" />}
        </div>

        {/* Bubble */}
        <div className={`
          relative px-5 py-3.5 shadow-md
          ${isUser 
            ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-2xl rounded-tr-sm' 
            : 'bg-void-900/80 backdrop-blur-md border border-white/5 text-void-50 rounded-2xl rounded-tl-sm'
          }
        `}>
          {/* Message Text */}
          <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light tracking-wide">
            {message.text}
          </div>

          {/* Timestamp / Status */}
          <div className={`
            text-[10px] mt-1 opacity-50 font-medium uppercase tracking-widest
            ${isUser ? 'text-blue-100 text-right' : 'text-void-400 text-left'}
          `}>
            {message.isError ? <span className="text-red-400">Error</span> : 
              new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;