import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Users, Clock, Target, FileText } from 'lucide-react';
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
  'identification': 'bg-blue-500',
  'containment': 'bg-yellow-500',
  'eradication': 'bg-orange-500',
  'recovery': 'bg-green-500',
  'lessons_learned': 'bg-purple-500'
};

interface ActivePlaybookViewProps {
  incidentId: string;
  playbook: any;
}

export default function ActivePlaybookView({ incidentId, playbook }: ActivePlaybookViewProps) {
  const queryClient = useQueryClient();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const { data: progress = [] } = useQuery({
    queryKey: ['task-progress', incidentId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/task-progress/incident/${incidentId}`);
      return response.data;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: summary } = useQuery({
    queryKey: ['progress-summary', incidentId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/task-progress/incident/${incidentId}/summary`);
      return response.data;
    },
    refetchInterval: 5000
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (data: { phase: string; taskId: string; subtaskId?: string; completed: boolean }) => {
      return apiClient.post('/api/task-progress', {
        incidentId,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-progress', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['progress-summary', incidentId] });
    }
  });

  const togglePhase = (phase: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const isTaskCompleted = (taskId: string, subtaskId?: string) => {
    return progress.some((p: any) => 
      p.taskId === taskId && 
      (subtaskId ? p.subtaskId === subtaskId : !p.subtaskId) && 
      p.completed
    );
  };

  const handleToggleTask = (phase: string, taskId: string, subtaskId?: string) => {
    const currentlyCompleted = isTaskCompleted(taskId, subtaskId);
    toggleTaskMutation.mutate({
      phase,
      taskId,
      subtaskId,
      completed: !currentlyCompleted
    });
  };

  if (!playbook || !playbook.phases || playbook.phases.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No playbook phases available for this incident.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {summary && (
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Playbook Progress</h3>
              <p className="text-sm text-gray-600 mt-1">
                {summary.completed} of {summary.total} tasks completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{summary.percentComplete}%</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${summary.percentComplete}%` }}
            />
          </div>
        </div>
      )}

      {/* Playbook Info */}
      <div className="card bg-gray-50">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{playbook.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{playbook.description}</p>
            {playbook.version && (
              <span className="text-xs text-gray-500 mt-2 inline-block">Version {playbook.version}</span>
            )}
          </div>
        </div>
      </div>

      {/* Phases */}
      {playbook.phases.map((phase: any, phaseIndex: number) => {
        const phaseProgress = summary?.byPhase?.[phase.phase] || { total: 0, completed: 0 };
        const phasePercent = phaseProgress.total > 0 
          ? Math.round((phaseProgress.completed / phaseProgress.total) * 100)
          : 0;

        return (
          <div key={phase.phase} className={`card border-l-4 ${PHASE_COLORS[phase.phase] || 'border-gray-400'}`}>
            {/* Phase Header */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => togglePhase(phase.phase)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full ${PHASE_COLORS[phase.phase] || 'bg-gray-400'} flex items-center justify-center text-white font-bold`}>
                  {phaseIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {PHASE_LABELS[phase.phase] || phase.phase}
                  </h3>
                  {phase.description && (
                    <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {phaseProgress.completed}/{phaseProgress.total} tasks
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div 
                        className={`${PHASE_COLORS[phase.phase] || 'bg-gray-400'} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{phasePercent}%</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                {expandedPhases.has(phase.phase) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Phase Tasks */}
            {expandedPhases.has(phase.phase) && phase.tasks && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                {phase.tasks.map((task: any, taskIndex: number) => {
                  const taskCompleted = isTaskCompleted(task.id);
                  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

                  return (
                    <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      {/* Task Header */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(phase.phase, task.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {taskCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                              Task {taskIndex + 1}
                            </span>
                            <h4 className={`font-semibold ${taskCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </h4>
                          </div>

                          <p className={`text-sm mb-3 ${taskCompleted ? 'text-gray-400' : 'text-gray-700'}`}>
                            {task.description}
                          </p>

                          {/* Task Metadata */}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3">
                            {task.workRole && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{WORK_ROLE_LABELS[task.workRole] || task.workRole}</span>
                              </div>
                            )}
                            {task.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{task.estimatedTime}</span>
                              </div>
                            )}
                            {task.outcome && (
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span className="text-blue-600">{task.outcome}</span>
                              </div>
                            )}
                          </div>

                          {/* Subtasks */}
                          {hasSubtasks && (
                            <>
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                {expandedTasks.has(task.id) ? (
                                  <>
                                    <ChevronDown className="w-3 h-3" />
                                    Hide {task.subtasks.length} subtasks
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="w-3 h-3" />
                                    Show {task.subtasks.length} subtasks
                                  </>
                                )}
                              </button>

                              {expandedTasks.has(task.id) && (
                                <div className="mt-3 ml-6 space-y-2 border-l-2 border-blue-300 pl-3">
                                  {task.subtasks.map((subtask: any, subtaskIndex: number) => {
                                    const subtaskCompleted = isTaskCompleted(task.id, subtask.id);

                                    return (
                                      <div key={subtask.id} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                                        <button
                                          onClick={() => handleToggleTask(phase.phase, task.id, subtask.id)}
                                          className="flex-shrink-0"
                                        >
                                          {subtaskCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                          ) : (
                                            <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                                          )}
                                        </button>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-400 text-white text-xs px-1.5 py-0.5 rounded">
                                              {taskIndex + 1}.{subtaskIndex + 1}
                                            </span>
                                            <span className={`text-sm font-medium ${subtaskCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                              {subtask.title}
                                            </span>
                                          </div>
                                          <p className={`text-xs ${subtaskCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {subtask.description}
                                          </p>
                                          {subtask.outcome && (
                                            <p className="text-xs text-blue-600 mt-1">→ {subtask.outcome}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
