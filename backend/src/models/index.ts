import User from './User';
import Playbook from './Playbook';
import Incident from './Incident';
import Task from './Task';
import Alert from './Alert';

Incident.belongsTo(Playbook, { foreignKey: 'playbookId', as: 'playbook' });
Incident.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
Incident.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

Task.belongsTo(Incident, { foreignKey: 'incidentId', as: 'incident' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'completedBy', as: 'completer' });

Alert.belongsTo(User, { foreignKey: 'acknowledgedBy', as: 'acknowledger' });
Alert.belongsTo(Incident, { foreignKey: 'incidentId', as: 'incident' });

Playbook.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Playbook.belongsTo(User, { foreignKey: 'lastModifiedBy', as: 'modifier' });

Incident.hasMany(Task, { foreignKey: 'incidentId', as: 'tasks' });
Incident.hasMany(Alert, { foreignKey: 'incidentId', as: 'alerts' });

export {
  User,
  Playbook,
  Incident,
  Task,
  Alert
};
