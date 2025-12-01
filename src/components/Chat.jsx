// src/components/Chat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const Chat = ({ onClose }) => { // ← ДОБАВЬТЕ ЭТОТ ПРОПС
  const [messageText, setMessageText] = useState('');
  const { 
    messages, 
    onlineUsers, 
    isConnected, 
    userRole,
    sendMessage,
    deleteMessage,
    clearChat 
  } = useChat();
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim() && isConnected) {
      const success = sendMessage(messageText);
      if (success) {
        setMessageText('');
      }
    }
  };

  const canSendMessages = userRole && userRole !== 'viewer';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
      {/* Кнопка закрытия - в правом верхнем углу */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-6 h-6  dark:bg-white text-black rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors md:hidden"
          title="Close chat"
        >
          ✕
        </button>
      )}
      
      {/* Header - компактный на мобильных */}
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            <span className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <span className="hidden md:inline">
                {isConnected ? '🟢 Online' : '🔴 Offline'}
              </span>
              <span className="md:hidden">
                {isConnected ? '🟢' : '🔴'}
              </span>
            </span>
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <span className=" md:inline">🎄 {onlineUsers.length} online</span>
              {/* <span className="md:hidden">🎄 {onlineUsers.length}</span> */}
            </span>
          </div>
          
          
        </div>
      </div>

      {/* Messages Container - адаптивные отступы */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm md:text-base">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`p-2 md:p-3 rounded-lg relative ${
                message.isSystem 
                  ? 'bg-yellow-100 dark:bg-yellow-900 border-l-2 md:border-l-4 border-yellow-500' 
                  : 'bg-gray-100 dark:bg-gray-700'
              } ${message.user.role === 'admin' ? 'border-l-2 md:border-l-4 border-red-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 mr-2">
                  <strong className={`text-xs md:text-sm truncate ${
                    message.user.role === 'admin' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {message.user.username}
                  </strong>
                  {message.user.role !== 'member' && message.user.role !== 'system' && (
                    <span className="text-xs px-1 py-0.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded shrink-0">
                      ({message.user.role})
                    </span>
                  )}
                </div>
                <span className=" absolute bottom-2 right-1 md:bottom-2 md:right-1text-xs text-gray-500 dark:text-gray-400 shrink-0 ">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </span>
              </div>
              <div className="text-gray-800 dark:text-gray-200 wrap-break-word text-sm md:text-base">
                {message.text}
              </div>
              
              {userRole === 'admin' && !message.isSystem && (
                <button 
                  onClick={() => deleteMessage(message.id)}
                  className="absolute top-2 right-2 md:top-2 md:right-2 w-4 h-4 md:w-4 md:h-5  dark:text-white text-black text-xs rounded-full  hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Delete message"
                >
                  ❌
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form - компактный на мобильных */}
      <form onSubmit={handleSubmit} className="p-2 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              !isConnected ? "Connecting..." :
              !canSendMessages ? "Viewers cannot send messages" :
              "Type your message..."
            }
            disabled={!isConnected || !canSendMessages}
            maxLength={500}
            className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
          />
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden md:inline">
              {messageText.length}/500
            </span>
            <button 
              type="submit" 
              disabled={!isConnected || !canSendMessages || !messageText.trim()}
              className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
            >
              <span className="hidden md:inline">➤</span>
              <span className="md:hidden">➤</span>
            </button>
          </div>
        </div>
        {/* Счетчик символов для мобильных - под полем ввода */}
        <div className="md:hidden mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {messageText.length}/500
          </span>
        </div>
      </form>
    </div>
  );
};

export default Chat;