import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, AlertTriangle, Shield, BookOpen } from 'lucide-react';
import apiClient from '../api/client';

interface IncidentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncidentForm({ onClose, onSuccess }: IncidentFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentType: 'ransomware',
    severity: 'high',
    playbookId: '',
    affectedSystems: ''
  });

  const { data: playbooks } = useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const response = await apiClient.get('/api/playbooks');
      return response.data;
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/api/incidents', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      alert('✅ Incident created successfully!');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      alert(`❌ Failed to create incident: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse affected systems from comma-separated string
    const affectedSystemsArray = formData.affectedSystems
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    createIncidentMutation.mutate({
      title: formData.title,
      description: formData.description,
      incidentType: formData.incidentType,
      severity: formData.severity,
      playbookId: formData.playbookId || undefined,
      affectedSystems: affectedSystemsArray
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-select matching playbook when incident type changes
    if (field === 'incidentType' && playbooks) {
      const matchingPlaybook = playbooks.find((p: any) => 
        p.incidentType === value && p.status === 'active'
      );
      if (matchingPlaybook) {
        setFormData(prev => ({ ...prev, playbookId: matchingPlaybook.id }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Create New Incident</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Title *
            </label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Ransomware Attack - Finance Department"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              className="input w-full"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the incident..."
            />
          </div>

          {/* Incident Type and Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Type *
              </label>
              <select
                className="input w-full"
                value={formData.incidentType}
                onChange={(e) => handleChange('incidentType', e.target.value)}
              >
                <option value="ransomware">Ransomware</option>
                <option value="phishing">Phishing</option>
                <option value="ddos">DDoS Attack</option>
                <option value="data_breach">Data Breach</option>
                <option value="insider_threat">Insider Threat</option>
                <option value="malware">Malware</option>
                <option value="unauthorized_access">Unauthorized Access</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <select
                className="input w-full"
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Playbook Selection */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Response Playbook (Optional)
            </label>
            <select
              className="input w-full"
              value={formData.playbookId}
              onChange={(e) => handleChange('playbookId', e.target.value)}
            >
              <option value="">No playbook (manual response)</option>
              {playbooks?.filter((p: any) => p.status === 'active').map((playbook: any) => (
                <option key={playbook.id} value={playbook.id}>
                  {playbook.name} - {playbook.incidentType.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            {formData.playbookId && (
              <p className="text-xs text-blue-700 mt-2">
                ✓ Tasks will be automatically generated and notifications sent to assigned roles
              </p>
            )}
          </div>

          {/* Affected Systems */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affected Systems (Optional)
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.affectedSystems}
              onChange={(e) => handleChange('affectedSystems', e.target.value)}
              placeholder="e.g., WKS-001, WKS-002, SRV-FIN-01 (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter system names or IPs separated by commas
            </p>
          </div>

          {/* Warning for no playbook */}
          {!formData.playbookId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900">No playbook selected</p>
                <p className="text-yellow-700 mt-1">
                  Without a playbook, you'll need to manually manage incident response tasks. 
                  Consider selecting a playbook for guided response with automatic notifications.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createIncidentMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {createIncidentMutation.isPending ? (
                <>⏳ Creating...</>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Create Incident
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
