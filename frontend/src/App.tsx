import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Universities from './pages/Universities';
import UniversityDetails from './pages/UniversityDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import UniversityEdit from './pages/admin/UniversityEdit';
import UserProfileModal from './components/UserProfileModal';
import Profile from './pages/Profile';
import { LanguageProvider } from './context/LanguageContext';
import { User, KnowledgeDoc, University } from './types';
import { api } from './services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user, adminOnly = false }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !['admin', 'agent'].includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Shared Navbar / Dashboard Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.slice(1);
      window.history.replaceState(null, '', cleanPath || '/');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function restoreSession() {
      try {
        const res = await api.getSession();
        if (!mounted) return;
        setUser(res.user);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setAuthReady(true);
      }
    }
    restoreSession();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadDocs() {
      if (!user || !['admin', 'agent'].includes(user.role)) return;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleAuth = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.postLogout();
    } catch {
      // Clear local state even if the network call fails.
    } finally {
      setUser(null);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleUniversityChange = (updatedUniversity: University) => {
    setUniversities((current) =>
      current.map((university) => university.id === updatedUniversity.id ? updatedUniversity : university)
    );
  };

  return (
    <LanguageProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#FBF7F1]">
          <Navbar
            user={user}
            onLogout={handleLogout}
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
                }
              />

              <Route path="/universities" element={<Universities />} />

              <Route
                path="/university/:slug"
                element={<UniversityDetails universities={universities} />}
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
                    <Admin user={user} onUniversitiesChange={setUniversities} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/universities/:id/edit"
                element={
                  <ProtectedRoute user={user} adminOnly>
                    <UniversityEdit onUniversityChange={handleUniversityChange} />
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
    </LanguageProvider>
  );
};

export default App;
