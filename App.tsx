import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import UniversityDetails from './pages/UniversityDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { User, KnowledgeDoc, University } from './types';
import { api } from './services/api';
import { UNIVERSITIES } from './constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user, adminOnly = false }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [universities, setUniversities] = useState<University[]>(UNIVERSITIES as University[]);

  useEffect(() => {
    let mounted = true;
    async function loadDocs() {
      if (!user || user.role !== 'admin') return;
      try {
        const docs = await api.getKnowledge();
        if (!mounted) return;
        // backend returns uploadedAt as ISO string; keep as ISO string (matches KnowledgeDoc type + api response shape)
        setKnowledgeDocs(docs.map((d: any) => ({ id: d.id, title: d.title, content: d.content, type: d.type, uploadedAt: typeof d.uploadedAt === 'string' ? d.uploadedAt : new Date(d.uploadedAt).toISOString() })));
      } catch (err) {
        // silently ignore; admin UI will handle errors when open
        console.error('Failed to load knowledge docs', err);
      }
    }
    loadDocs();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function loadUniversities() {
      try {
        const data = await api.getUniversities();
        if (!mounted) return;
        const nextUniversities = Array.isArray(data) && data.length > 0 ? (data as University[]) : UNIVERSITIES;
        setUniversities(nextUniversities);
      } catch (err) {
        console.error('Failed to load universities', err);
        if (!mounted) return;
        setUniversities(UNIVERSITIES as University[]);
      }
    }

    loadUniversities();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const handleAuth = (userData: any) => {
    setUser(userData);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-grow flex flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <Home user={user} universities={universities} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/university/:slug"
              element={
                <ProtectedRoute user={user}>
                  <UniversityDetails universities={universities} />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login onLogin={handleAuth} />} />
            <Route path="/register" element={<Register onRegister={handleAuth} />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} adminOnly>
                  <Admin user={user} />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {user && (
          <ChatWidget
            user={user}
            knowledgeDocs={knowledgeDocs}
            universities={universities}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
