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
  steps: PlaybookStep[];
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
  public steps!: PlaybookStep[];
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
