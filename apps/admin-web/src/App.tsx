import { useState } from 'react';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('fg_remember') === '1'
  );

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <DashboardPage onLogout={() => {
    localStorage.removeItem('fg_remember');
    setIsAuthenticated(false);
  }} />;
}

export default App;

