import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

interface RoleAttributes {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  color: string;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public description!: string;
  public permissions!: string[];
  public color!: string;
  public isSystem!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#6B7280'
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: true
  }
);

export default Role;
