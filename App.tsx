import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import UniversityDetails from './pages/UniversityDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import UserProfileModal from './components/UserProfileModal';
import Profile from './pages/Profile';
import { User, KnowledgeDoc, University } from './types';
import { api } from './services/api';

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
  const [universities, setUniversities] = useState<University[]>([]);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Shared Navbar / Dashboard Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    let mounted = true;
    async function loadDocs() {
      if (!user || user.role !== 'admin') return;
      try {
        const docs = await api.getKnowledge();
        if (!mounted) return;
        setKnowledgeDocs(docs.map((d: any) => ({ id: d.id, title: d.title, content: d.content, type: d.type, uploadedAt: typeof d.uploadedAt === 'string' ? d.uploadedAt : new Date(d.uploadedAt).toISOString() })));
      } catch (err) {
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
        const nextUniversities = Array.isArray(data) ? (data as University[]) : [];
        setUniversities(nextUniversities);
      } catch (err) {
        console.error('Failed to load universities', err);
        if (!mounted) return;
        setUniversities([]);
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

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#FBF7F1]">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          universities={universities}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        <main className="flex-grow flex flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <Home
                    user={user}
                    universities={universities}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                  />
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

            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile user={user} onUpdateUser={handleUpdateUser} />
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

        {user && isProfileModalOpen && (
          <UserProfileModal
            user={user}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateUser={handleUpdateUser}
          />
        )}

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
