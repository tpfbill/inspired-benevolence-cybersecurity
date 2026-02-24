import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Playbooks from './pages/Playbooks';
import PlaybookEditor from './pages/PlaybookEditor';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import Alerts from './pages/Alerts';
import Compliance from './pages/Compliance';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="playbooks" element={<Playbooks />} />
        <Route path="playbooks/new" element={<PlaybookEditor />} />
        <Route path="playbooks/:id" element={<PlaybookEditor />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="incidents/:id" element={<IncidentDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="compliance" element={<Compliance />} />
      </Route>
    </Routes>
  );
}

export default App;
