
import { createContext, useContext, useState } from 'react';

const AppEventsContext = createContext();

export function AppEventsProvider({ children }) {
  const [refreshParticipants, setRefreshParticipants] = useState(0);

  const triggerParticipantsRefresh = () => {
    setRefreshParticipants(prev => prev + 1);
  };

  return (
    <AppEventsContext.Provider value={{
      refreshParticipants,
      triggerParticipantsRefresh
    }}>
      {children}
    </AppEventsContext.Provider>
  );
}

export const useAppEvents = () => {
  const context = useContext(AppEventsContext);
  if (!context) {
    throw new Error('useAppEvents must be used within AppEventsProvider');
  }
  return context;
};