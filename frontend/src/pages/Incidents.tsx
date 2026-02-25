import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';
import { formatDistanceToNow } from 'date-fns';

export default function Incidents() {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await apiClient.get('/api/incidents');
      return response.data;
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger-100 text-danger-700 border-danger-300';
      case 'high': return 'bg-warning-100 text-warning-700 border-warning-300';
      case 'medium': return 'bg-primary-100 text-primary-700 border-primary-300';
      case 'low': return 'bg-success-100 text-success-700 border-success-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'text-success-600 bg-success-50';
      case 'investigating':
      case 'contained':
      case 'eradicating':
        return 'text-warning-600 bg-warning-50';
      case 'detected':
        return 'text-danger-600 bg-danger-50';
      case 'recovering':
        return 'text-primary-600 bg-primary-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-5 w-5" />;
      case 'investigating':
      case 'contained':
      case 'eradicating':
      case 'recovering':
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading incidents...</div>
      </div>
    );
  }

  const activeIncidents = incidents?.filter((i: any) => 
    !['resolved', 'closed'].includes(i.status)
  ) || [];
  
  const resolvedIncidents = incidents?.filter((i: any) => 
    ['resolved', 'closed'].includes(i.status)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Security Incidents</h1>
        <div className="flex space-x-3">
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-warning-100 text-warning-700">
            {activeIncidents.length} Active
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-700">
            {resolvedIncidents.length} Resolved
          </span>
        </div>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-warning-600" />
            Active Incidents
          </h2>
          {activeIncidents.map((incident: any) => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className="card hover:shadow-lg transition-shadow border-l-4 border-warning-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      <span className="text-sm font-semibold capitalize">
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {incident.incidentType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Detected {formatDistanceToNow(new Date(incident.detectedAt), { addSuffix: true })}</span>
                    {incident.affectedSystems && incident.affectedSystems.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Systems: {incident.affectedSystems.slice(0, 2).join(', ')}
                          {incident.affectedSystems.length > 2 && ` +${incident.affectedSystems.length - 2} more`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Resolved Incidents */}
      {resolvedIncidents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-success-600" />
            Resolved Incidents
          </h2>
          {resolvedIncidents.map((incident: any) => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className="card hover:shadow-lg transition-shadow opacity-80"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      <span className="text-sm font-semibold capitalize">
                        {incident.status}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Resolved {formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })}</span>
                    {incident.postMortem && (
                      <>
                        <span>•</span>
                        <span className="text-success-600">✓ Post-mortem completed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {incidents?.length === 0 && (
        <div className="card text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Incidents</h3>
          <p className="text-gray-600">No security incidents have been created yet.</p>
        </div>
      )}
    </div>
  );
}
