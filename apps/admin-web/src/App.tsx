import { useState } from 'react';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import type { AuthSession } from './types/auth.types';

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem('fg_session');
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(
    () => {
      if (localStorage.getItem('fg_remember') === '1') return readSession();
      return null;
    }
  );

  if (!session) {
    return (
      <LoginPage
        onLoginSuccess={() => setSession(readSession())}
      />
    );
  }

  return (
    <DashboardPage
      session={session}
      onLogout={() => {
        localStorage.removeItem('fg_remember');
        setSession(null);
      }}
    />
  );
}

export default App;

