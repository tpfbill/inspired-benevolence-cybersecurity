import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';
import { IncidentType } from './Playbook';

export enum IncidentSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  ERADICATING = 'eradicating',
  RECOVERING = 'recovering',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

interface IncidentAttributes {
  id: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  playbookId?: string;
  playbookSnapshot?: any;
  detectedAt: Date;
  reportedBy: string;
  assignedTo?: string;
  affectedSystems?: string[];
  evidence?: any[];
  timeline?: any[];
  resolvedAt?: Date;
  postMortem?: string;
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
  escalationLevel?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Incident extends Model<IncidentAttributes, IncidentCreationAttributes> implements IncidentAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public incidentType!: IncidentType;
  public severity!: IncidentSeverity;
  public status!: IncidentStatus;
  public playbookId?: string;
  public playbookSnapshot?: any;
  public detectedAt!: Date;
  public reportedBy!: string;
  public assignedTo?: string;
  public affectedSystems?: string[];
  public evidence?: any[];
  public timeline?: any[];
  public resolvedAt?: Date;
  public postMortem?: string;
  public archivedAt?: Date;
  public archivedBy?: string;
  public archiveReason?: string;
  public escalationLevel?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Incident.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    incidentType: {
      type: DataTypes.ENUM(...Object.values(IncidentType)),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM(...Object.values(IncidentSeverity)),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(IncidentStatus)),
      defaultValue: IncidentStatus.DETECTED
    },
    playbookId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    playbookSnapshot: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    detectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reportedBy: {
      type: DataTypes.UUID,
      allowNull: false
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true
    },
    affectedSystems: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    evidence: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    timeline: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    postMortem: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archivedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    archiveReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    escalationLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  },
  {
    sequelize,
    tableName: 'incidents',
    timestamps: true
  }
);

export default Incident;
