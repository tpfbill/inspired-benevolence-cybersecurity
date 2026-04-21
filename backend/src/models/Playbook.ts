import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

export enum IncidentType {
  RANSOMWARE = 'ransomware',
  PHISHING = 'phishing',
  DDOS = 'ddos',
  DATA_BREACH = 'data_breach',
  INSIDER_THREAT = 'insider_threat',
  MALWARE = 'malware',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  CUSTOM = 'custom'
}

export enum PlaybookStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

// Incident Response Phases
export enum IncidentPhase {
  IDENTIFICATION = 'identification',
  CONTAINMENT = 'containment',
  ERADICATION = 'eradication',
  RECOVERY = 'recovery',
  LESSONS_LEARNED = 'lessons_learned'
}

// Work Roles
export enum WorkRole {
  SECURITY_ANALYST = 'security_analyst',
  IT_DIRECTOR = 'it_director',
  LEGAL = 'legal',
  HR = 'hr',
  EXECUTIVE = 'executive',
  ADMIN = 'admin',
  COMMUNICATIONS = 'communications',
  CIRT_LEADER = 'cirt_leader',
  CORE_CIRT_MEMBER = 'core_cirt_member',
  THIRD_PARTY_IT = 'third_party_it',
  COMMUNICATIONS_LEADER = 'communications_leader',
  CFO = 'cfo',
  MANAGER_IT_SECURITY = 'manager_it_security'
}

// Task Types
export enum TaskType {
  ADMINISTRATIVE = 'administrative',
  TECHNICAL = 'technical',
  HYBRID = 'hybrid'
}

// Complexity Levels
export enum TaskComplexity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high'
}

// Subtask Types
export enum SubtaskType {
  ADMINISTRATIVE = 'administrative',
  TECHNICAL = 'technical'
}

interface PlaybookSubtask {
  id: string;
  subtaskType: SubtaskType;
  content: string; // The actual subtask instructions/content
  dependsOn?: string[]; // Array of subtask IDs that must be completed first
}

interface PlaybookTask {
  id: string;
  title: string;
  content: string; // Main task content/description
  description?: string; // Additional context
  workRole: WorkRole;
  estimatedTime?: string;
  taskType: TaskType;
  complexity: TaskComplexity;
  outcomes: string[]; // Array of expected outcomes
  subtasks: PlaybookSubtask[];
  dependsOn?: string[]; // Array of task IDs that must be completed first
  criticalTask?: boolean; // Whether this is a critical task
}

interface PlaybookPhase {
  phase: IncidentPhase;
  description: string;
  tasks: PlaybookTask[];
}

// Legacy step structure for backward compatibility
interface PlaybookStep {
  stepNumber: number;
  title: string;
  description: string;
  assignedRole: string;
  estimatedTime?: string;
  dependencies?: number[];
  criticalStep: boolean;
}

interface PlaybookAttributes {
  id: string;
  name: string;
  incidentType: IncidentType;
  description: string;
  phases: PlaybookPhase[];
  steps: PlaybookStep[]; // Legacy field for backward compatibility
  status: PlaybookStatus;
  version: string;
  createdBy: string;
  lastModifiedBy?: string;
  framework?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlaybookCreationAttributes extends Optional<PlaybookAttributes, 'id' | 'status' | 'version' | 'createdAt' | 'updatedAt'> {}

class Playbook extends Model<PlaybookAttributes, PlaybookCreationAttributes> implements PlaybookAttributes {
  public id!: string;
  public name!: string;
  public incidentType!: IncidentType;
  public description!: string;
  public phases!: PlaybookPhase[];
  public steps!: PlaybookStep[]; // Legacy field
  public status!: PlaybookStatus;
  public version!: string;
  public createdBy!: string;
  public lastModifiedBy?: string;
  public framework?: string;
  public tags?: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Playbook.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    incidentType: {
      type: DataTypes.ENUM(...Object.values(IncidentType)),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phases: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    steps: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PlaybookStatus)),
      defaultValue: PlaybookStatus.DRAFT
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0.0'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    },
    lastModifiedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    framework: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  },
  {
    sequelize,
    tableName: 'playbooks',
    timestamps: true
  }
);

export default Playbook;
