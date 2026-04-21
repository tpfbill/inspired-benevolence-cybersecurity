import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';
import crypto from 'crypto';

interface SystemSettingAttributes {
  id: string;
  settingKey: string;
  settingValue: string | null;
  settingType: 'string' | 'number' | 'boolean' | 'password';
  description?: string;
  isEncrypted: boolean;
  updatedBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'id' | 'isEncrypted' | 'createdAt' | 'updatedAt'> {}

class SystemSetting extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
  public id!: string;
  public settingKey!: string;
  public settingValue!: string | null;
  public settingType!: 'string' | 'number' | 'boolean' | 'password';
  public description?: string;
  public isEncrypted!: boolean;
  public updatedBy?: string;
  public readonly updatedAt!: Date;
  public readonly createdAt!: Date;

  // Simple encryption/decryption (in production, use better key management)
  private static ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key';

  private static encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private static decrypt(encrypted: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.ENCRYPTION_KEY);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return encrypted; // Return as-is if decryption fails
    }
  }

  // Get decrypted value
  public getDecryptedValue(): string | null {
    if (!this.settingValue) return null;
    if (this.isEncrypted) {
      return SystemSetting.decrypt(this.settingValue);
    }
    return this.settingValue;
  }

  // Set value with encryption if needed
  public async setEncryptedValue(value: string, userId?: string): Promise<void> {
    const valueToStore = this.isEncrypted ? SystemSetting.encrypt(value) : value;
    await this.update({
      settingValue: valueToStore,
      updatedBy: userId,
      updatedAt: new Date()
    });
  }
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    settingKey: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    settingValue: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    settingType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'system_settings',
    timestamps: true
  }
);

export default SystemSetting;
