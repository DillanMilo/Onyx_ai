import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicIcon, StopIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Append to current input or replace? 
        // Here we append if there's already text, or just set it.
        // We use functional update to get latest state if needed, but for simplicity:
        if (finalTranscript) {
          setInput(prev => {
             const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
             return prev + spacer + finalTranscript;
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      textareaRef.current?.focus();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className={`
        relative flex items-end gap-2 p-1.5 pl-4 
        bg-void-900/80 backdrop-blur-xl border border-void-700/50 
        shadow-2xl shadow-black/50 rounded-[2rem] 
        transition-all duration-300 ease-out
        ${isListening ? 'ring-2 ring-accent-primary/50 border-accent-primary/50' : 'focus-within:border-accent-primary/50 focus-within:ring-1 focus-within:ring-accent-primary/50'}
      `}>
        
        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          className={`
            mb-1.5 p-2 rounded-full transition-all duration-300 flex-shrink-0
            ${isListening 
              ? 'bg-red-500/10 text-red-500 animate-pulse-fast' 
              : 'text-void-400 hover:text-accent-primary hover:bg-white/5'
            }
          `}
          title={isListening ? "Stop Recording" : "Start Recording"}
        >
          {isListening ? <StopIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask Onyx..."}
          rows={1}
          className="w-full py-3.5 bg-transparent border-none outline-none resize-none text-void-50 placeholder-void-700 max-h-[150px] overflow-y-auto font-light"
          disabled={isLoading}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`
            m-1 p-3 rounded-full flex-shrink-0 transition-all duration-300
            ${input.trim() && !isLoading 
              ? 'bg-gradient-to-tr from-accent-secondary to-accent-primary text-white shadow-lg shadow-accent-primary/25 transform hover:scale-105 active:scale-95' 
              : 'bg-void-800 text-void-600 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <div className="text-center mt-3 opacity-0 hover:opacity-100 transition-opacity duration-500">
        <p className="text-[10px] uppercase tracking-widest text-void-700">
          AI Generated Content • Context: Last 10 Chats
        </p>
      </div>
    </div>
  );
};

export default ChatInput;