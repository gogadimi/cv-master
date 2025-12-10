import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.User;
  const isSystem = message.role === MessageRole.System;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mx-2 shadow-sm ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <i className={`fa-solid ${isUser ? 'fa-user' : 'fa-robot'}`}></i>
        </div>

        {/* Bubble */}
        <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
        }`}>
          {message.isThinking ? (
            <div className="flex items-center gap-2 text-emerald-700 animate-pulse font-medium">
              <i className="fa-solid fa-brain"></i>
              <span>Размислувам...</span>
            </div>
          ) : (
             <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-2 prose-pre:rounded-md overflow-x-auto">
               <ReactMarkdown>{message.content}</ReactMarkdown>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};