import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, XCircle, ArrowRight, Archive, Shield, Trash2 } from 'lucide-react';
import apiClient from '../api/client';
import { formatDistanceToNow, format } from 'date-fns';

type FilterType = 'active' | 'resolved' | 'archived';

export default function Alerts() {
  const queryClient = useQueryClient();
  const [escalatingAlert, setEscalatingAlert] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/alerts');
      return response.data;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiClient.put(`/api/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: async ({ alertId, incidentId }: { alertId: string; incidentId: string }) => {
      return apiClient.put(`/api/alerts/${alertId}/escalate`, { incidentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setEscalatingAlert(null);
    },
  });

  const handleAcknowledge = (alertId: string) => {
    acknowledgeMutation.mutate(alertId);
  };

  const handleEscalate = async (alert: any) => {
    // Map alert to incident type
    const incidentTypeMap: any = {
      'ransomware': 'ransomware',
      'phishing': 'phishing',
      'ddos': 'ddos',
      'malware': 'malware',
      'unauthorized': 'unauthorized_access',
      'breach': 'data_breach',
      'insider': 'insider_threat'
    };

    // Try to guess incident type from alert title/description
    let incidentType = 'custom';
    const alertText = (alert.title + ' ' + alert.description).toLowerCase();
    
    for (const [key, value] of Object.entries(incidentTypeMap)) {
      if (alertText.includes(key)) {
        incidentType = value;
        break;
      }
    }

    // Determine severity based on alert severity
    const severityMap: any = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };

    try {
      // Create new incident from alert
      const incidentResponse = await apiClient.post('/api/incidents', {
        title: alert.title,
        description: alert.description,
        incidentType,
        severity: severityMap[alert.severity] || 'medium',
        affectedSystems: alert.affectedAssets || []
      });

      const newIncidentId = incidentResponse.data.id;

      // Link alert to incident
      await escalateMutation.mutateAsync({ 
        alertId: alert.id, 
        incidentId: newIncidentId 
      });

      // Show success message or redirect
      alert('Alert escalated to incident successfully! Incident ID: ' + newIncidentId);
    } catch (error) {
      console.error('Error escalating alert:', error);
      alert('Failed to escalate alert. Please try again.');
    }
  };

  // Archive mutation
  const archiveAlertMutation = useMutation({
    mutationFn: async ({ alertId, reason }: { alertId: string; reason: string }) => {
      return apiClient.post(`/api/alerts/${alertId}/archive`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  // Restore mutation
  const restoreAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiClient.post(`/api/alerts/${alertId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  // Delete mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiClient.delete(`/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  const handleArchive = (alertId: string) => {
    const reason = window.prompt('Reason for archiving this alert:', 'Alert reviewed and no action needed');
    if (reason) {
      archiveAlertMutation.mutate({ alertId, reason });
    }
  };

  const handleRestore = (alertId: string) => {
    if (window.confirm('Restore this alert?')) {
      restoreAlertMutation.mutate(alertId);
    }
  };

  const handleDelete = (alert: any) => {
    if (alert.incidentId) {
      window.alert('Cannot delete an alert that has been escalated to an incident. Archive it instead.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete this alert?\n\n"${alert.title}"\n\nThis action cannot be undone.`)) {
      deleteAlertMutation.mutate(alert.id);
    }
  };

  // Filter alerts by status
  const activeAlerts = alerts?.filter((a: any) => 
    !['resolved', 'false_positive', 'archived'].includes(a.status)
  ) || [];
  
  const resolvedAlerts = alerts?.filter((a: any) => 
    ['resolved', 'false_positive'].includes(a.status)
  ) || [];

  const archivedAlerts = alerts?.filter((a: any) => 
    a.status === 'archived'
  ) || [];

  // Filter based on active filter
  const filteredAlerts = activeFilter === 'active' 
    ? activeAlerts 
    : activeFilter === 'resolved' 
    ? resolvedAlerts 
    : archivedAlerts;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger-100 text-danger-700 border-danger-300';
      case 'high': return 'bg-warning-100 text-warning-700 border-warning-300';
      case 'medium': return 'bg-primary-100 text-primary-700 border-primary-300';
      case 'low': return 'bg-success-100 text-success-700 border-success-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-5 w-5 text-danger-600" />;
      case 'acknowledged': return <Clock className="h-5 w-5 text-warning-600" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'false_positive': return <XCircle className="h-5 w-5 text-gray-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading alerts...</div>
      </div>
    );
  }

  const criticalAlerts = alerts?.filter((a: any) => a.severity === 'critical') || [];
  const highAlerts = alerts?.filter((a: any) => a.severity === 'high') || [];
  const otherAlerts = alerts?.filter((a: any) => !['critical', 'high'].includes(a.severity)) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Security Alerts</h1>

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
            {activeAlerts.length}
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
            {resolvedAlerts.length}
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
          <Archive className="w-4 h-4" />
          Archived
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeFilter === 'archived' ? 'bg-white text-gray-600' : 'bg-gray-200 text-gray-800'
          }`}>
            {archivedAlerts.length}
          </span>
        </button>
      </div>

      {/* Filtered Alerts Display */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert: any) => (
            <div key={alert.id} className={`card hover:shadow-lg transition-shadow ${
              alert.status === 'archived' ? 'opacity-70' : ''
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(alert.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.status === 'new' ? 'bg-warning-100 text-warning-700' :
                      alert.status === 'investigating' || alert.status === 'acknowledged' ? 'bg-primary-100 text-primary-700' :
                      alert.status === 'resolved' || alert.status === 'false_positive' ? 'bg-success-100 text-success-700' :
                      alert.status === 'escalated' ? 'bg-danger-100 text-danger-700' :
                      alert.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  
                  {alert.status === 'archived' && alert.archiveReason && (
                    <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                      <span className="text-xs font-medium text-gray-700">Archive Reason: </span>
                      <span className="text-xs text-gray-600">{alert.archiveReason}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>•</span>
                    <span title={alert.status === 'archived' 
                      ? format(new Date(alert.archivedAt), 'MMM d, yyyy h:mm a')
                      : format(new Date(alert.detectedAt), 'MMM d, yyyy h:mm a')
                    }>
                      {alert.status === 'archived' 
                        ? `Archived: ${format(new Date(alert.archivedAt), 'MMM d, yyyy h:mm a')} (${formatDistanceToNow(new Date(alert.archivedAt), { addSuffix: true })})`
                        : `Detected: ${format(new Date(alert.detectedAt), 'MMM d, yyyy h:mm a')} (${formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })})`
                      }
                    </span>
                    {alert.affectedAssets && alert.affectedAssets.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Assets: {alert.affectedAssets.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  {alert.status === 'archived' ? (
                    <>
                      <button 
                        onClick={() => handleRestore(alert.id)}
                        disabled={restoreAlertMutation.isPending}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <Shield className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDelete(alert)}
                        disabled={deleteAlertMutation.isPending}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      {alert.status === 'new' && (
                        <>
                          <button 
                            onClick={() => handleEscalate(alert)}
                            disabled={escalatingAlert === alert.id}
                            className="btn btn-danger text-sm flex items-center"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            {escalatingAlert === alert.id ? 'Escalating...' : 'Escalate'}
                          </button>
                          <button 
                            onClick={() => handleAcknowledge(alert.id)}
                            className="btn btn-secondary text-sm"
                          >
                            Acknowledge
                          </button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button 
                          onClick={() => handleEscalate(alert)}
                          className="btn btn-primary text-sm flex items-center"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Escalate
                        </button>
                      )}
                      {alert.status === 'escalated' && (
                        <span className="text-sm text-primary-600 font-medium">
                          ✓ Escalated to Incident
                        </span>
                      )}
                      {alert.status !== 'escalated' && (
                        <>
                          <button
                            onClick={() => handleArchive(alert.id)}
                            disabled={archiveAlertMutation.isPending}
                            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center gap-1 disabled:opacity-50"
                          >
                            <Archive className="w-4 h-4" />
                            Archive
                          </button>
                          {!alert.incidentId && (
                            <button
                              onClick={() => handleDelete(alert)}
                              disabled={deleteAlertMutation.isPending}
                              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1 disabled:opacity-50"
                              title="Permanently delete this alert"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {activeFilter === 'active' ? 'Active' : activeFilter === 'resolved' ? 'Resolved' : 'Archived'} Alerts
          </h3>
          <p className="text-gray-600">
            {activeFilter === 'active' && 'No active alerts at this time.'}
            {activeFilter === 'resolved' && 'No resolved alerts yet.'}
            {activeFilter === 'archived' && 'No archived alerts yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
