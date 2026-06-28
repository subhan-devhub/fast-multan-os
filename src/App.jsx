import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { DialogProvider } from './context/DialogContext';

// Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import StudyGroups from './pages/StudyGroups';
import StudyResources from './pages/StudyResources';
import Alumni from './pages/Alumni';
import Faculty from './pages/Faculty';
import Complaint from './pages/Complaint';
import CampusMap from './pages/CampusMap';

function App() {
  return (
    <DialogProvider>
      <Router>
        <Routes>
          {/* Real Firebase Routes */}
          <Route path="/" element={<AuthProvider><SignIn /></AuthProvider>} />
          <Route path="/signup" element={<AuthProvider><SignUp /></AuthProvider>} />
          
          {/* Real Firebase Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/events"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/study-groups"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <StudyGroups />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/study-resources"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <StudyResources />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/alumni"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <Alumni />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/faculty"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <Faculty />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/complaint"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <Complaint />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
          <Route
            path="/campus-map"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <CampusMap />
                </ProtectedRoute>
              </AuthProvider>
            }
          />
        </Routes>
      </Router>
    </DialogProvider>
  );
}

export default App;
