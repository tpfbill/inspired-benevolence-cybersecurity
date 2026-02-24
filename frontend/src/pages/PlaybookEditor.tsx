import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';

export default function PlaybookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('ransomware');
  const [steps, setSteps] = useState<any[]>([]);

  useQuery({
    queryKey: ['playbook', id],
    enabled: isEditMode,
    queryFn: async () => {
      const response = await apiClient.get(`/api/playbooks/${id}`);
      setName(response.data.name);
      setDescription(response.data.description);
      setIncidentType(response.data.incidentType);
      setSteps(response.data.steps);
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return apiClient.put(`/api/playbooks/${id}`, data);
      }
      return apiClient.post('/api/playbooks', data);
    },
    onSuccess: () => {
      navigate('/playbooks');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ name, description, incidentType, steps });
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        title: '',
        description: '',
        assignedRole: 'SECURITY_ANALYST',
        criticalStep: false,
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {isEditMode ? 'Edit Playbook' : 'Create New Playbook'}
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Playbook Name
          </label>
          <input
            type="text"
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incident Type
          </label>
          <select
            className="input"
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
          >
            <option value="ransomware">Ransomware</option>
            <option value="phishing">Phishing</option>
            <option value="ddos">DDoS</option>
            <option value="data_breach">Data Breach</option>
            <option value="insider_threat">Insider Threat</option>
            <option value="malware">Malware</option>
            <option value="unauthorized_access">Unauthorized Access</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            required
            rows={4}
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
            <button type="button" onClick={addStep} className="btn btn-secondary">
              Add Step
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step {index + 1} Title
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].title = e.target.value;
                        setSteps(newSteps);
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="input"
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].description = e.target.value;
                        setSteps(newSteps);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Role
                    </label>
                    <select
                      className="input"
                      value={step.assignedRole}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].assignedRole = e.target.value;
                        setSteps(newSteps);
                      }}
                    >
                      <option value="SECURITY_ANALYST">Security Analyst</option>
                      <option value="IT_DIRECTOR">IT Director</option>
                      <option value="LEGAL">Legal</option>
                      <option value="HR">HR</option>
                      <option value="EXECUTIVE">Executive</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={step.criticalStep}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].criticalStep = e.target.checked;
                        setSteps(newSteps);
                      }}
                      className="h-4 w-4 text-primary-600"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Critical Step
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/playbooks')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Playbook' : 'Create Playbook'}
          </button>
        </div>
      </form>
    </div>
  );
}
