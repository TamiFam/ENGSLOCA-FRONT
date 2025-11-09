import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ParticipantsSidebar() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { token, user } = useAuth();
  const API_BASE = "https://engsloca-back.onrender.com";

  // Мемоизируем функции
  const getRoleSymbol = useCallback((role) => {
    switch (role) {
      case 'admin': return '🚀';
      case 'member': return '💎';
      case 'viewer': return '👀';
      default: return '❓';
    }
  }, []);

  const getLastSeenText = useCallback((lastSeen) => {
    if (!lastSeen) return 'никогда';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins}м`;
    if (diffHours < 24) return `${diffHours}ч`;
    if (diffDays === 1) return '1д';
    if (diffDays < 7) return `${diffDays}д`;
    return `${Math.floor(diffDays / 7)}н`;
  }, []);

  // Загрузка участников только при монтировании
  const loadParticipants = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Загружаем только при монтировании и при изменении токена
  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Убираем интервал - обновляем только при явном действии
  const handleRefresh = useCallback(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Мемоизируем статистику
  const stats = useMemo(() => ({
    total: participants.length,
    online: participants.filter(p => p.isOnline).length
  }), [participants]);

  // Мемоизируем представления
  const MobileCompactView = useMemo(() => (
    <div className="lg:hidden">
      <div 
        className="bg-black text-white p-3 border-2 border-black flex items-center justify-between cursor-pointer transition-colors duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-black">👥</span>
          <span className="text-sm font-black">УЧАСТНИКИ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-green-500 text-white px-1 font-bold">
            {stats.online}
          </span>
          <span className="text-white text-sm">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border-x-2 border-b-2 border-black dark:border-gray-600 max-h-60 overflow-y-auto transition-colors duration-300">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`border-b border-gray-300 dark:border-gray-600 p-3 ${
                participant.isOnline ? 'bg-green-50 dark:bg-green-900' : 'bg-white dark:bg-gray-800'
              } transition-colors duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border-2 border-black dark:border-gray-400 ${
                  participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                } transition-colors duration-300`} />
                
                <span className="text-lg">
                  {getRoleSymbol(participant.role)}
                </span>
                
                <div className="flex-1">
                  <div className="font-bold text-sm text-black dark:text-white transition-colors duration-300">
                    {participant.username}
                  </div>
                  {!participant.isOnline && participant.lastSeen && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {getLastSeenText(participant.lastSeen)}
                    </div>
                  )}
                </div>
                
                {participant.isOnline && (
                  <span className="text-xs bg-black dark:bg-gray-700 text-white px-2 py-1 font-bold rounded transition-colors duration-300">
                    ON
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ), [isExpanded, participants, stats.online, getRoleSymbol, getLastSeenText]);

  const CompactList = useMemo(() => (
    <div className="hidden lg:block w-64">
      <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg transition-colors duration-300">
        <div className="bg-black text-white p-3 border-b-2 border-black dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">👥 УЧАСТНИКИ</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded font-bold">
                {stats.online}
              </span>
              <button 
                onClick={handleRefresh}
                className="text-white hover:text-gray-300 transition-colors"
              >
                ⟳
              </button>
            </div>
          </div>
        </div>
  
        <div className="max-h-48 overflow-y-auto p-2">
          {participants.slice(0, 8).map((participant) => (
            <div key={participant.id} className="flex items-center gap-2 p-2 text-sm border-b border-gray-200 dark:border-gray-600 last:border-b-0">
              <div className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-base">{getRoleSymbol(participant.role)}</span>
              <span className="flex-1 truncate font-medium text-black dark:text-white">
                {participant.username}
              </span>
              {!participant.isOnline && participant.lastSeen && (
  <div className="text-xs text-gray-500 dark:text-gray-400">
    {getLastSeenText(participant.lastSeen)}
  </div>
)}
            </div>
          ))}
          {participants.length > 8 && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 p-2">
              +{participants.length - 8} ещё
            </div>
          )}
        </div>
      </div>
    </div>
  ), [participants, stats, handleRefresh, getRoleSymbol,getLastSeenText]);
  return (
    <>
      {MobileCompactView}
      {CompactList}
    </>
  );
}