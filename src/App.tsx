import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { ChatProvider } from '@context/ChatContext';
import { ProtectedRoute } from '@components/auth';
import { Login, Home, Explore, FlowEditor, ChatHistory } from '@pages/index';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <ChatHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flow/:key"
              element={
                <ProtectedRoute>
                  <FlowEditor />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
