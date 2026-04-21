import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users,
  Calendar,
  PlayCircle,
  ChevronRight,
  Plus,
  Upload,
  ListTodo,
  Archive,
  RotateCcw,
  TrendingUp,
  Trash2
} from 'lucide-react';
import apiClient from '../api/client';
import { format, formatDistanceToNow } from 'date-fns';
import ActivePlaybookView from '../components/ActivePlaybookView';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newTimelineEntry, setNewTimelineEntry] = useState({ action: '', description: '' });
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'playbook' | 'tasks'>('playbook');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/incidents/${id}`);
      return response.data;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/incidents/${id}/tasks`);
      return response.data || [];
    },
    enabled: !!id,
  });

  const { data: playbook } = useQuery({
    queryKey: ['playbook', incident?.playbookId],
    queryFn: async () => {
      if (!incident?.playbookId) return null;
      const response = await apiClient.get(`/api/playbooks/${incident.playbookId}`);
      return response.data;
    },
    enabled: !!incident?.playbookId,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/api/users');
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiClient.put(`/api/incidents/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  const addTimelineMutation = useMutation({
    mutationFn: async (entry: { action: string; description: string }) => {
      return apiClient.post(`/api/incidents/${id}/timeline`, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      setNewTimelineEntry({ action: '', description: '' });
      setShowAddTimeline(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      return apiClient.put(`/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const sendNotificationsMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/notifications/incident/${id}/notify`);
    },
    onSuccess: (response) => {
      alert(`✅ Sent ${response.data.notified} task notifications!\n${response.data.skipped} tasks skipped (awaiting dependencies).`);
    },
    onError: (error: any) => {
      alert(`❌ Failed to send notifications: ${error.response?.data?.message || error.message}`);
    },
  });

  const archiveIncidentMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiClient.post(`/api/incidents/${id}/archive`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      alert('✅ Incident archived successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Failed to archive incident: ${error.response?.data?.message || error.message}`);
    },
  });

  const restoreIncidentMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/incidents/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      alert('✅ Incident restored successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Failed to restore incident: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteIncidentMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/api/incidents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      alert('✅ Incident deleted successfully!');
      navigate('/incidents');
    },
    onError: (error: any) => {
      alert(`❌ Failed to delete incident: ${error.response?.data?.error || error.message}`);
    },
  });

  const escalateIncidentMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/incidents/${id}/escalate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      alert('✅ Incident escalated!');
    },
    onError: (error: any) => {
      alert(`❌ Failed to escalate incident: ${error.response?.data?.message || error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading incident details...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="card text-center py-12">
        <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Incident Not Found</h3>
        <p className="text-gray-600">The incident you're looking for doesn't exist.</p>
      </div>
    );
  }

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
        return 'bg-success-600';
      case 'investigating':
      case 'contained':
      case 'eradicating':
        return 'bg-warning-600';
      case 'detected':
        return 'bg-danger-600';
      case 'recovering':
        return 'bg-primary-600';
      default:
        return 'bg-gray-600';
    }
  };

  const statusOptions = [
    'detected',
    'investigating',
    'contained',
    'eradicating',
    'recovering',
    'resolved',
    'closed'
  ];

  const handleAddTimeline = () => {
    if (newTimelineEntry.action && newTimelineEntry.description) {
      addTimelineMutation.mutate(newTimelineEntry);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
  };

  const handleTaskAssignment = (taskId: string, userId: string) => {
    updateTaskMutation.mutate({ taskId, updates: { assignedTo: userId } });
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-700';
      case 'in_progress': return 'bg-primary-100 text-primary-700';
      case 'blocked': return 'bg-danger-100 text-danger-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded text-sm font-semibold border ${getSeverityColor(incident.severity)}`}>
                {incident.severity.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                {incident.incidentType.replace('_', ' ').toUpperCase()}
              </span>
              {incident.escalationLevel && incident.escalationLevel > 1 && (
                <span className="text-sm font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded border border-orange-300 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  ESCALATION LEVEL {incident.escalationLevel}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{incident.title}</h1>
            <p className="text-gray-600 mb-4">{incident.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Detected:</span>
                <span className="ml-2 font-medium">{format(new Date(incident.detectedAt), 'PPpp')}</span>
                <span className="ml-2 text-gray-500">({formatDistanceToNow(new Date(incident.detectedAt), { addSuffix: true })})</span>
              </div>
              {incident.resolvedAt && (
                <div>
                  <span className="text-gray-500">Resolved:</span>
                  <span className="ml-2 font-medium">{format(new Date(incident.resolvedAt), 'PPpp')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={incident.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                className={`px-4 py-2 rounded-lg text-white font-semibold ${getStatusColor(incident.status)}`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Escalate Button */}
              {incident.status !== 'archived' && incident.status !== 'resolved' && incident.status !== 'closed' && (
                <button
                  onClick={() => {
                    if (window.confirm(`Escalate this incident to Level ${(incident.escalationLevel || 1) + 1}?`)) {
                      escalateIncidentMutation.mutate();
                    }
                  }}
                  disabled={escalateIncidentMutation.isPending}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {escalateIncidentMutation.isPending ? (
                    <>⏳ Escalating...</>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Escalate (Level {incident.escalationLevel || 1} → {(incident.escalationLevel || 1) + 1})
                    </>
                  )}
                </button>
              )}

              {/* Send Notifications */}
              {playbook && incident.status !== 'archived' && (
                <button
                  onClick={() => sendNotificationsMutation.mutate()}
                  disabled={sendNotificationsMutation.isPending}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {sendNotificationsMutation.isPending ? (
                    <>⏳ Sending...</>
                  ) : (
                    <>📧 Send Task Notifications</>
                  )}
                </button>
              )}

              {/* Archive/Restore/Delete Buttons */}
              {incident.status === 'archived' ? (
                <>
                  <button
                    onClick={() => {
                      if (window.confirm('Restore this incident?')) {
                        restoreIncidentMutation.mutate();
                      }
                    }}
                    disabled={restoreIncidentMutation.isPending}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {restoreIncidentMutation.isPending ? (
                      <>⏳ Restoring...</>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Restore Incident
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete this incident?\n\n"${incident.title}"\n\nThis will also delete all associated tasks and un-link any alerts. This action cannot be undone.`)) {
                        deleteIncidentMutation.mutate();
                      }
                    }}
                    disabled={deleteIncidentMutation.isPending}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {deleteIncidentMutation.isPending ? (
                      <>⏳ Deleting...</>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Incident
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      const reason = window.prompt('Reason for archiving this incident:', 'Incident resolved and documented');
                      if (reason) {
                        archiveIncidentMutation.mutate(reason);
                      }
                    }}
                    disabled={archiveIncidentMutation.isPending}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {archiveIncidentMutation.isPending ? (
                      <>⏳ Archiving...</>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        Archive Incident
                      </>
                    )}
                  </button>
                  {incident.status !== 'active' && incident.status !== 'investigating' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete this incident?\n\n"${incident.title}"\n\nThis will also delete all associated tasks and un-link any alerts. This action cannot be undone.`)) {
                          deleteIncidentMutation.mutate();
                        }
                      }}
                      disabled={deleteIncidentMutation.isPending}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-medium"
                      title="Permanently delete this incident"
                    >
                      {deleteIncidentMutation.isPending ? (
                        <>⏳ Deleting...</>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete Incident
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Affected Systems */}
        {incident.affectedSystems && incident.affectedSystems.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Affected Systems:</h3>
            <div className="flex flex-wrap gap-2">
              {incident.affectedSystems.map((system: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-danger-50 text-danger-700 rounded-full text-sm">
                  {system}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks / Playbook Execution */}
          <div className="card">
            {/* Tab Navigation */}
            {(playbook?.playbookSnapshot || playbook?.phases) && (
              <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('playbook')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'playbook'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Active Playbook
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'tasks'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4" />
                    Task List ({tasks?.length || 0})
                  </div>
                </button>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'playbook' && (playbook?.playbookSnapshot || playbook?.phases) ? (
              <ActivePlaybookView 
                incidentId={id!} 
                playbook={playbook.playbookSnapshot || playbook} 
              />
            ) : activeTab === 'playbook' ? (
              <div className="text-center py-12 text-gray-500">
                <PlayCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No Playbook Associated</p>
                <p className="text-sm mt-2">This incident doesn't have a playbook assigned.</p>
              </div>
            ) : null}

            {activeTab === 'tasks' && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ListTodo className="h-6 w-6 mr-2 text-blue-600" />
                  Response Tasks
                  {playbook && (
                    <span className="ml-3 text-sm text-gray-500">
                      from "{playbook.name}"
                    </span>
                  )}
                </h2>
              </div>
            )}

            {activeTab === 'tasks' && tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task: any, idx: number) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-semibold text-gray-500">
                            Step {task.stepNumber || idx + 1}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTaskStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {task.priority === 'critical' && (
                            <span className="text-xs text-danger-600 font-semibold">
                              🔴 CRITICAL
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs mt-2">
                          <div className="flex items-center space-x-2">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">Role: {task.assignedRole?.replace('_', ' ').toUpperCase() || 'Unassigned'}</span>
                          </div>
                          {task.assignedTo && users && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">→</span>
                              <span className="text-primary-600 font-medium">
                                {users.find((u: any) => u.id === task.assignedTo)?.firstName} {users.find((u: any) => u.id === task.assignedTo)?.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <select
                          value={task.assignedTo || ''}
                          onChange={(e) => handleTaskAssignment(task.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[150px]"
                        >
                          <option value="">Assign to...</option>
                          {users?.map((user: any) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'tasks' ? (
              <div className="text-center py-8 text-gray-500">
                <ListTodo className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No tasks assigned to this incident</p>
                <p className="text-sm">Tasks are auto-generated when a playbook is selected</p>
              </div>
            ) : null}
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary-600" />
                Incident Timeline
              </h2>
              <button
                onClick={() => setShowAddTimeline(!showAddTimeline)}
                className="btn btn-secondary text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </button>
            </div>

            {showAddTimeline && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Action (e.g., System Isolated, Evidence Collected)"
                  value={newTimelineEntry.action}
                  onChange={(e) => setNewTimelineEntry({ ...newTimelineEntry, action: e.target.value })}
                  className="input mb-2"
                />
                <textarea
                  placeholder="Description"
                  value={newTimelineEntry.description}
                  onChange={(e) => setNewTimelineEntry({ ...newTimelineEntry, description: e.target.value })}
                  className="input mb-2"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button onClick={handleAddTimeline} className="btn btn-primary text-sm">
                    Add to Timeline
                  </button>
                  <button onClick={() => setShowAddTimeline(false)} className="btn btn-secondary text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {incident.timeline && incident.timeline.length > 0 ? (
              <div className="space-y-4">
                {incident.timeline.map((entry: any, idx: number) => (
                  <div key={idx} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                      {idx < incident.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">{entry.action}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(entry.timestamp), 'PPpp')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No timeline entries yet</p>
              </div>
            )}
          </div>

          {/* Post-Mortem */}
          {incident.postMortem && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-success-600" />
                Post-Mortem Analysis
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700">{incident.postMortem}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Evidence */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Evidence
            </h3>

            {incident.evidence && incident.evidence.length > 0 ? (
              <div className="space-y-3">
                {incident.evidence.map((item: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(item.timestamp), 'PPp')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No evidence collected</p>
              </div>
            )}

            <button className="btn btn-secondary w-full mt-4 flex items-center justify-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Evidence
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="font-semibold text-gray-900">
                  {tasks?.filter((t: any) => t.status === 'completed').length || 0} / {tasks?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Timeline Entries</span>
                <span className="font-semibold text-gray-900">
                  {incident.timeline?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Evidence Items</span>
                <span className="font-semibold text-gray-900">
                  {incident.evidence?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">
                  {formatDistanceToNow(new Date(incident.detectedAt))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
