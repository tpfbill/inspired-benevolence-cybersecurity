import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Playbooks from './pages/Playbooks';
import PlaybookEditorNew from './pages/PlaybookEditorNew';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import Settings from './pages/Settings';
import Alerts from './pages/Alerts';
import Users from './pages/Users';
import Roles from './pages/Roles';
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
        <Route path="playbooks/new" element={<PlaybookEditorNew />} />
        <Route path="playbooks/:id" element={<PlaybookEditorNew />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="incidents/:id" element={<IncidentDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
      </Route>
    </Routes>
  );
}

export default App;
