// src/hooks/useChat.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { user } = useAuth(); 
  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
        // 🔥 ЗАКРЫВАЕМ предыдущее соединение если есть
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.close();
        }
    // 🔥 ИСПРАВЛЕНИЕ: Всегда используем ваш бэкенд на Render
    const wsUrl = 'wss://engsloca-back.onrender.com/ws';

    // console.log('🔌 Connecting to WebSocket:', wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
    //   console.log('💬 Connected to chat');
      if (user) {
        setUserRole(user.role);
        // console.log('🎯 User role set to:', user.role);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log('📨 WebSocket message received:', data.type);
        
        switch (data.type) {
          case 'welcome':
            console.log('👋 Welcome message:', data.message);
            break;
          case 'message_history':
            setMessages(data.data);
            break;
          case 'new_message':
            setMessages(prev => [...prev, data.data]);
            break;
          case 'online_users':
            setOnlineUsers(data.data);
           
            break;
          case 'message_deleted':
            setMessages(prev => prev.filter(msg => msg.id !== data.data));
            break;
          case 'chat_cleared':
            setMessages([]);
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

    ws.current.onclose = (event) => {
      setIsConnected(false);
    //   console.log('💬 Disconnected from chat:', event.code, event.reason);
      
    reconnectTimeoutRef.current = setTimeout(() => {
        // console.log('💬 Attempting to reconnect...');
        connect();
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [user]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((text) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat_message',
        text: text
      };
      ws.current.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  }, []);

  const deleteMessage = useCallback((messageId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'delete_message',
        messageId: messageId
      }));
      return true;
    }
    return false;
  }, []);

  const clearChat = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'clear_chat'
      }));
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
    reconnect: connect
  };
};