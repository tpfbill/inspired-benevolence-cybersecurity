import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  ARCHIVED = 'archived'
}

interface AlertAttributes {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: AlertSeverity;
  status: AlertStatus;
  detectedAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  incidentId?: string;
  rawData?: any;
  threatIntelligence?: any;
  affectedAssets?: string[];
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public source!: string;
  public severity!: AlertSeverity;
  public status!: AlertStatus;
  public detectedAt!: Date;
  public acknowledgedBy?: string;
  public acknowledgedAt?: Date;
  public incidentId?: string;
  public rawData?: any;
  public threatIntelligence?: any;
  public affectedAssets?: string[];
  public archivedAt?: Date;
  public archivedBy?: string;
  public archiveReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
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
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM(...Object.values(AlertSeverity)),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AlertStatus)),
      defaultValue: AlertStatus.NEW
    },
    detectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    acknowledgedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    incidentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    rawData: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    threatIntelligence: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    affectedAssets: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
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
    }
  },
  {
    sequelize,
    tableName: 'alerts',
    timestamps: true
  }
);

export default Alert;
