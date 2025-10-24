import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ParticipantsSidebar() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { token, user } = useAuth();
  const API_BASE = "https://engsloca-back.onrender.com";

  // Мемоизируем функцию для стабильной ссылки
  const getRoleSymbol = useCallback((role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'member': return '👤';
      case 'viewer': return '👀';
      default: return '❓';
    }
  }, []);

  // Мемоизируем функцию форматирования времени
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
        setParticipants(prevParticipants => {
          const prevMap = new Map(prevParticipants.map(p => [p.id, p]));
          const newMap = new Map(data.participants.map(p => [p.id, p]));
          
          let hasChanges = false;
          if (prevParticipants.length !== data.participants.length) {
            hasChanges = true;
          } else {
            for (const newParticipant of data.participants) {
              const oldParticipant = prevMap.get(newParticipant.id);
              if (!oldParticipant || 
                  oldParticipant.isOnline !== newParticipant.isOnline ||
                  oldParticipant.lastSeen !== newParticipant.lastSeen) {
                hasChanges = true;
                break;
              }
            }
          }
          
          return hasChanges ? data.participants : prevParticipants;
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadParticipants();
      const interval = setInterval(loadParticipants, 10000);
      return () => clearInterval(interval);
    }
  }, [loadParticipants, token]);

  // Мемоизируем статистику
  const stats = useMemo(() => ({
    total: participants.length,
    online: participants.filter(p => p.isOnline).length
  }), [participants]);

  // Компактный вид для мобильных
  const MobileCompactView = () => (
    <div className="lg:hidden">
      <div 
        className="bg-black text-white p-3 border-2 border-black flex items-center justify-between cursor-pointer"
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
        <div className="bg-white border-x-2 border-b-2 border-black max-h-60 overflow-y-auto">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`border-b border-gray-300 p-3 ${
                participant.isOnline ? 'bg-green-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border-2 border-black ${
                  participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                
                <span className="text-lg">
                  {getRoleSymbol(participant.role)}
                </span>
                
                <div className="flex-1">
                  <div className="font-bold text-sm">{participant.username}</div>
                  {!participant.isOnline && participant.lastSeen && (
                    <div className="text-xs text-gray-600">
                      {getLastSeenText(participant.lastSeen)}
                    </div>
                  )}
                </div>
                
                {participant.isOnline && (
                  <span className="text-xs bg-black text-white px-2 py-1 font-bold rounded">
                    ON
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Десктопный вид
  const DesktopView = () => (
    <div className="hidden lg:block w-64 bg-white border-4 border-black relative">
      <div className="bg-black text-white p-4 border-b-4 border-black">
        <h3 className="text-lg font-black text-center">УЧАСТНИКИ</h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border-2 border-gray-300 p-3 bg-gray-100 animate-pulse rounded">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-6 h-3 bg-gray-400 rounded"></div>
                  <div className="flex-1 h-3 bg-gray-400 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-400 rounded">
            <p className="text-gray-600 text-sm font-bold">ПУСТО</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`border-2 border-black p-3 rounded-lg transition-all duration-500 ${
                  participant.isOnline 
                    ? 'bg-green-50 hover:bg-green-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 border-black transition-colors duration-700 ${
                    participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  
                  <span className="text-lg" title={`Роль: ${participant.role}`}>
                    {getRoleSymbol(participant.role)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">
                      {participant.username}
                    </div>
                    {!participant.isOnline && participant.lastSeen && (
                      <div className="text-xs text-gray-600 mt-1">
                        Был: {getLastSeenText(participant.lastSeen)}
                      </div>
                    )}
                  </div>
                  
                  {participant.isOnline ? (
                    <span className="text-xs bg-black text-white px-2 py-1 font-bold rounded">
                      ON
                    </span>
                  ) : (
                    <span 
                      className="text-xs bg-gray-200 px-2 py-1 border border-black font-mono rounded"
                      title={`Был: ${new Date(participant.lastSeen).toLocaleString()}`}
                    >
                      {getLastSeenText(participant.lastSeen)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-100 border-t-4 border-black p-3">
        <div className="flex justify-between text-sm font-bold">
          <span>ВСЕГО: {stats.total}</span>
          <span className="text-green-600">
            ONLINE: {stats.online}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileCompactView />
      <DesktopView />
    </>
  );
}