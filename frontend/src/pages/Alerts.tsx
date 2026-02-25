import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import { formatDistanceToNow } from 'date-fns';

export default function Alerts() {
  const queryClient = useQueryClient();
  const [escalatingAlert, setEscalatingAlert] = useState<string | null>(null);

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Security Alerts</h1>
        <div className="flex space-x-3">
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-danger-100 text-danger-700">
            {criticalAlerts.length} Critical
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-warning-100 text-warning-700">
            {highAlerts.length} High
          </span>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-danger-700 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Critical Alerts - Immediate Action Required
          </h2>
          {criticalAlerts.map((alert: any) => (
            <div key={alert.id} className="card border-l-4 border-danger-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(alert.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>•</span>
                    <span>Detected {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}</span>
                    {alert.affectedAssets && alert.affectedAssets.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Assets: {alert.affectedAssets.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
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
                  {alert.status === 'escalated' && (
                    <span className="text-sm text-primary-600 font-medium">
                      ✓ Escalated to Incident
                    </span>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High Priority Alerts */}
      {highAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-warning-700 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            High Priority Alerts
          </h2>
          {highAlerts.map((alert: any) => (
            <div key={alert.id} className="card border-l-4 border-warning-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(alert.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>•</span>
                    <span>Detected {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}</span>
                    {alert.affectedAssets && alert.affectedAssets.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Assets: {alert.affectedAssets.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  {alert.status === 'new' && (
                    <>
                      <button 
                        onClick={() => handleEscalate(alert)}
                        disabled={escalatingAlert === alert.id}
                        className="btn btn-primary text-sm flex items-center"
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
                  {alert.status === 'escalated' && (
                    <span className="text-sm text-primary-600 font-medium">
                      ✓ Escalated to Incident
                    </span>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Other Alerts */}
      {otherAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Other Alerts</h2>
          {otherAlerts.map((alert: any) => (
            <div key={alert.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(alert.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>•</span>
                    <span>Detected {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}</span>
                    {alert.affectedAssets && alert.affectedAssets.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Assets: {alert.affectedAssets.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  {alert.status === 'new' && (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      className="btn btn-secondary text-sm"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status === 'escalated' && (
                    <span className="text-sm text-primary-600 font-medium">
                      ✓ Escalated to Incident
                    </span>
                  )}
                  {alert.status === 'acknowledged' && (
                    <span className="text-sm text-success-600 font-medium">
                      ✓ Acknowledged
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts?.length === 0 && (
        <div className="card text-center py-12">
          <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Alerts</h3>
          <p className="text-gray-600">All clear! No security alerts at this time.</p>
        </div>
      )}
    </div>
  );
}
