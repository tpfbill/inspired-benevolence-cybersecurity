import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import apiClient from '../api/client';
import { formatDistanceToNow } from 'date-fns';

export default function Alerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/alerts');
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
                  <button className="btn btn-danger text-sm">Escalate</button>
                  <button className="btn btn-secondary text-sm">Acknowledge</button>
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
                  <button className="btn btn-primary text-sm">Investigate</button>
                  <button className="btn btn-secondary text-sm">Acknowledge</button>
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
                  <button className="btn btn-secondary text-sm">Review</button>
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
