// src/hooks/useChat.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEncryptedMessages, saveEncryptedMessages } from '../helpers/secureCache';

export const useChat = () => {
  const { user } = useAuth();
  const chatId = 'main_chat'; // можно сделать динамическим для разных комнат

  // Инициализация state из кэша
  const [messages, setMessages] = useState(() => getEncryptedMessages(chatId));
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState(user?.role || null);

  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Закрываем предыдущее соединение
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
    }

    const wsUrl = 'wss://engsloca-back.onrender.com/ws';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      if (user) {
        setUserRole(user.role);
      }
      // Можно запросить историю, если кэш пуст
      if (getEncryptedMessages(chatId).length === 0) {
        ws.current.send(JSON.stringify({ type: 'get_history', limit: 50 }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message_history':
            setMessages(data.data);
            saveEncryptedMessages(chatId, data.data);
            break;

          case 'new_message':
            setMessages(prev => {
              const updated = [...prev, data.data];
              saveEncryptedMessages(chatId, updated);
              return updated;
            });
            break;

          case 'online_users':
            setOnlineUsers(data.data);
            break;

          case 'message_deleted':
            setMessages(prev => {
              const updated = prev.filter(msg => msg.id !== data.data);
              saveEncryptedMessages(chatId, updated);
              return updated;
            });
            break;

          case 'chat_cleared':
            setMessages([]);
            saveEncryptedMessages(chatId, []);
            break;

          case 'error':
            console.error('Chat error:', data.data);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [user, chatId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (ws.current) ws.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback((text) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = { type: 'chat_message', text };
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const deleteMessage = useCallback((messageId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'delete_message', messageId }));
      return true;
    }
    return false;
  }, []);

  const clearChat = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'clear_chat' }));
      return true;
    }
    return false;
  }, []);

  return {
    messages,
    onlineUsers,
    isConnected,
    userRole,
    sendMessage,
    deleteMessage,
    clearChat,
    reconnect: connect,
  };
};
