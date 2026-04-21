import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import apiClient from '../api/client';

enum IncidentPhase {
  IDENTIFICATION = 'identification',
  CONTAINMENT = 'containment',
  ERADICATION = 'eradication',
  RECOVERY = 'recovery',
  LESSONS_LEARNED = 'lessons_learned'
}

enum WorkRole {
  SECURITY_ANALYST = 'security_analyst',
  IT_DIRECTOR = 'it_director',
  LEGAL = 'legal',
  HR = 'hr',
  EXECUTIVE = 'executive',
  ADMIN = 'admin',
  COMMUNICATIONS = 'communications'
}

interface Subtask {
  id: string;
  title: string;
  description: string;
  workRole: WorkRole;
  estimatedTime?: string;
  outcome?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  workRole: WorkRole;
  estimatedTime?: string;
  subtasks: Subtask[];
  outcome?: string;
}

interface Phase {
  phase: IncidentPhase;
  description: string;
  tasks: Task[];
}

const PHASE_LABELS = {
  [IncidentPhase.IDENTIFICATION]: 'Identification',
  [IncidentPhase.CONTAINMENT]: 'Containment',
  [IncidentPhase.ERADICATION]: 'Eradication',
  [IncidentPhase.RECOVERY]: 'Recovery',
  [IncidentPhase.LESSONS_LEARNED]: 'Lessons Learned'
};

const WORK_ROLE_LABELS = {
  [WorkRole.SECURITY_ANALYST]: 'Security Analyst',
  [WorkRole.IT_DIRECTOR]: 'IT Director',
  [WorkRole.LEGAL]: 'Legal',
  [WorkRole.HR]: 'Human Resources',
  [WorkRole.EXECUTIVE]: 'Executive',
  [WorkRole.ADMIN]: 'Administrator',
  [WorkRole.COMMUNICATIONS]: 'Communications'
};

export default function PlaybookEditorNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('ransomware');
  const [phases, setPhases] = useState<Phase[]>([
    { phase: IncidentPhase.IDENTIFICATION, description: '', tasks: [] },
    { phase: IncidentPhase.CONTAINMENT, description: '', tasks: [] },
    { phase: IncidentPhase.ERADICATION, description: '', tasks: [] },
    { phase: IncidentPhase.RECOVERY, description: '', tasks: [] },
    { phase: IncidentPhase.LESSONS_LEARNED, description: '', tasks: [] }
  ]);
  const [expandedPhases, setExpandedPhases] = useState<Set<IncidentPhase>>(new Set());

  useQuery({
    queryKey: ['playbook', id],
    enabled: isEditMode,
    queryFn: async () => {
      const response = await apiClient.get(`/api/playbooks/${id}`);
      setName(response.data.name);
      setDescription(response.data.description);
      setIncidentType(response.data.incidentType);
      if (response.data.phases && response.data.phases.length > 0) {
        setPhases(response.data.phases);
      }
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
    saveMutation.mutate({ 
      name, 
      description, 
      incidentType, 
      phases,
      steps: [] // Legacy field
    });
  };

  const togglePhase = (phase: IncidentPhase) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  const updatePhaseDescription = (phaseIndex: number, description: string) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].description = description;
    setPhases(newPhases);
  };

  const addTask = (phaseIndex: number) => {
    const newPhases = [...phases];
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      workRole: WorkRole.SECURITY_ANALYST,
      subtasks: [],
      outcome: ''
    };
    newPhases[phaseIndex].tasks.push(newTask);
    setPhases(newPhases);
  };

  const updateTask = (phaseIndex: number, taskIndex: number, field: keyof Task, value: any) => {
    const newPhases = [...phases];
    (newPhases[phaseIndex].tasks[taskIndex] as any)[field] = value;
    setPhases(newPhases);
  };

  const deleteTask = (phaseIndex: number, taskIndex: number) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].tasks.splice(taskIndex, 1);
    setPhases(newPhases);
  };

  const addSubtask = (phaseIndex: number, taskIndex: number) => {
    const newPhases = [...phases];
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: '',
      description: '',
      workRole: WorkRole.SECURITY_ANALYST,
      outcome: ''
    };
    newPhases[phaseIndex].tasks[taskIndex].subtasks.push(newSubtask);
    setPhases(newPhases);
  };

  const updateSubtask = (phaseIndex: number, taskIndex: number, subtaskIndex: number, field: keyof Subtask, value: any) => {
    const newPhases = [...phases];
    (newPhases[phaseIndex].tasks[taskIndex].subtasks[subtaskIndex] as any)[field] = value;
    setPhases(newPhases);
  };

  const deleteSubtask = (phaseIndex: number, taskIndex: number, subtaskIndex: number) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
    setPhases(newPhases);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Playbook' : 'Create New Playbook'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/playbooks')}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playbook Name *
            </label>
            <input
              type="text"
              required
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ransomware Response Playbook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              className="input w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of this playbook..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Type *
            </label>
            <select
              className="input w-full"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
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
        </div>

        {/* Phases */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Incident Response Phases</h2>
          
          {phases.map((phase, phaseIndex) => (
            <div key={phase.phase} className="card border-l-4 border-blue-500">
              {/* Phase Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Phase {phaseIndex + 1}
                    </span>
                    {PHASE_LABELS[phase.phase]}
                  </h3>
                  <input
                    type="text"
                    className="input w-full mt-2"
                    value={phase.description}
                    onChange={(e) => updatePhaseDescription(phaseIndex, e.target.value)}
                    placeholder={`Description for ${PHASE_LABELS[phase.phase]} phase...`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => togglePhase(phase.phase)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded"
                >
                  {expandedPhases.has(phase.phase) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Phase Content */}
              {expandedPhases.has(phase.phase) && (
                <div className="space-y-4 mt-4 pl-4 border-l-2 border-gray-200">
                  {/* Tasks */}
                  {phase.tasks.map((task, taskIndex) => (
                    <div key={task.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                              Task {taskIndex + 1}
                            </span>
                            <Trash2
                              className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => deleteTask(phaseIndex, taskIndex)}
                            />
                          </div>

                          <input
                            type="text"
                            className="input w-full font-medium"
                            value={task.title}
                            onChange={(e) => updateTask(phaseIndex, taskIndex, 'title', e.target.value)}
                            placeholder="Task title..."
                          />

                          <textarea
                            rows={2}
                            className="input w-full text-sm"
                            value={task.description}
                            onChange={(e) => updateTask(phaseIndex, taskIndex, 'description', e.target.value)}
                            placeholder="Task description..."
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Preferred Work Role
                              </label>
                              <select
                                className="input w-full text-sm"
                                value={task.workRole}
                                onChange={(e) => updateTask(phaseIndex, taskIndex, 'workRole', e.target.value)}
                              >
                                {Object.entries(WORK_ROLE_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Estimated Time
                              </label>
                              <input
                                type="text"
                                className="input w-full text-sm"
                                value={task.estimatedTime || ''}
                                onChange={(e) => updateTask(phaseIndex, taskIndex, 'estimatedTime', e.target.value)}
                                placeholder="e.g., 30 minutes"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Expected Outcome
                            </label>
                            <textarea
                              rows={2}
                              className="input w-full text-sm"
                              value={task.outcome || ''}
                              onChange={(e) => updateTask(phaseIndex, taskIndex, 'outcome', e.target.value)}
                              placeholder="What should be accomplished..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              📎 Task Dependencies (optional)
                            </label>
                            <select
                              multiple
                              className="input w-full text-sm h-20"
                              value={task.dependsOn || []}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                updateTask(phaseIndex, taskIndex, 'dependsOn', selected);
                              }}
                            >
                              {phases.flatMap((p, pIdx) => 
                                p.tasks.filter((t, tIdx) => !(pIdx === phaseIndex && tIdx === taskIndex))
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {PHASE_LABELS[p.phase]} - {t.title || `Task ${phases[pIdx].tasks.indexOf(t) + 1}`}
                                    </option>
                                  ))
                              )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Hold Ctrl/Cmd to select multiple. Users will only be notified when all dependencies are complete.
                            </p>
                          </div>

                          {/* Subtasks */}
                          {task.subtasks.length > 0 && (
                            <div className="ml-4 space-y-2 border-l-2 border-blue-300 pl-3">
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <div key={subtask.id} className="bg-white p-3 rounded space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-blue-400 text-white text-xs px-2 py-0.5 rounded">
                                      Subtask {subtaskIndex + 1}
                                    </span>
                                    <Trash2
                                      className="w-3 h-3 text-red-500 cursor-pointer hover:text-red-700"
                                      onClick={() => deleteSubtask(phaseIndex, taskIndex, subtaskIndex)}
                                    />
                                  </div>

                                  <input
                                    type="text"
                                    className="input w-full text-sm"
                                    value={subtask.title}
                                    onChange={(e) => updateSubtask(phaseIndex, taskIndex, subtaskIndex, 'title', e.target.value)}
                                    placeholder="Subtask title..."
                                  />

                                  <textarea
                                    rows={1}
                                    className="input w-full text-xs"
                                    value={subtask.description}
                                    onChange={(e) => updateSubtask(phaseIndex, taskIndex, subtaskIndex, 'description', e.target.value)}
                                    placeholder="Subtask description..."
                                  />

                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      className="input w-full text-xs"
                                      value={subtask.workRole}
                                      onChange={(e) => updateSubtask(phaseIndex, taskIndex, subtaskIndex, 'workRole', e.target.value)}
                                    >
                                      {Object.entries(WORK_ROLE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                      ))}
                                    </select>

                                    <input
                                      type="text"
                                      className="input w-full text-xs"
                                      value={subtask.estimatedTime || ''}
                                      onChange={(e) => updateSubtask(phaseIndex, taskIndex, subtaskIndex, 'estimatedTime', e.target.value)}
                                      placeholder="Time estimate"
                                    />
                                  </div>

                                  <textarea
                                    rows={1}
                                    className="input w-full text-xs"
                                    value={subtask.outcome || ''}
                                    onChange={(e) => updateSubtask(phaseIndex, taskIndex, subtaskIndex, 'outcome', e.target.value)}
                                    placeholder="Expected outcome..."
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => addSubtask(phaseIndex, taskIndex)}
                            className="btn-secondary btn-sm text-xs"
                          >
                            <Plus className="w-3 h-3" />
                            Add Subtask
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addTask(phaseIndex)}
                    className="btn-secondary btn-sm w-full"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task to {PHASE_LABELS[phase.phase]}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t shadow-lg">
          <button
            type="button"
            onClick={() => navigate('/playbooks')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? 'Saving...' : isEditMode ? 'Update Playbook' : 'Create Playbook'}
          </button>
        </div>
      </form>
    </div>
  );
}
