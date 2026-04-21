import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, AlertTriangle, PlayCircle, FileText, Plus } from 'lucide-react';
import apiClient from '../api/client';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import IncidentForm from '../components/IncidentForm';

type FilterType = 'active' | 'resolved' | 'archived';

export default function Incidents() {
  const [incidentProgress, setIncidentProgress] = useState<Record<string, any>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await apiClient.get('/api/incidents');
      return response.data;
    },
  });

  // Fetch progress for incidents with playbooks
  useEffect(() => {
    if (incidents) {
      incidents.forEach(async (incident: any) => {
        if (incident.playbookId || incident.playbookSnapshot) {
          try {
            const response = await apiClient.get(`/api/task-progress/incident/${incident.id}/summary`);
            setIncidentProgress(prev => ({
              ...prev,
              [incident.id]: response.data
            }));
          } catch (error) {
            // Ignore errors for incidents without progress
          }
        }
      });
    }
  }, [incidents]);

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

  // Calculate counts for all sections
  const activeIncidents = incidents?.filter((i: any) => 
    !['resolved', 'closed', 'archived'].includes(i.status)
  ) || [];
  
  const resolvedIncidents = incidents?.filter((i: any) => 
    ['resolved', 'closed'].includes(i.status)
  ) || [];

  const archivedIncidents = incidents?.filter((i: any) => 
    i.status === 'archived'
  ) || [];

  // Filter incidents based on active filter
  const filteredIncidents = activeFilter === 'active' 
    ? activeIncidents 
    : activeFilter === 'resolved' 
    ? resolvedIncidents 
    : archivedIncidents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Security Incidents</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Incident
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeFilter === 'active'
              ? 'bg-orange-600 text-white shadow-lg scale-105'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Active
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeFilter === 'active' ? 'bg-white text-orange-600' : 'bg-orange-200 text-orange-800'
          }`}>
            {activeIncidents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('resolved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeFilter === 'resolved'
              ? 'bg-green-600 text-white shadow-lg scale-105'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Resolved
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeFilter === 'resolved' ? 'bg-white text-green-600' : 'bg-green-200 text-green-800'
          }`}>
            {resolvedIncidents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('archived')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeFilter === 'archived'
              ? 'bg-gray-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Archived
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeFilter === 'archived' ? 'bg-white text-gray-600' : 'bg-gray-200 text-gray-800'
          }`}>
            {archivedIncidents.length}
          </span>
        </button>
      </div>

      {/* Create Incident Modal */}
      {showCreateForm && (
        <IncidentForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}

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
                  
                  {/* Playbook Info */}
                  {(incident.playbookSnapshot || incident.playbookId) && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {incident.playbookSnapshot?.name || 'Playbook Assigned'}
                          </span>
                        </div>
                        {incidentProgress[incident.id] && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${incidentProgress[incident.id].percentComplete || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-blue-600">
                              {incidentProgress[incident.id].percentComplete || 0}%
                            </span>
                          </div>
                        )}
                      </div>
                      {incidentProgress[incident.id] && (
                        <div className="mt-2 text-xs text-gray-600">
                          {incidentProgress[incident.id].completed} of {incidentProgress[incident.id].total} tasks completed
                        </div>
                      )}
                    </div>
                  )}

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
                  
                  {/* Playbook Info for Resolved */}
                  {(incident.playbookSnapshot || incident.playbookId) && (
                    <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {incident.playbookSnapshot?.name || 'Playbook Used'}
                        </span>
                        {incidentProgress[incident.id] && (
                          <span className="ml-auto text-xs font-semibold text-green-600">
                            ✓ {incidentProgress[incident.id].percentComplete || 0}% Complete
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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

      {/* Archived Incidents */}
      {archivedIncidents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-600 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-500" />
            Archived Incidents
          </h2>
          {archivedIncidents.map((incident: any) => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className="card hover:shadow-lg transition-shadow opacity-60"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-semibold">ARCHIVED</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                  
                  {(incident.playbookSnapshot || incident.playbookId) && (
                    <div className="mb-3 p-2 bg-gray-100 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">
                          {incident.playbookSnapshot?.name || 'Playbook Used'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Archived {formatDistanceToNow(new Date(incident.archivedAt), { addSuffix: true })}</span>
                    {incident.archiveReason && (
                      <>
                        <span>•</span>
                        <span>{incident.archiveReason}</span>
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
