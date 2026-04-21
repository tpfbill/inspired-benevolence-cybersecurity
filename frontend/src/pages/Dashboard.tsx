import { useQuery } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import apiClient from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await apiClient.get('/api/incidents');
      return response.data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/alerts');
      return response.data;
    },
  });

  const { data: compliance } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const response = await apiClient.get('/api/compliance/dashboard');
      console.log('Compliance data:', response.data);
      return response.data;
    },
  });

  const activeIncidents = incidents?.filter((i: any) => 
    !['resolved', 'closed'].includes(i.status)
  ).length || 0;

  const criticalAlerts = alerts?.filter((a: any) => 
    a.severity === 'critical' && a.status === 'new'
  ).length || 0;

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Incidents
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {activeIncidents}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Critical Alerts
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {criticalAlerts}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Resolution Rate
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {compliance?.summary?.resolutionRate?.toFixed(1) || 0}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg Response Time
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {Math.round((compliance?.averageResolutionTime || 0) / 3600)}h
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Incidents by Type
          </h3>
          {compliance?.incidentsByType && compliance.incidentsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compliance.incidentsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="incidentType" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No incidents data available</p>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Incidents by Severity
          </h3>
          {compliance?.incidentsBySeverity && compliance.incidentsBySeverity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={compliance.incidentsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.severity}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {compliance.incidentsBySeverity.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No incidents data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Incidents
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detected
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents?.slice(0, 5).map((incident: any) => (
                <tr key={incident.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {incident.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {incident.incidentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge badge-${incident.severity}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {incident.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(incident.detectedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
