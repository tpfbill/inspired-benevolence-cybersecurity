import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

interface TaskAttributes {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  assignedTo?: string;
  assignedRole?: string;
  status: TaskStatus;
  priority: TaskPriority;
  stepNumber?: number;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: string;
  public incidentId!: string;
  public title!: string;
  public description!: string;
  public assignedTo?: string;
  public assignedRole?: string;
  public status!: TaskStatus;
  public priority!: TaskPriority;
  public stepNumber?: number;
  public dueDate?: Date;
  public completedAt?: Date;
  public completedBy?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    incidentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true
    },
    assignedRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      defaultValue: TaskStatus.PENDING
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(TaskPriority)),
      allowNull: false
    },
    stepNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true
  }
);

export default Task;
