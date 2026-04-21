import { useQuery } from '@tantml:query';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Clock, Target, ChevronRight, Edit } from 'lucide-react';
import apiClient from '../api/client';

const PHASE_LABELS: Record<string, string> = {
  'identification': 'Identification',
  'containment': 'Containment',
  'eradication': 'Eradication',
  'recovery': 'Recovery',
  'lessons_learned': 'Lessons Learned'
};

const WORK_ROLE_LABELS: Record<string, string> = {
  'security_analyst': 'Security Analyst',
  'it_director': 'IT Director',
  'legal': 'Legal',
  'hr': 'Human Resources',
  'executive': 'Executive',
  'admin': 'Administrator',
  'communications': 'Communications'
};

const PHASE_COLORS: Record<string, string> = {
  'identification': 'bg-blue-100 text-blue-800 border-blue-300',
  'containment': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'eradication': 'bg-orange-100 text-orange-800 border-orange-300',
  'recovery': 'bg-green-100 text-green-800 border-green-300',
  'lessons_learned': 'bg-purple-100 text-purple-800 border-purple-300'
};

export default function PlaybookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: playbook, isLoading } = useQuery({
    queryKey: ['playbook', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/playbooks/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading playbook...</div>;
  }

  if (!playbook) {
    return <div className="text-center py-12">Playbook not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <BookOpen className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{playbook.name}</h1>
            <p className="text-gray-600 mt-2">{playbook.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="badge badge-medium">
                {playbook.incidentType?.replace('_', ' ').toUpperCase()}
              </span>
              <span className="badge badge-low">
                {playbook.status?.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Version {playbook.version}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/playbooks/${id}`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Playbook
        </button>
      </div>

      {/* Phases */}
      {playbook.phases && playbook.phases.length > 0 ? (
        <div className="space-y-6">
          {playbook.phases.map((phase: any, phaseIndex: number) => (
            <div key={phase.phase} className={`card border-l-4 ${PHASE_COLORS[phase.phase] || 'border-gray-300'}`}>
              {/* Phase Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${PHASE_COLORS[phase.phase] || 'bg-gray-100 text-gray-800'}`}>
                    Phase {phaseIndex + 1}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {PHASE_LABELS[phase.phase] || phase.phase}
                  </h2>
                </div>
                {phase.description && (
                  <p className="text-gray-600 ml-20">{phase.description}</p>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-4 ml-4">
                {phase.tasks && phase.tasks.map((task: any, taskIndex: number) => (
                  <div key={task.id} className="bg-gray-50 rounded-lg p-5 border-l-4 border-blue-400">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded font-medium">
                            Task {taskIndex + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        </div>
                        <p className="text-gray-700 mb-3">{task.description}</p>
                      </div>
                    </div>

                    {/* Task Metadata */}
                    <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-500">Preferred Role</div>
                          <div className="text-sm font-medium text-gray-900">
                            {WORK_ROLE_LABELS[task.workRole] || task.workRole}
                          </div>
                        </div>
                      </div>
                      {task.estimatedTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-500">Estimated Time</div>
                            <div className="text-sm font-medium text-gray-900">{task.estimatedTime}</div>
                          </div>
                        </div>
                      )}
                      {task.outcome && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-500">Expected Outcome</div>
                            <div className="text-sm font-medium text-gray-900">{task.outcome}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="ml-6 space-y-3 border-l-2 border-blue-300 pl-4 mt-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Subtasks:</div>
                        {task.subtasks.map((subtask: any, subtaskIndex: number) => (
                          <div key={subtask.id} className="bg-white rounded p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ChevronRight className="w-4 h-4 text-blue-400" />
                              <span className="bg-blue-400 text-white text-xs px-2 py-0.5 rounded">
                                {taskIndex + 1}.{subtaskIndex + 1}
                              </span>
                              <span className="font-medium text-gray-900">{subtask.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6 mb-2">{subtask.description}</p>
                            
                            <div className="grid grid-cols-3 gap-3 ml-6 mt-2">
                              <div className="text-xs">
                                <span className="text-gray-500">Role: </span>
                                <span className="font-medium text-gray-900">
                                  {WORK_ROLE_LABELS[subtask.workRole] || subtask.workRole}
                                </span>
                              </div>
                              {subtask.estimatedTime && (
                                <div className="text-xs">
                                  <span className="text-gray-500">Time: </span>
                                  <span className="font-medium text-gray-900">{subtask.estimatedTime}</span>
                                </div>
                              )}
                              {subtask.outcome && (
                                <div className="text-xs col-span-3">
                                  <span className="text-gray-500">Outcome: </span>
                                  <span className="font-medium text-gray-900">{subtask.outcome}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {phase.tasks && phase.tasks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No tasks defined for this phase yet.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          <p>This playbook uses the legacy format. Edit it to convert to the new phase-based structure.</p>
        </div>
      )}
    </div>
  );
}
