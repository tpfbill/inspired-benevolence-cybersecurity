import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

interface TaskProgressAttributes {
  id: string;
  incidentId: string;
  phase: string;
  taskId: string;
  subtaskId?: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskProgressCreationAttributes extends Optional<TaskProgressAttributes, 'id' | 'completed' | 'createdAt' | 'updatedAt'> {}

class TaskProgress extends Model<TaskProgressAttributes, TaskProgressCreationAttributes> implements TaskProgressAttributes {
  public id!: string;
  public incidentId!: string;
  public phase!: string;
  public taskId!: string;
  public subtaskId?: string;
  public completed!: boolean;
  public completedBy?: string;
  public completedAt?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TaskProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    incidentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'incidents',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    phase: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    taskId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    subtaskId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'incident_task_progress',
    timestamps: true
  }
);

export default TaskProgress;
