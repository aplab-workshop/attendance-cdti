// Root app

const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [user, setUser] = useStateApp(() => Session.user);

  const logout = () => {
    if (!confirm('ออกจากระบบหรือไม่?')) return;
    Session.logout();
    setUser(null);
  };

  if (!user) return <LoginScreen onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <AdminApp user={user} onLogout={logout} />;
  return <TeacherApp user={user} onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
