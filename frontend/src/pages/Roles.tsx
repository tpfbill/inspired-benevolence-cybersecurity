import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, Edit, Trash2, Lock, CheckCircle, X } from 'lucide-react';
import apiClient from '../api/client';

export default function Roles() {
  const queryClient = useQueryClient();
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [] as string[],
    color: '#6B7280'
  });

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiClient.get('/api/roles');
      return response.data;
    },
  });

  const { data: availablePermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await apiClient.get('/api/roles/permissions');
      return response.data;
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      return apiClient.post('/api/roles', roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowCreateRole(false);
      setNewRole({
        name: '',
        slug: '',
        description: '',
        permissions: [],
        color: '#6B7280'
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, updates }: { roleId: string; updates: any }) => {
      return apiClient.put(`/api/roles/${roleId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return apiClient.delete(`/api/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate(newRole);
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateRoleMutation.mutate({
        roleId: editingRole.id,
        updates: {
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions,
          color: editingRole.color
        }
      });
    }
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"? This cannot be undone.`)) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const togglePermission = (permission: string, isEditing: boolean = false) => {
    if (isEditing && editingRole) {
      const currentPermissions = editingRole.permissions || [];
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter((p: string) => p !== permission)
        : [...currentPermissions, permission];
      setEditingRole({ ...editingRole, permissions: newPermissions });
    } else {
      const currentPermissions = newRole.permissions || [];
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];
      setNewRole({ ...newRole, permissions: newPermissions });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const colorOptions = [
    { value: '#9333EA', label: 'Purple' },
    { value: '#DC2626', label: 'Red' },
    { value: '#2563EB', label: 'Blue' },
    { value: '#D97706', label: 'Orange' },
    { value: '#16A34A', label: 'Green' },
    { value: '#1F2937', label: 'Gray' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#14B8A6', label: 'Teal' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading roles...</div>
      </div>
    );
  }

  const systemRoles = roles?.filter((r: any) => r.isSystem) || [];
  const customRoles = roles?.filter((r: any) => !r.isSystem) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Create custom roles with specific permissions</p>
        </div>
        <button
          onClick={() => setShowCreateRole(!showCreateRole)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Custom Role
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{systemRoles.length}</div>
          <div className="text-sm text-gray-500">System Roles</div>
        </div>
        <div className="card text-center">
          <Shield className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{customRoles.length}</div>
          <div className="text-sm text-gray-500">Custom Roles</div>
        </div>
        <div className="card text-center">
          <CheckCircle className="h-8 w-8 text-success-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{availablePermissions?.length || 0}</div>
          <div className="text-sm text-gray-500">Permissions Available</div>
        </div>
      </div>

      {/* Create/Edit Role Form */}
      {(showCreateRole || editingRole) && (
        <div className="card bg-primary-50 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            {editingRole ? <Edit className="h-6 w-6 mr-2" /> : <Plus className="h-6 w-6 mr-2" />}
            {editingRole ? 'Edit Role' : 'Create Custom Role'}
          </h2>
          <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingRole ? editingRole.name : newRole.name}
                  onChange={(e) => {
                    if (editingRole) {
                      setEditingRole({ ...editingRole, name: e.target.value });
                    } else {
                      const name = e.target.value;
                      setNewRole({ ...newRole, name, slug: generateSlug(name) });
                    }
                  }}
                  className="input"
                  placeholder="SOC Team Lead"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug * {!editingRole && <span className="text-xs text-gray-500">(auto-generated)</span>}
                </label>
                <input
                  type="text"
                  required
                  value={editingRole ? editingRole.slug : newRole.slug}
                  onChange={(e) => !editingRole && setNewRole({ ...newRole, slug: e.target.value })}
                  className="input"
                  placeholder="soc_team_lead"
                  pattern="^[a-z_]+$"
                  title="Only lowercase letters and underscores"
                  disabled={!!editingRole}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingRole ? editingRole.description : newRole.description}
                  onChange={(e) => {
                    if (editingRole) {
                      setEditingRole({ ...editingRole, description: e.target.value });
                    } else {
                      setNewRole({ ...newRole, description: e.target.value });
                    }
                  }}
                  className="input"
                  placeholder="Team lead with elevated incident and playbook permissions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Color
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        if (editingRole) {
                          setEditingRole({ ...editingRole, color: color.value });
                        } else {
                          setNewRole({ ...newRole, color: color.value });
                        }
                      }}
                      className={`w-8 h-8 rounded-full border-2 ${
                        (editingRole ? editingRole.color : newRole.color) === color.value
                          ? 'border-gray-900'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions * (Select at least one)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-4 bg-white rounded border border-gray-200">
                {availablePermissions?.map((permission: any) => {
                  const isChecked = editingRole
                    ? editingRole.permissions?.includes(permission.key)
                    : newRole.permissions.includes(permission.key);
                  return (
                    <label
                      key={permission.key}
                      className={`flex items-start space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 ${
                        isChecked ? 'bg-primary-50 border border-primary-200' : 'border border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(permission.key, !!editingRole)}
                        className="mt-1 h-4 w-4 text-primary-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {editingRole ? editingRole.permissions?.length || 0 : newRole.permissions.length} permissions
              </p>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn btn-primary">
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateRole(false);
                  setEditingRole(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System Roles */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="h-6 w-6 mr-2 text-gray-600" />
          System Roles ({systemRoles.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemRoles.map((role: any) => (
            <div key={role.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="px-3 py-1 rounded text-sm font-semibold text-white"
                  style={{ backgroundColor: role.color }}
                >
                  {role.name}
                </div>
                <Lock className="h-4 w-4 text-gray-400" title="System role - cannot be edited" />
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{role.permissions?.length || 0} permissions</span>
                <span className="text-gray-400">Protected</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Roles */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-6 w-6 mr-2 text-primary-600" />
          Custom Roles ({customRoles.length})
        </h2>
        {customRoles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((role: any) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="px-3 py-1 rounded text-sm font-semibold text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.name}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-1 text-primary-600 hover:text-primary-800"
                      title="Edit role"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="p-1 text-danger-600 hover:text-danger-800"
                      title="Delete role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{role.permissions?.length || 0} permissions</span>
                  <span className="text-gray-400">Custom</span>
                </div>
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm: string) => (
                        <span key={perm} className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No custom roles yet</p>
            <p className="text-sm">Create your first custom role to get started!</p>
            <button
              onClick={() => setShowCreateRole(true)}
              className="btn btn-primary mt-4"
            >
              Create Custom Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
