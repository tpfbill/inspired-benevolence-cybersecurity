import emailService from './emailService';
import Incident from '../models/Incident';
import TaskProgress from '../models/TaskProgress';
import User from '../models/User';
import logger from '../utils/logger';

interface TaskInfo {
  id: string;
  title: string;
  description: string;
  workRole: string;
  estimatedTime?: string;
  outcome?: string;
  dependsOn?: string[];
  phase: string;
}

interface NotificationRecord {
  incidentId: string;
  taskId: string;
  userId: string;
  sentAt: Date;
}

// In-memory store for sent notifications (could be moved to database later)
const sentNotifications: NotificationRecord[] = [];

class TaskNotificationService {
  /**
   * Check if a task's dependencies are satisfied
   */
  private async areDependenciesSatisfied(
    incidentId: string,
    dependsOn?: string[]
  ): Promise<boolean> {
    if (!dependsOn || dependsOn.length === 0) {
      return true; // No dependencies
    }

    // Check if all dependent tasks are completed
    const completedTasks = await TaskProgress.findAll({
      where: {
        incidentId,
        completed: true
      }
    });

    const completedTaskIds = completedTasks.map(t => t.taskId);

    // All dependencies must be in the completed list
    return dependsOn.every(depId => completedTaskIds.includes(depId));
  }

  /**
   * Check if notification was already sent for this task
   */
  private wasNotificationSent(incidentId: string, taskId: string, userId: string): boolean {
    return sentNotifications.some(
      n => n.incidentId === incidentId && 
           n.taskId === taskId && 
           n.userId === userId
    );
  }

  /**
   * Mark notification as sent
   */
  private markNotificationSent(incidentId: string, taskId: string, userId: string) {
    sentNotifications.push({
      incidentId,
      taskId,
      userId,
      sentAt: new Date()
    });
  }

  /**
   * Get all users with a specific work role
   */
  private async getUsersWithRole(workRole: string): Promise<User[]> {
    // For now, we'll use a mapping of work roles to user roles in the system
    // In a real system, you might have a separate work_role field
    const roleMapping: Record<string, string[]> = {
      'security_analyst': ['admin', 'security_analyst'],
      'it_director': ['admin', 'it_director'],
      'legal': ['admin', 'legal'],
      'hr': ['admin', 'hr'],
      'executive': ['admin', 'executive'],
      'admin': ['admin'],
      'communications': ['admin', 'communications']
    };

    const systemRoles = roleMapping[workRole] || ['admin'];

    const users = await User.findAll({
      where: {
        role: systemRoles,
        isActive: true
      }
    });

    return users;
  }

  /**
   * Send notification for a single task
   */
  private async notifyTask(
    incident: any,
    task: TaskInfo,
    subtask?: TaskInfo
  ): Promise<number> {
    const targetTask = subtask || task;
    const incidentUrl = `${process.env.APP_URL}/incidents/${incident.id}`;

    // Get users with the required work role
    const users = await this.getUsersWithRole(targetTask.workRole);

    if (users.length === 0) {
      logger.warn(`⚠️  No users found with role: ${targetTask.workRole}`);
      return 0;
    }

    let sentCount = 0;

    for (const user of users) {
      // Skip if already notified
      if (this.wasNotificationSent(incident.id, targetTask.id, user.id)) {
        logger.info(`📧 Skipping ${user.email} - already notified for task ${targetTask.title}`);
        continue;
      }

      const success = await emailService.sendTaskNotification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        {
          incidentId: incident.id,
          incidentTitle: incident.title,
          taskTitle: targetTask.title,
          taskDescription: targetTask.description,
          phase: task.phase,
          estimatedTime: targetTask.estimatedTime,
          outcome: targetTask.outcome,
          incidentUrl
        }
      );

      if (success) {
        this.markNotificationSent(incident.id, targetTask.id, user.id);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Notify all tasks that are ready (no dependencies or dependencies satisfied)
   */
  async notifyReadyTasks(incidentId: string): Promise<{
    total: number;
    notified: number;
    skipped: number;
  }> {
    const incident = await Incident.findByPk(incidentId);

    if (!incident || !incident.playbookSnapshot) {
      throw new Error('Incident not found or has no playbook');
    }

    const playbook = incident.playbookSnapshot;
    let totalTasks = 0;
    let notifiedCount = 0;
    let skippedCount = 0;

    // Iterate through all phases and tasks
    for (const phase of playbook.phases || []) {
      for (const task of phase.tasks || []) {
        totalTasks++;

        // Check if task dependencies are satisfied
        const dependenciesSatisfied = await this.areDependenciesSatisfied(
          incidentId,
          task.dependsOn
        );

        if (!dependenciesSatisfied) {
          logger.info(`⏸️  Skipping task "${task.title}" - dependencies not satisfied`);
          skippedCount++;
          continue;
        }

        // Notify the main task
        const taskSent = await this.notifyTask(incident, {
          ...task,
          phase: phase.phase
        });
        notifiedCount += taskSent;

        // Check subtasks
        for (const subtask of task.subtasks || []) {
          totalTasks++;

          const subtaskDependenciesSatisfied = await this.areDependenciesSatisfied(
            incidentId,
            subtask.dependsOn
          );

          if (!subtaskDependenciesSatisfied) {
            logger.info(`⏸️  Skipping subtask "${subtask.title}" - dependencies not satisfied`);
            skippedCount++;
            continue;
          }

          const subtaskSent = await this.notifyTask(
            incident,
            { ...task, phase: phase.phase },
            subtask
          );
          notifiedCount += subtaskSent;
        }
      }
    }

    logger.info(`📧 Notification summary: ${notifiedCount} emails sent, ${skippedCount} tasks skipped (awaiting dependencies)`);

    return {
      total: totalTasks,
      notified: notifiedCount,
      skipped: skippedCount
    };
  }

  /**
   * Check for tasks that became ready after a task was completed
   */
  async notifyDependentTasks(incidentId: string, completedTaskId: string): Promise<number> {
    const incident = await Incident.findByPk(incidentId);

    if (!incident || !incident.playbookSnapshot) {
      return 0;
    }

    const playbook = incident.playbookSnapshot;
    let notifiedCount = 0;

    // Find tasks that depend on the completed task
    for (const phase of playbook.phases || []) {
      for (const task of phase.tasks || []) {
        // Check if this task depends on the completed task
        if (task.dependsOn && task.dependsOn.includes(completedTaskId)) {
          // Check if ALL dependencies are now satisfied
          const allSatisfied = await this.areDependenciesSatisfied(
            incidentId,
            task.dependsOn
          );

          if (allSatisfied) {
            logger.info(`✅ Task "${task.title}" is now ready - all dependencies satisfied`);
            const sent = await this.notifyTask(incident, {
              ...task,
              phase: phase.phase
            });
            notifiedCount += sent;
          }
        }

        // Check subtasks
        for (const subtask of task.subtasks || []) {
          if (subtask.dependsOn && subtask.dependsOn.includes(completedTaskId)) {
            const allSatisfied = await this.areDependenciesSatisfied(
              incidentId,
              subtask.dependsOn
            );

            if (allSatisfied) {
              logger.info(`✅ Subtask "${subtask.title}" is now ready`);
              const sent = await this.notifyTask(
                incident,
                { ...task, phase: phase.phase },
                subtask
              );
              notifiedCount += sent;
            }
          }
        }
      }
    }

    return notifiedCount;
  }

  /**
   * Clear notification history for an incident (useful for testing)
   */
  clearNotificationHistory(incidentId: string) {
    const initialLength = sentNotifications.length;
    const filtered = sentNotifications.filter(n => n.incidentId !== incidentId);
    sentNotifications.length = 0;
    sentNotifications.push(...filtered);
    logger.info(`🧹 Cleared ${initialLength - filtered.length} notification records for incident ${incidentId}`);
  }
}

export default new TaskNotificationService();
